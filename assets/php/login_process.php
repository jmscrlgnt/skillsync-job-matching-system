<?php
session_start();
date_default_timezone_set('Asia/Manila');

require_once '../page/db.php';

/* Get form data */
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if ($email === '' || $password === '') {
    $_SESSION['login_error'] = "Please fill in all fields.";
    header("Location: ../../index.php?page=login");
    exit;
}

/* Check user */
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();
$stmt->close();

/* Validate email + password */
if (!$user || !password_verify($password, $user['password'])) {
    $_SESSION['login_error'] = "Invalid email or password.";
    header("Location: ../../index.php?page=login");
    exit;
}

/* ========================= */
/* ✅ LOGIN SUCCESS */
/* ========================= */

$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'];

header("Location: ../../index.php?page=homepage");
exit;