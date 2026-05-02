<?php $currentPage = $_GET['page'] ?? 'homepage'; ?>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark app-navbar">
  <div class="container">
    <a class="navbar-brand brand-link" href="#" data-brand-link>
      <span class="brand-mark"><img src="assets/images/sslogo.png" alt="SkillSync logo"></span>
    </a>
    
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
   <ul class="navbar-nav ms-auto align-items-center gap-lg-2 app-nav-list">
  <li class="nav-item">
    <a class="nav-link <?= $currentPage === 'homepage' ? 'active-page' : '' ?>" href="?page=homepage">Home</a>
  </li>
 <li class="nav-item">
  <a class="nav-link <?= $currentPage === 'register' ? 'active-page' : '' ?>" href="?page=register">Register</a>
</li>
  <li class="nav-item">
    <a class="nav-link <?= $currentPage === 'about' ? 'active-page' : '' ?>" href="?page=about">About</a>
  </li>
  <li class="nav-item">
    <a class="nav-link <?= $currentPage === 'developers' ? 'active-page' : '' ?>" href="?page=developers">Developers</a>
  </li>
  <li class="nav-item">
    <a class="nav-link <?= $currentPage === 'login' ? 'active-page' : '' ?> btn btn-sm btn-outline-info px-3 ms-lg-2" href="?page=login">Login</a>
  </li>
</ul>
    </div>
  </div>
</nav>