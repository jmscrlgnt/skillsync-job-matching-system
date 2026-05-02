<?php
require_once __DIR__ . '/../php/env_helper.php';

$envPath = realpath(__DIR__ . '/../../.env');
if (!$envPath) {
    die('.env file not found.');
}

loadEnv($envPath);

$host = $_ENV['DB_HOST'] ?? null;
$user = $_ENV['DB_USER'] ?? null;
$password = $_ENV['DB_PASSWORD'] ?? '';
$database = $_ENV['DB_NAME'] ?? null;
$port = isset($_ENV['DB_PORT']) ? (int)$_ENV['DB_PORT'] : null;

if (!$host || !$user || !$database || !$port) {
    die('Missing DB config in .env');
}

$conn = new mysqli($host, $user, $password, $database, $port);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
$conn->query("SET time_zone = '+08:00'");
?>