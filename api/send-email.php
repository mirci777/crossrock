<?php
// api/send-email.php
// PHP replacement for Vercel serverless function
// Sends 2 emails via Resend API: customer confirmation + sales notification

// ============================================
// CONFIGURATION — loaded from config.php
// ============================================
require_once __DIR__ . '/config.php';

$FROM_CUSTOMER = 'Crossrock Capital <noreply@crossrockcapital.sk>';
$FROM_SALES = 'Crossrock Lead <leads@crossrockcapital.sk>';

// ============================================
// CORS & REQUEST HANDLING
// ============================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ============================================
// PARSE INPUT
// ============================================
$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '') ?: 'Neuvedené';
$interest = trim($input['interest'] ?? '') ?: '';
$message = trim($input['message'] ?? '') ?: '';
$source = trim($input['source'] ?? '') ?: '';
$amountRaw = trim($input['amount'] ?? '');
$amountInt = $amountRaw ? (int) preg_replace('/[^0-9]/', '', $amountRaw) : null;

// Validation
if (empty($name) || empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: name, email']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Sanitize all inputs
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$interest = htmlspecialchars($interest, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// Timestamp
$timestamp = (new IntlDateFormatter(
    'sk_SK',
    IntlDateFormatter::LONG,
    IntlDateFormatter::SHORT,
    'Europe/Bratislava'
))->format(new DateTime());

// ============================================
// SEND EMAILS
// ============================================
try {
    $isInvesticie = ($source === 'investicie');

    // 1. Customer confirmation email (Resend) — skip for investície, Ecomail handles it
    if (!$isInvesticie) {
        $customerHtml = getCustomerEmailTemplate($name, $email, $phone, $interest, $message);
        sendResendEmail(
            $RESEND_API_KEY,
            $FROM_CUSTOMER,
            $email,
            'Ďakujeme za Váš záujem - Crossrock Capital',
            $customerHtml
        );
    }

    // 2. Sales notification email
    $subject = $interest
        ? "Nový lead: {$name} - {$interest}"
        : "Nový lead: {$name}";
    $salesHtml = getSalesEmailTemplate($name, $email, $phone, $interest, $message, $timestamp);
    sendResendEmail(
        $RESEND_API_KEY,
        $FROM_SALES,
        $SALES_EMAIL,
        $subject,
        $salesHtml
    );

    // 3. Add to Ecomail list with custom fields
    $listId = $isInvesticie ? $ECOMAIL_LIST_INVESTICIE : $ECOMAIL_LIST_FINANCOVANIE;
    $customFields = $isInvesticie ? [
        'produkt' => preg_replace('/\s*-.*$/', '', $interest),
        'suma'    => $amountInt,
        'sprava'  => $message ?: null,
    ] : [];
    try { addToEcomail($ECOMAIL_API_KEY, $listId, $email, $name, $phone, $customFields); } catch (Exception $e) {}

    echo json_encode(['success' => true, 'message' => 'Emails sent successfully']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email', 'details' => $e->getMessage()]);
}

// ============================================
// ECOMAIL API CALL
// ============================================
function addToEcomail($apiKey, $listId, $email, $name, $phone, $customFields = [])
{
    $subscriberData = array_filter([
        'email'  => $email,
        'name'   => $name,
        'phone'  => $phone,
    ]);

    if (!empty($customFields)) {
        $filtered = [];
        foreach ($customFields as $k => $v) {
            if ($v !== null && $v !== '') $filtered[$k] = $v;
        }
        if (!empty($filtered)) $subscriberData['custom_fields'] = $filtered;
    }

    $ch = curl_init("https://api2.ecomailapp.cz/lists/{$listId}/subscribe");
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'key: ' . $apiKey,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'subscriber_data'        => $subscriberData,
            'trigger_autoresponders' => true,
            'update_existing'        => true,
            'skip_confirmation'      => true,
        ]),
    ]);
    curl_exec($ch);
    curl_close($ch);
    // Ecomail errors are non-fatal — email delivery already succeeded
}

// ============================================
// RESEND API CALL
// ============================================
function sendResendEmail($apiKey, $from, $to, $subject, $html)
{
    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'from' => $from,
            'to' => [$to],
            'subject' => $subject,
            'html' => $html,
        ]),
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        throw new Exception("cURL error: {$error}");
    }

    if ($httpCode >= 400) {
        $body = json_decode($response, true);
        $msg = $body['message'] ?? $response;
        throw new Exception("Resend API error ({$httpCode}): {$msg}");
    }
}

