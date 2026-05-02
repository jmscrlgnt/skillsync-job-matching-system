<section class="settings-shell" id="settingsPage" data-role="admin">
  <div class="container py-5">
    <div class="settings-layout">
      <aside class="settings-sidebar">
        <h2>Settings</h2>
       <button type="button" class="settings-nav active" data-settings-target="accountPane">Account settings</button>
<button type="button" class="settings-nav" data-settings-target="securityPane">Security</button>
<button type="button" class="settings-nav" data-settings-target="communicationPane">Communication</button>
      </aside>
      <div class="settings-main">
        <div class="settings-pane active" id="accountPane">
          <h3>Account settings</h3>
          <form id="settingsForm" class="settings-form">
            <div class="settings-grid">
              <div class="settings-group"><label>Full name</label><input type="text" id="settingsName" required></div>
              <div class="settings-group"><label>Email</label><input type="email" id="settingsEmail" required></div>
              <div class="settings-group"><label>Phone number</label><input type="text" id="settingsPhone"></div>
              <div class="settings-group"><label>Account type</label><input type="text" id="settingsRole" readonly></div>
            </div>
            <button class="btn btn-primary app-btn" type="submit">Save account settings</button>
          </form>
        </div>
       <div class="settings-pane" id="securityPane">
  <h3>Security settings</h3>
  <form id="passwordForm" class="settings-form">
    <div class="settings-grid single-col">

      <div class="settings-group">
        <label for="currentPassword">Current password</label>
        <div class="password-input-wrap">
          <input type="password" id="currentPassword" required>
          <button type="button" class="password-toggle" data-target="#currentPassword" aria-label="Show password" title="Show password"></button>
        </div>
      </div>

      <div class="settings-group">
        <label for="newPassword">New password</label>
        <div class="password-input-wrap">
          <input type="password" id="newPassword" required>
          <button type="button" class="password-toggle" data-target="#newPassword" aria-label="Show password" title="Show password"></button>
        </div>
        <small class="hint">Use at least 8 characters with upper, lower, and a number.</small>
      </div>

      <div class="settings-group">
        <label for="confirmNewPassword">Confirm new password</label>
        <div class="password-input-wrap">
          <input type="password" id="confirmNewPassword" required>
          <button type="button" class="password-toggle" data-target="#confirmNewPassword" aria-label="Show password" title="Show password"></button>
        </div>
      </div>

    </div>
    <button class="btn btn-primary app-btn" type="submit">Update password</button>
  </form>
</div>
        <div class="settings-pane" id="communicationPane">
          <h3>Communication preferences</h3>
          <form id="preferencesForm" class="settings-form">
            <label class="toggle-row"><span>Email notifications</span><input type="checkbox" id="prefEmail"></label>
            <label class="toggle-row"><span>Message notifications</span><input type="checkbox" id="prefMessages"></label>
            <label class="toggle-row"><span>Marketing updates</span><input type="checkbox" id="prefMarketing"></label>
            <button class="btn btn-primary app-btn" type="submit">Save preferences</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>
