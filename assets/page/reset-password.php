<?php
require_once 'assets/page/db.php';

$token = $_GET['token'] ?? '';
$validToken = false;

if ($token !== '') {
    $stmt = $conn->prepare("SELECT email FROM password_resets WHERE token = ? AND expires_at > NOW() LIMIT 1");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    $validToken = $result->fetch_assoc();
    $stmt->close();
}
?>

<?php if (!empty($_SESSION['reset_error'])): ?>
  <div class="alert alert-danger">
    <?= htmlspecialchars($_SESSION['reset_error']); ?>
  </div>
  <?php unset($_SESSION['reset_error']); ?>
<?php endif; ?>

<section class="login-section">
  <div class="regisform-container">
    <h2 class="regisform-title">Reset Password</h2>

    <?php if (!$validToken): ?>
      <div class="alert alert-danger">Invalid or expired reset link.</div>
    <?php else: ?>
    <form id="resetPasswordForm" method="POST" action="assets/php/reset_password_process.php">
  <input type="hidden" name="token" value="<?= htmlspecialchars($token); ?>">

  <label for="newPassword">New Password</label>
  <div class="password-field-wrap">
    <input
      type="password"
      id="newPassword"
      name="password"
      class="form-control password-input"
      placeholder="Enter new password"
      required
    >
    <button type="button" class="password-toggle-btn" onclick="togglePassword('newPassword', this)">
      <i class="fa fa-eye-slash"></i>
    </button>
  </div>

<small class="text-muted d-block mt-2">
  Password must be at least 8 characters and include uppercase, lowercase, and a number.
</small>

  <label for="confirm-password" class="mt-3">Confirm Password</label>
  <div class="password-field-wrap">
    <input
      type="password"
      id="confirm-password"
      name="confirm_password"
      class="form-control password-input"
      placeholder="Confirm new password"
      required
    >
    <button type="button" class="password-toggle-btn" onclick="togglePassword('confirm-password', this)">
      <i class="fa fa-eye-slash"></i>
    </button>
  </div>

  
  <button type="submit" class="regisform-register-btn mt-3 w-100">
    Reset Password
  </button>
</form>
    <?php endif; ?>
  </div>
</section>