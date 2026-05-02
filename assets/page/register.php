<section class="regisform-section">
    <div class="regisform-container">
        <h2 class="regisform-title">Register on Skill Sync</h2>

        <?php if (!empty($_SESSION['register_error'])): ?>
            <div class="alert alert-danger">
                <?= htmlspecialchars($_SESSION['register_error']); ?>
            </div>
            <?php unset($_SESSION['register_error']); ?>
        <?php endif; ?>

        <?php if (!empty($_SESSION['register_success'])): ?>
            <div class="alert alert-success">
                <?= htmlspecialchars($_SESSION['register_success']); ?>
            </div>
            <?php unset($_SESSION['register_success']); ?>
        <?php endif; ?>

     <form id="regisform-register-form" method="POST" enctype="multipart/form-data">
            <label for="regisform-role">I am a:</label>
            <select id="regisform-role" name="role" class="regisform-role form-control" required>
                <option value="">Select Role</option>
                <option value="jobseeker">Job Seeker</option>
                <option value="employer">Employer</option>
            </select>

            <label for="regisform-fullname">Fullname</label>
            <input
                type="text"
                id="regisform-fullname"
                name="name"
                class="regisform-fullname form-control"
                placeholder="Enter your full name"
                required
            >

            <label for="regisform-phone">Phone</label>
            <input
                type="text"
                id="regisform-phone"
                name="phone"
                class="regisform-phone form-control"
                placeholder="Enter your phone number"
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

            <label for="regisform-confirm-password">Confirm Password</label>
            <div class="password-field-wrap">
                <input
                    type="password"
                    id="regisform-confirm-password"
                    name="confirm_password"
                    class="regisform-confirm-password form-control password-input"
                    placeholder="Confirm password"
                    required
                >
                <button type="button" class="password-toggle-btn" onclick="togglePassword('regisform-confirm-password', this)">
                    <i class="fa fa-eye-slash"></i>
                </button>
            </div>

            <label for="regisform-email">Email</label>
            <input
                type="email"
                id="regisform-email"
                name="email"
                class="regisform-email form-control"
                placeholder="Enter your email"
                required
            >

            <div class="regisform-otp-row">
                <input
    type="text"
    id="regisform-email-otp"
    name="email_otp_code"
    class="regisform-email-otp form-control"
    placeholder="Enter Email OTP"
    inputmode="numeric"
    pattern="[0-9]*"
    maxlength="6"
    autocomplete="one-time-code"
    required
>
                <button class="regisform-send-otp" type="button">
  <i class="fa fa-paper-plane me-1"></i> Send Code
</button>
            </div>

            <div class="regisform-resume-upload" id="registerResumeContainer">
                <label for="regisform-resume">Upload Resume (optional)</label>
               <input type="file" id="regisform-resume" name="resume" class="regisform-resume" accept=".pdf">
            </div>

            <button type="submit" class="regisform-register-btn">Register</button>

            <div class="regisform-login-link">
                Already have an account? <a href="?page=login">Login Here.</a>
            </div>
        </form>
    </div>
</section>