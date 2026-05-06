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
<?php require_once __DIR__ . '/includes/header/header.php'; ?>
<?php require_once __DIR__ . '/page/modal.php'; ?>

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
    'my-jobs',
    'contact'
];

if (!in_array($page, $allowedPages, true)) {
    $page = 'dashboard';
}

$pageFile = __DIR__ . '/page/' . $page . '.php';

if (file_exists($pageFile)) {
    include $pageFile;
} else {
    echo '<div class="container my-5 text-white">';
    echo '<h2>Page not found</h2>';
    echo '<p>Missing file: ' . htmlspecialchars($page) . '.php</p>';
    echo '</div>';
}
?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.7.1.min.js" crossorigin="anonymous"></script>
<script src="../../assets/script/function.js"></script>
<script src="../../assets/script/tagscript.js"></script>
<?php require 'includes/footer/footer.php' ?>
</body>
</html>