// ============================================
// EMAIL TEMPLATES
// ============================================
function getCustomerEmailTemplate($name, $email, $phone, $interest, $message)
{
    $interestRow = $interest ? "
                                            <tr>
                                                <td style=\"padding: 8px 0; color: #8a8a8a; font-size: 14px;\">Záujem o:</td>
                                                <td style=\"padding: 8px 0; color: #D4AF37; font-size: 14px; font-weight: 700;\">{$interest}</td>
                                            </tr>" : '';

    $messageBlock = $message ? "
                            <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\" style=\"background: #FFF9E6; border-left: 4px solid #D4AF37; border-radius: 4px; margin-bottom: 30px;\">
                                <tr>
                                    <td style=\"padding: 20px;\">
                                        <p style=\"margin: 0 0 8px 0; color: #8a8a8a; font-size: 13px; font-weight: 600;\">VAŠA SPRÁVA:</p>
                                        <p style=\"margin: 0; color: #4a4a4a; font-size: 15px; line-height: 1.6;\">{$message}</p>
                                    </td>
                                </tr>
                            </table>" : '';

    return <<<HTML
<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 40px 30px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #D4AF37; font-size: 28px; font-weight: 700;">Crossrock Capital</h1>
                            <div style="width: 60px; height: 3px; background: #D4AF37; margin: 20px auto 0;"></div>
                        </td>
                    </tr>

                    <!-- Success Icon -->
                    <tr>
                        <td style="padding: 40px 40px 0 40px; text-align: center;">
                            <div style="width: 80px; height: 80px; background: #D4F4DD; border-radius: 50%; margin: 0 auto; display: inline-block;">
                                <div style="padding-top: 20px; font-size: 40px;">&#10003;</div>
                            </div>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px 40px 40px 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 700; text-align: center;">Ďakujeme za Váš záujem</h2>

                            <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">Dobrý deň <strong>{$name}</strong>,</p>

                            <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">Ďakujeme za Váš záujem o služby Crossrock Capital. Váš dopyt sme úspešne prijali.</p>

                            <p style="margin: 0 0 30px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">Náš obchodný zástupca Vás bude kontaktovať <strong>do 24 hodín</strong>.</p>

                            <!-- Info Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8f8f8; border-radius: 8px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h3 style="margin: 0 0 15px 0; color: #D4AF37; font-size: 14px; font-weight: 700; text-transform: uppercase;">Vaše údaje</h3>

                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 8px 0; color: #8a8a8a; font-size: 14px;">Meno:</td>
                                                <td style="padding: 8px 0; color: #000000; font-size: 14px; font-weight: 600;">{$name}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #8a8a8a; font-size: 14px;">Email:</td>
                                                <td style="padding: 8px 0; color: #000000; font-size: 14px; font-weight: 600;">{$email}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #8a8a8a; font-size: 14px;">Telefón:</td>
                                                <td style="padding: 8px 0; color: #000000; font-size: 14px; font-weight: 600;">{$phone}</td>
                                            </tr>{$interestRow}
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            {$messageBlock}

                            <!-- CTA -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="https://crossrockcapital.sk" style="display: inline-block; padding: 16px 40px; background: #D4AF37; color: #000000; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px;">Navštíviť web</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; color: #4a4a4a; font-size: 15px; line-height: 1.6;">S pozdravom,<br><strong style="color: #000000;">Tím Crossrock Capital</strong></p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #000000; padding: 30px 40px; text-align: center;">
                            <p style="margin: 0 0 15px 0; color: rgba(255,255,255,0.9); font-size: 13px; line-height: 1.6;">
                                <strong style="color: #D4AF37;">Crossrock Capital a.s.</strong><br>
                                Lazaretská 3/A, 811 08 Bratislava<br>
                                <a href="mailto:info@crossrockcapital.sk" style="color: #D4AF37; text-decoration: none;">info@crossrockcapital.sk</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
}

function getSalesEmailTemplate($name, $email, $phone, $interest, $message, $timestamp)
{
    $interestDisplay = $interest ?: 'Kontaktný formulár';

    $messageBlock = $message ? "
                            <div style=\"background: #FFF9E6; border-left: 4px solid #D4AF37; padding: 20px; margin-bottom: 25px; border-radius: 4px;\">
                                <h3 style=\"margin: 0 0 12px 0; color: #000000; font-size: 14px; font-weight: 700;\">SPRÁVA:</h3>
                                <p style=\"margin: 0; color: #4a4a4a; font-size: 15px; line-height: 1.7;\">\"{$message}\"</p>
                            </div>" : '';

    return <<<HTML
<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #D4AF37 0%, #E5C04A 100%); padding: 30px 40px;">
                            <h1 style="margin: 0; color: #000000; font-size: 24px; font-weight: 700;">Nový lead z webu</h1>
                            <p style="margin: 5px 0 0 0; color: rgba(0,0,0,0.7); font-size: 14px; font-weight: 600;">{$timestamp}</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px 40px;">

                            <!-- Summary -->
                            <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                                <h2 style="margin: 0 0 15px 0; color: #D4AF37; font-size: 20px; font-weight: 700;">{$name}</h2>
                                <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                    Má záujem o: <strong style="color: #D4AF37; font-size: 18px;">{$interestDisplay}</strong>
                                </p>
                            </div>

                            <!-- Contact -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: collapse; margin-bottom: 25px;">
                                <tr style="background: #f8f8f8;">
                                    <td style="padding: 12px 15px; border: 1px solid #e5e5e5; font-weight: 600; color: #4a4a4a; font-size: 14px;">Email</td>
                                    <td style="padding: 12px 15px; border: 1px solid #e5e5e5;">
                                        <a href="mailto:{$email}" style="color: #D4AF37; text-decoration: none; font-weight: 600;">{$email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 15px; border: 1px solid #e5e5e5; font-weight: 600; color: #4a4a4a; font-size: 14px;">Telefón</td>
                                    <td style="padding: 12px 15px; border: 1px solid #e5e5e5;">
                                        <a href="tel:{$phone}" style="color: #D4AF37; text-decoration: none; font-weight: 600;">{$phone}</a>
                                    </td>
                                </tr>
                            </table>

                            {$messageBlock}

                            <!-- CTA -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-right: 8px; width: 50%;">
                                        <a href="mailto:{$email}" style="display: block; padding: 16px; background: #000000; color: #D4AF37; text-decoration: none; border-radius: 6px; font-weight: 700; text-align: center;">Email</a>
                                    </td>
                                    <td style="padding-left: 8px; width: 50%;">
                                        <a href="tel:{$phone}" style="display: block; padding: 16px; background: #D4AF37; color: #000000; text-decoration: none; border-radius: 6px; font-weight: 700; text-align: center;">Zavolať</a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8f8f8; padding: 20px 40px; border-top: 1px solid #e5e5e5; text-align: center;">
                            <p style="margin: 0; color: #8a8a8a; font-size: 12px;">
                                Crossrock Capital &bull; Automatická notifikácia
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
}
