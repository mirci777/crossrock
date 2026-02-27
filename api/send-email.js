const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// CHANGE THIS once your domain is verified in Resend:
// const FROM_EMAIL = 'Crossrock Capital <noreply@crossrockcapital.sk>';
const FROM_EMAIL = 'Crossrock Capital <onboarding@resend.dev>';

const SALES_EMAIL = 'info@crossrockcapital.sk';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const timestamp = new Date().toLocaleString('sk-SK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Bratislava'
  });

  try {
    // 1. Confirmation email to customer
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Ďakujeme za Váš záujem — Crossrock Capital',
      html: getCustomerEmail({ name, email, phone: phone || 'Neuvedené', message }),
    });

    // 2. Lead notification to sales
    await resend.emails.send({
      from: FROM_EMAIL,
      to: SALES_EMAIL,
      subject: `Nový lead: ${name}`,
      html: getSalesEmail({ name, email, phone: phone || 'Neuvedené', message, timestamp }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};

function getCustomerEmail(data) {
  return `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;">
<table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f5f5f5;">
<tr><td style="padding:40px 20px;">
<table cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#fff;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#000 0%,#1a1a1a 100%);padding:40px 40px 30px;text-align:center;">
<h1 style="margin:0;color:#D4AF37;font-size:28px;font-weight:700;">Crossrock Capital</h1>
<div style="width:60px;height:3px;background:#D4AF37;margin:20px auto 0;"></div>
</td></tr>

<!-- Check icon -->
<tr><td style="padding:40px 40px 0;text-align:center;">
<div style="width:80px;height:80px;background:#D4F4DD;border-radius:50%;margin:0 auto;line-height:80px;font-size:40px;">&#10003;</div>
</td></tr>

<!-- Content -->
<tr><td style="padding:30px 40px 40px;">
<h2 style="margin:0 0 20px;color:#000;font-size:24px;font-weight:700;text-align:center;">Ďakujeme za Váš záujem</h2>
<p style="margin:0 0 20px;color:#4a4a4a;font-size:16px;line-height:1.6;">Dobrý deň <strong>${data.name}</strong>,</p>
<p style="margin:0 0 20px;color:#4a4a4a;font-size:16px;line-height:1.6;">Ďakujeme za Váš záujem o služby Crossrock Capital. Váš dopyt sme úspešne prijali.</p>
<p style="margin:0 0 30px;color:#4a4a4a;font-size:16px;line-height:1.6;">Náš obchodný zástupca Vás bude kontaktovať <strong>do 24 hodín</strong>.</p>

<!-- Info box -->
<table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f8f8f8;margin-bottom:30px;">
<tr><td style="padding:25px;">
<h3 style="margin:0 0 15px;color:#D4AF37;font-size:14px;font-weight:700;text-transform:uppercase;">Vaše údaje</h3>
<table cellspacing="0" cellpadding="0" border="0" width="100%">
<tr><td style="padding:8px 0;color:#8a8a8a;font-size:14px;width:100px;">Meno:</td><td style="padding:8px 0;color:#000;font-size:14px;font-weight:600;">${data.name}</td></tr>
<tr><td style="padding:8px 0;color:#8a8a8a;font-size:14px;">Email:</td><td style="padding:8px 0;color:#000;font-size:14px;font-weight:600;">${data.email}</td></tr>
<tr><td style="padding:8px 0;color:#8a8a8a;font-size:14px;">Telefón:</td><td style="padding:8px 0;color:#000;font-size:14px;font-weight:600;">${data.phone}</td></tr>
</table>
</td></tr></table>

${data.message ? `
<table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#FFF9E6;border-left:4px solid #D4AF37;margin-bottom:30px;">
<tr><td style="padding:20px;">
<p style="margin:0 0 8px;color:#8a8a8a;font-size:13px;font-weight:600;">VAŠA SPRÁVA:</p>
<p style="margin:0;color:#4a4a4a;font-size:15px;line-height:1.6;">${data.message}</p>
</td></tr></table>
` : ''}

<table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:30px;">
<tr><td style="text-align:center;">
<a href="https://crossrockcapital.sk" style="display:inline-block;padding:16px 40px;background:#D4AF37;color:#000;text-decoration:none;font-weight:700;font-size:15px;">Navštíviť web</a>
</td></tr></table>

<p style="margin:0;color:#4a4a4a;font-size:15px;line-height:1.6;">S pozdravom,<br><strong style="color:#000;">Tím Crossrock Capital</strong></p>
</td></tr>

<!-- Footer -->
<tr><td style="background:#000;padding:30px 40px;text-align:center;">
<p style="margin:0 0 15px;color:rgba(255,255,255,0.9);font-size:13px;line-height:1.6;">
<strong style="color:#D4AF37;">Crossrock Capital a.s.</strong><br>
Lazaretská 3/A, 811 08 Bratislava<br>
<a href="mailto:info@crossrockcapital.sk" style="color:#D4AF37;text-decoration:none;">info@crossrockcapital.sk</a>
</p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}

function getSalesEmail(data) {
  return `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;">
<table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f5f5f5;">
<tr><td style="padding:40px 20px;">
<table cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:700px;margin:0 auto;background:#fff;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#D4AF37 0%,#E5C04A 100%);padding:30px 40px;">
<h1 style="margin:0;color:#000;font-size:24px;font-weight:700;">Nový lead z webu</h1>
<p style="margin:5px 0 0;color:rgba(0,0,0,0.7);font-size:14px;font-weight:600;">${data.timestamp}</p>
</td></tr>

<!-- Content -->
<tr><td style="padding:30px 40px;">

<!-- Summary -->
<div style="background:linear-gradient(135deg,#000 0%,#1a1a1a 100%);padding:25px;margin-bottom:25px;">
<h2 style="margin:0 0 5px;color:#D4AF37;font-size:20px;font-weight:700;">${data.name}</h2>
<p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">${data.email} | ${data.phone}</p>
</div>

<!-- Contact table -->
<table cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;margin-bottom:25px;">
<tr style="background:#f8f8f8;">
<td style="padding:12px 15px;border:1px solid #e5e5e5;font-weight:600;color:#4a4a4a;font-size:14px;">Meno</td>
<td style="padding:12px 15px;border:1px solid #e5e5e5;font-size:14px;font-weight:600;">${data.name}</td>
</tr>
<tr>
<td style="padding:12px 15px;border:1px solid #e5e5e5;font-weight:600;color:#4a4a4a;font-size:14px;">Email</td>
<td style="padding:12px 15px;border:1px solid #e5e5e5;"><a href="mailto:${data.email}" style="color:#D4AF37;text-decoration:none;font-weight:600;">${data.email}</a></td>
</tr>
<tr style="background:#f8f8f8;">
<td style="padding:12px 15px;border:1px solid #e5e5e5;font-weight:600;color:#4a4a4a;font-size:14px;">Telefón</td>
<td style="padding:12px 15px;border:1px solid #e5e5e5;"><a href="tel:${data.phone}" style="color:#D4AF37;text-decoration:none;font-weight:600;">${data.phone}</a></td>
</tr>
<tr>
<td style="padding:12px 15px;border:1px solid #e5e5e5;font-weight:600;color:#4a4a4a;font-size:14px;">Čas</td>
<td style="padding:12px 15px;border:1px solid #e5e5e5;font-size:14px;">${data.timestamp}</td>
</tr>
</table>

${data.message ? `
<div style="background:#FFF9E6;border-left:4px solid #D4AF37;padding:20px;margin-bottom:25px;">
<h3 style="margin:0 0 12px;color:#000;font-size:14px;font-weight:700;">Správa:</h3>
<p style="margin:0;color:#4a4a4a;font-size:15px;line-height:1.7;font-style:italic;">"${data.message}"</p>
</div>
` : ''}

<!-- CTA buttons -->
<table cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td style="padding-right:8px;width:50%;"><a href="mailto:${data.email}" style="display:block;padding:16px;background:#000;color:#D4AF37;text-decoration:none;font-weight:700;text-align:center;font-size:14px;">Napísať email</a></td>
<td style="padding-left:8px;width:50%;"><a href="tel:${data.phone}" style="display:block;padding:16px;background:#D4AF37;color:#000;text-decoration:none;font-weight:700;text-align:center;font-size:14px;">Zavolať</a></td>
</tr>
</table>

</td></tr>

<!-- Footer -->
<tr><td style="background:#f8f8f8;padding:20px 40px;border-top:1px solid #e5e5e5;text-align:center;">
<p style="margin:0;color:#8a8a8a;font-size:12px;">Crossrock Capital • Automatická notifikácia z webu</p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}
