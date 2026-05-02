<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Skill Sync</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body data-logged-in="false">
<?php require_once 'assets/includes/header/header.php'; ?>
<?php
$page = $_GET['page'] ?? 'homepage';
$allowedPages = ['homepage', 'about','contact', 'login', 'register', 'developers','forgot-password','reset-password'];
if (!in_array($page, $allowedPages, true)) {
  $page = 'homepage';
}
include 'assets/page/' . $page . '.php';
?>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.7.1.min.js" crossorigin="anonymous"></script>
<?php require 'assets/includes/footer/footer.php'; ?>
<script src="assets/script/function.js"></script>
</body>
</html>