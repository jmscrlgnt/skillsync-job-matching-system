<?php $currentPage = $_GET['page'] ?? 'dashboard'; ?>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark app-navbar private-navbar">
  <div class="container">
    <a class="navbar-brand brand-link" href="#" data-brand-link>
      <span class="brand-mark"><img src="../../assets/images/sslogo.png" alt="SkillSync logo"></span>
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto align-items-center gap-lg-2 app-nav-list">
      <li class="nav-item"><a class="nav-link <?= $currentPage === 'dashboard' ? 'active-page' : '' ?>" href="?page=dashboard">Home</a></li>
<li class="nav-item"><a class="nav-link <?= $currentPage === 'browse' ? 'active-page' : '' ?>" href="?page=browse">Browse Jobs</a></li>
<li class="nav-item"><a class="nav-link <?= $currentPage === 'my-jobs' ? 'active-page' : '' ?>" href="?page=my-jobs">My Jobs</a></li>
        <li class="nav-item nav-icon-item">
  <a class="nav-link nav-icon-link <?= $currentPage === 'messages' ? 'active-page' : '' ?>" href="?page=messages" title="Messages">
    💬
    <span class="nav-badge d-none" id="headerMessageBadge">0</span>
  </a>
</li>

<li class="nav-item nav-icon-item">
  <a class="nav-link nav-icon-link <?= $currentPage === 'notifications' ? 'active-page' : '' ?>" href="?page=notifications" title="Notifications">
    🔔
    <span class="nav-badge d-none" id="headerNotificationBadge">0</span>
  </a>
</li>
        <li class="nav-item dropdown ms-2 user-menu-item">
          <a class="nav-link dropdown-toggle user-menu-trigger" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="header-status-dot" id="headerStatusDot"></span>
            <span class="header-avatar" id="headerAvatar">SS</span>
            <span class="header-user-copy"><strong data-user-name>Account</strong><small id="headerUserStatus">Available for opportunities</small></span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end user-menu-dropdown">
            <li class="dropdown-account-block"><strong data-user-email>user@email.com</strong><small id="dropdownRoleLabel">SkillSync account</small></li>
            <li><a class="dropdown-item" href="?page=user-profile">Profile</a></li>
            <li><a class="dropdown-item" href="?page=settings">Settings</a></li>
            <li><a class="dropdown-item" href="?page=notifications">Notifications</a></li>
            <li><a class="dropdown-item" href="?page=messages">Messages</a></li>
            <li><a class="dropdown-item" href="?page=my-jobs">My Jobs</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" data-logout-link>Sign out</a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</nav>