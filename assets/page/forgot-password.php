
<?php if (!empty($_SESSION['forgot_error'])): ?>
  <div class="alert alert-danger">
    <?= htmlspecialchars($_SESSION['forgot_error']); ?>
  </div>
  <?php unset($_SESSION['forgot_error']); ?>
<?php endif; ?>

<?php if (!empty($_SESSION['forgot_success'])): ?>
  <div class="alert alert-success">
    <?= htmlspecialchars($_SESSION['forgot_success']); ?>
  </div>

  <?php unset($_SESSION['forgot_success']); ?>
<?php endif; ?>

<section class="login-section">
  <div class="regisform-container">
    <h2 class="regisform-title">Forgot Password</h2>
    <p class="forgot-password-subtext">Enter your email and we’ll send you a password reset link.</p>

    <form method="POST" action="assets/php/forgot_password_process.php">
      <label for="forgot-email">Email</label>
      <input
        type="email"
        id="forgot-email"
        name="email"
        class="form-control"
        placeholder="Enter your email"
        required
      >

      <button type="submit" class="regisform-register-btn mt-3 w-100">
        Send Reset Link
      </button>
    </form>
  </div>
</section>