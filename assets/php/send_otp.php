<?php
declare(strict_types=1);

ob_start();
session_start();
date_default_timezone_set('Asia/Manila');

header('Content-Type: application/json; charset=utf-8');

require_once '../../PHPMailer/src/Exception.php';
require_once '../../PHPMailer/src/PHPMailer.php';
require_once '../../PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once '../page/db.php';
require_once 'env_helper.php';

loadEnv(__DIR__ . '/../../.env');

function jsonResponse(array $payload, int $statusCode = 200): void {
    http_response_code($statusCode);
    ob_clean();
    echo json_encode($payload);
    exit;
}

try {
    $email = trim($_POST['email'] ?? '');

    if ($email === '') {
        jsonResponse(['status' => 'error', 'message' => 'Email is required.'], 400);
    }

// 60-second cooldown per email (database-based)
$check = $conn->prepare("
    SELECT created_at
    FROM email_otps
    WHERE email = ?
    ORDER BY id DESC
    LIMIT 1
");

if (!$check) {
    jsonResponse(['status' => 'error', 'message' => 'Failed to check OTP cooldown.'], 500);
}

$check->bind_param("s", $email);
$check->execute();
$result = $check->get_result();
$latest = $result->fetch_assoc();
$check->close();

if ($latest && !empty($latest['created_at'])) {
    $lastTime = strtotime($latest['created_at']);
    $now = time();
    $remaining = 60 - ($now - $lastTime);

    if ($remaining > 0) {
        jsonResponse([
            'status' => 'error',
            'message' => "Please wait {$remaining} seconds before requesting another OTP."
        ], 429);
    }
}

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['status' => 'error', 'message' => 'Please enter a valid email address.'], 400);
    }

    if (!isset($_SESSION['otp_requests'])) {
        $_SESSION['otp_requests'] = [];
    }

    $currentTime = time();

    $_SESSION['otp_requests'] = array_values(array_filter(
        $_SESSION['otp_requests'],
        fn($t) => ($currentTime - $t) < 300
    ));

    if (count($_SESSION['otp_requests']) >= 3) {
        jsonResponse([
            'status' => 'error',
            'message' => 'Too many OTP requests. Please wait 5 minutes and try again.'
        ], 429);
    }

    $_SESSION['otp_requests'][] = $currentTime;

    $otp = (string) random_int(100000, 999999);
    $expires = date('Y-m-d H:i:s', strtotime('+5 minutes'));

    $del = $conn->prepare("DELETE FROM email_otps WHERE email = ?");
    if (!$del) {
        jsonResponse(['status' => 'error', 'message' => 'Failed to prepare OTP cleanup query.'], 500);
    }
    $del->bind_param("s", $email);
    $del->execute();
    $del->close();

   $stmt = $conn->prepare("
    INSERT INTO email_otps (email, otp, expires_at, created_at)
    VALUES (?, ?, ?, NOW())
");
    if (!$stmt) {
        jsonResponse(['status' => 'error', 'message' => 'Failed to prepare OTP insert query.'], 500);
    }

    $stmt->bind_param("sss", $email, $otp, $expires);

    if (!$stmt->execute()) {
        $stmt->close();
        jsonResponse(['status' => 'error', 'message' => 'Failed to save OTP.'], 500);
    }
    $stmt->close();

    $mailHost = $_ENV['MAIL_HOST'] ?? '';
    $mailPort = (int)($_ENV['MAIL_PORT'] ?? 587);
    $mailUser = $_ENV['MAIL_USER'] ?? '';
    $mailPass = $_ENV['MAIL_PASS'] ?? '';
    $mailFrom = $_ENV['MAIL_FROM_EMAIL'] ?? $mailUser;
    $mailName = $_ENV['MAIL_FROM_NAME'] ?? 'SkillSync';

    if ($mailHost === '' || $mailUser === '') {
        jsonResponse(['status' => 'error', 'message' => 'Mail server is not configured properly in .env.'], 500);
    }

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $mailHost;
    $mail->SMTPAuth = true;
    $mail->Username = $mailUser;
    $mail->Password = $mailPass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $mailPort;

    $mail->setFrom($mailFrom, $mailName);
    $mail->addAddress($email);

    $mail->isHTML(true);
    $mail->Subject = 'Your SkillSync OTP Code';
    $mail->Body = "Your OTP is: <b>{$otp}</b><br>This code expires in 5 minutes.";
    $mail->AltBody = "Your OTP is: {$otp}. This code expires in 5 minutes.";

    $mail->send();

    jsonResponse(['status' => 'success', 'message' => 'OTP sent successfully.']);
} catch (Exception $e) {
    jsonResponse(['status' => 'error', 'message' => 'Failed to send OTP: ' . $e->getMessage()], 500);
} catch (Throwable $e) {
    jsonResponse(['status' => 'error', 'message' => 'Unexpected server error: ' . $e->getMessage()], 500);
}