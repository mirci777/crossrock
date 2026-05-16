// Vercel serverless function
// All emails handled by Ecomail — no Resend dependency

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { name, email, phone, interest, message, note, source, amount } = req.body || {};

    if (!name || !email) return res.status(400).json({ error: 'Missing required fields: name, email' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });

    const safeName     = String(name).slice(0, 100);
    const safeEmail    = String(email).slice(0, 100);
    const safePhone    = String(phone || 'Neuvedené').slice(0, 30);
    const safeInterest = String(interest || '').slice(0, 100);
    const safeMessage  = String(message || '').slice(0, 2000);
    const safeNote     = String(note || '').slice(0, 2000);
    const safeSource   = String(source || '');
    const amountInt    = amount ? parseInt(String(amount).replace(/[^0-9]/g, ''), 10) || null : null;

    const isInvesticie = safeSource === 'investicie';

    const listId = isInvesticie
        ? process.env.ECOMAIL_LIST_INVESTICIE
        : process.env.ECOMAIL_LIST_FINANCOVANIE;

    const customFields = isInvesticie
        ? buildCustomFields(safeInterest, amountInt, safeNote)
        : null;

    try {
        await addToEcomail(process.env.ECOMAIL_API_KEY, listId, safeEmail, safeName, safePhone, customFields);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Ecomail error:', err);
        return res.status(500).json({ error: 'Failed to subscribe', details: err.message });
    }
};

function buildCustomFields(interest, amountInt, message) {
    const fields = {};
    const produkt = interest.replace(/\s*-.*$/, '').trim();
    if (produkt)   fields.produkt = produkt;
    if (amountInt) fields.suma    = amountInt;
    if (message)   fields.sprava  = message;
    return Object.keys(fields).length ? fields : null;
}

async function addToEcomail(apiKey, listId, email, name, phone, customFields) {
    if (!apiKey || !listId) throw new Error('Ecomail config missing');

    const subscriberData = { email, name, phone };
    if (customFields) subscriberData.custom_fields = customFields;

    const response = await fetch(`https://api2.ecomailapp.cz/lists/${listId}/subscribe`, {
        method: 'POST',
        headers: { 'key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            subscriber_data:        subscriberData,
            trigger_autoresponders: true,
            trigger_notification:   true,
            update_existing:        true,
            skip_confirmation:      true,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Ecomail ${response.status}: ${body}`);
    }
}
