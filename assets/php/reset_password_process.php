<?php
session_start();
date_default_timezone_set('Asia/Manila');
require_once '../page/db.php';

$token = trim($_POST['token'] ?? '');
$password = $_POST['password'] ?? '';
$confirm = $_POST['confirm_password'] ?? '';

if ($token === '' || trim($password) === '' || trim($confirm) === '') {
    $_SESSION['reset_error'] = 'All fields are required.';
    header('Location: ../../index.php?page=reset-password&token=' . urlencode($token));
    exit;
}

if (strlen($password) < 8) {
    $_SESSION['reset_error'] = 'Password must be at least 8 characters.';
    header('Location: ../../index.php?page=reset-password&token=' . urlencode($token));
    exit;
}

if (!preg_match('/[A-Z]/', $password)) {
    $_SESSION['reset_error'] = 'Password must contain at least one uppercase letter.';
    header('Location: ../../index.php?page=reset-password&token=' . urlencode($token));
    exit;
}

if (!preg_match('/[a-z]/', $password)) {
    $_SESSION['reset_error'] = 'Password must contain at least one lowercase letter.';
    header('Location: ../../index.php?page=reset-password&token=' . urlencode($token));
    exit;
}

if (!preg_match('/[0-9]/', $password)) {
    $_SESSION['reset_error'] = 'Password must contain at least one number.';
    header('Location: ../../index.php?page=reset-password&token=' . urlencode($token));
    exit;
}

if ($password !== $confirm) {
    $_SESSION['reset_error'] = 'Passwords do not match.';
    header('Location: ../../index.php?page=reset-password&token=' . urlencode($token));
    exit;
}

$stmt = $conn->prepare("SELECT email FROM password_resets WHERE token = ? AND expires_at > NOW() LIMIT 1");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

if (!$row) {
    $_SESSION['reset_error'] = 'Invalid or expired token.';
    header('Location: ../../index.php?page=login');
    exit;
}

$email = $row['email'];

/* Node bcrypt compatible hash */
$hashed = password_hash($password, PASSWORD_BCRYPT);
$hashed = str_replace('$2y$', '$2b$', $hashed);

$update = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
$update->bind_param("ss", $hashed, $email);
$update->execute();
$update->close();

$delete = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
$delete->bind_param("s", $email);
$delete->execute();
$delete->close();

$_SESSION['login_success'] = 'Password reset successful!';
header('Location: ../../index.php?page=login');
exit;
?>