<?php
session_start();
date_default_timezone_set('Asia/Manila');

require_once '../../PHPMailer/src/Exception.php';
require_once '../../PHPMailer/src/PHPMailer.php';
require_once '../../PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once '../page/db.php';
require_once 'env_helper.php';
loadEnv(__DIR__ . '/../../.env');


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../../index.php?page=forgot-password');
    exit;
}

$email = trim($_POST['email'] ?? '');

if ($email === '') {
    $_SESSION['forgot_error'] = 'Please enter your email.';
    header('Location: ../../index.php?page=forgot-password');
    exit;
}

/* Check if email exists */
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

/* Always show success (security best practice) */
if (!$user) {
   $_SESSION['forgot_success'] = 'If the email exists in our system, a reset link has been sent.';
    header('Location: ../../index.php?page=forgot-password');
    exit;
}

$conn->query("DELETE FROM password_resets WHERE expires_at <= NOW()");

/* Cooldown: allow only 1 request every 60 seconds */
$cooldown = $conn->prepare("
    SELECT created_at
    FROM password_resets
    WHERE email = ?
    ORDER BY created_at DESC
    LIMIT 1
");
$cooldown->bind_param("s", $email);
$cooldown->execute();
$cooldownResult = $cooldown->get_result();
$lastRequest = $cooldownResult->fetch_assoc();
$cooldown->close();

if ($lastRequest) {
    $lastTime = strtotime($lastRequest['created_at']);
    $now = time();

    if (($now - $lastTime) < 60) {
        $_SESSION['forgot_error'] = 'Please wait 60 seconds before requesting another reset link.';
        header('Location: ../../index.php?page=forgot-password');
        exit;
    }
}

$cleanup = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
$cleanup->bind_param("s", $email);
$cleanup->execute();
$cleanup->close();

/* Generate token */
$token = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

/* Save into password_resets table */
$insert = $conn->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)");
$insert->bind_param("sss", $email, $token, $expires);
$insert->execute();
$insert->close();

/* Generate reset link */
$frontendUrl = 'http://localhost:8000';
$frontendUrl = "http://localhost:8000";
$resetLink = $frontendUrl . "/index.php?page=reset-password&token=" . urlencode($token) . "&email=" . urlencode($email);

$mailHost = $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com';
$mailPort = (int)($_ENV['MAIL_PORT'] ?? 587);
$mailSecure = $_ENV['MAIL_SECURE'] ?? 'tls';
$mailUser = $_ENV['MAIL_USER'] ?? '';
$mailPass = $_ENV['MAIL_PASS'] ?? '';
$mailFromEmail = $_ENV['MAIL_FROM_EMAIL'] ?? $mailUser;
$mailFromName = $_ENV['MAIL_FROM_NAME'] ?? 'SkillSync';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $mailHost;
    $mail->SMTPAuth   = true;

    // ✅ YOUR REAL GMAIL
   $mail->Username = $mailUser;

    // ✅ APP PASSWORD (NO SPACES)
    $mail->Password = $mailPass;

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $mailPort;

    // Email
    $mail->setFrom($mailFromEmail, $mailFromName);
    $mail->addAddress($email);

    $mail->isHTML(true);
    $mail->Subject = 'Reset Your Password - SkillSync';
    $mail->Body = "
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password:</p>
        <a href='{$resetLink}'>{$resetLink}</a>
        <p>This link will expire in 1 hour.</p>
    ";

    $mail->send();

    
   $_SESSION['forgot_success'] = 'If the email exists in our system, a reset link has been sent.';
} catch (Exception $e) {
    $_SESSION['forgot_error'] = 'Email could not be sent: ' . $mail->ErrorInfo;
}

header('Location: ../../index.php?page=forgot-password');
exit;
?>