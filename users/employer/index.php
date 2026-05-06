<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Skill Sync</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="../../assets/css/style.css">
</head>

<body>
<?php require_once 'includes/header/header.php' ?>
<?php require_once 'page/modal.php' ?>
<?php
$page = $_GET['page'] ?? 'dashboard';

$allowedPages = [
    'dashboard',
    'browse',
    'user-profile',
    'settings',
    'notifications',
    'messages',
    'developers',
    'about',
    'contact'
];

if (!in_array($page, $allowedPages, true)) {
    $page = 'dashboard';
}

$pageFile = __DIR__ . '/page/' . $page . '.php';

if (file_exists($pageFile)) {
    include $pageFile;
} else {
    echo '<div class="container my-5 text-white"><h2>Page not found</h2></div>';
}
?>

<?php require 'includes/footer/footer.php' ?>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.7.1.min.js" crossorigin="anonymous"></script>
<script src="../../assets/script/function.js"></script>
</body>
</html>