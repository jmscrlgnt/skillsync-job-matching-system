<?php if (!empty($_SESSION['login_success'])): ?>
  <div class="alert alert-success">
    <?= htmlspecialchars($_SESSION['login_success']); ?>
  </div>
  <?php unset($_SESSION['login_success']); ?>
<?php endif; ?>

<?php if (!empty($_SESSION['login_error'])): ?>
  <div class="alert alert-danger">
    <?= htmlspecialchars($_SESSION['login_error']); ?>
  </div>
  <?php unset($_SESSION['login_error']); ?>
<?php endif; ?>

<?php if (!empty($_SESSION['reset_error'])): ?>
  <div class="alert alert-danger">
    <?= htmlspecialchars($_SESSION['reset_error']); ?>
  </div>
  <?php unset($_SESSION['reset_error']); ?>
<?php endif; ?>



<section class="login-section">
  <div class="regisform-container">
    <h2 class="regisform-title">Login to Skill Sync</h2>

   <form id="regisform-login-form">

      <label for="regisform-email">Email</label>
     <input 
  type="email" 
  id="regisform-email"
  name="email"
  class="regisform-email form-control" 
  placeholder="Enter your email" 
  required
>

  <label for="regisform-password">Password</label>
<div class="password-field-wrap">
  <input 
  type="password" 
  id="regisform-password"
  name="password"
  class="regisform-password form-control password-input" 
  placeholder="Enter your password" 
  required
>
  <button type="button" class="password-toggle-btn" onclick="togglePassword('regisform-password', this)">
    <i class="fa fa-eye-slash"></i>
  </button>
</div>

<div class="text-end mt-2">
  <a href="?page=forgot-password" class="text-info small">Forgot Password?</a>
</div>


      <button type="submit" class="regisform-register-btn">
        Login
      </button>

      <div class="regisform-login-link">
        No account yet? <a href="?page=register">Register here</a>
      </div>

    </form>
  </div>
</section>
