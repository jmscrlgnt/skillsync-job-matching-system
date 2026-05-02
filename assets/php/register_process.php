<?php
header('Location: ../../index.php?page=register');
exit;


$name = trim($_POST['name'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$role = trim($_POST['role'] ?? '');
$password = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirm_password'] ?? '';
$otp = trim($_POST['otp'] ?? '');

if ($name === '' || $email === '' || $role === '' || $password === '' || $confirmPassword === '' || $otp === '') {
    $_SESSION['register_error'] = 'Please fill in all required fields.';
    header('Location: ../../index.php?page=register');
    exit;
}

if ($password !== $confirmPassword) {
    $_SESSION['register_error'] = 'Passwords do not match.';
    header('Location: ../../index.php?page=register');
    exit;
}

if (strlen($password) < 8) {
    $_SESSION['register_error'] = 'Password must be at least 8 characters.';
    header('Location: ../../index.php?page=register');
    exit;
}

if (!in_array($role, ['jobseeker', 'employer'], true)) {
    $_SESSION['register_error'] = 'Invalid role selected.';
    header('Location: ../../index.php?page=register');
    exit;
}

/* Check if email already exists */
$checkUser = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$checkUser->bind_param("s", $email);
$checkUser->execute();
$userResult = $checkUser->get_result();
$existingUser = $userResult->fetch_assoc();
$checkUser->close();

if ($existingUser) {
    $_SESSION['register_error'] = 'Email is already registered.';
    header('Location: ../../index.php?page=register');
    exit;
}

/* Verify OTP */
$checkOtp = $conn->prepare("
    SELECT otp
    FROM email_otps
    WHERE email = ? AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
");
$checkOtp->bind_param("s", $email);
$checkOtp->execute();
$otpResult = $checkOtp->get_result();
$otpRow = $otpResult->fetch_assoc();
$checkOtp->close();

if (!$otpRow || $otpRow['otp'] !== $otp) {
    $_SESSION['register_error'] = 'Invalid or expired OTP.';
    header('Location: ../../index.php?page=register');
    exit;
}

/* Hash password */
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$hashedPassword = str_replace('$2y$', '$2b$', $hashedPassword);

/* Insert user */
$insertUser = $conn->prepare("
    INSERT INTO users (name, phone, email, password, role)
    VALUES (?, ?, ?, ?, ?)
");
$insertUser->bind_param("sssss", $name, $phone, $email, $hashedPassword, $role);

if (!$insertUser->execute()) {
    $_SESSION['register_error'] = 'Registration failed. Please try again.';
    header('Location: ../../index.php?page=register');
    exit;
}
$insertUser->close();

/* Delete used OTP */
$deleteOtp = $conn->prepare("DELETE FROM email_otps WHERE email = ?");
$deleteOtp->bind_param("s", $email);
$deleteOtp->execute();
$deleteOtp->close();

$_SESSION['register_success'] = 'Registration successful. You can now log in.';
header('Location: ../../index.php?page=login');
exit;
?>