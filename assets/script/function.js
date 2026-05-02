const API_HOST = window.location.hostname || "localhost";
const API_ROOT = `${window.location.protocol}//${API_HOST}:5000`;
const API_BASE = `${API_ROOT}/api`;

let currentPage = 1;
const jobsPerPage = 3; // you can change
let allJobsCache = [];

let dashboardCurrentPage = 1;
const dashboardJobsPerPage = 3;
let dashboardJobsCache = [];

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function getAppBasePath() {
  const path = window.location.pathname.replace(/\\/g, "/");

  if (path.includes("/users/")) {
    return "";
  }

  if (path.endsWith("/index.php") || path === "/") {
    return "";
  }

  return "";
}

const APP_BASE = getAppBasePath();
const ROUTES = {
  publicHome: `${APP_BASE}/index.php`,
  login: `${APP_BASE}/index.php?page=login`,
  register: `${APP_BASE}/index.php?page=register`,
  userDashboard: `${APP_BASE}/users/user/index.php?page=dashboard`,
  employerDashboard: `${APP_BASE}/users/employer/index.php?page=dashboard`,
  adminDashboard: `${APP_BASE}/users/admin/index.php?page=dashboard`,
  userProfile: `${APP_BASE}/users/user/index.php?page=user-profile`,
  userBrowse: `${APP_BASE}/users/user/index.php?page=browse`,
  employerBrowse: `${APP_BASE}/users/employer/index.php?page=browse`,
  adminBrowse: `${APP_BASE}/users/admin/index.php?page=browse`,
  userSettings: `${APP_BASE}/users/user/index.php?page=settings`,
  employerSettings: `${APP_BASE}/users/employer/index.php?page=settings`,
  adminSettings: `${APP_BASE}/users/admin/index.php?page=settings`,
  userNotifications: `${APP_BASE}/users/user/index.php?page=notifications`,
  employerNotifications: `${APP_BASE}/users/employer/index.php?page=notifications`,
  adminNotifications: `${APP_BASE}/users/admin/index.php?page=notifications`,
  userMessages: `${APP_BASE}/users/user/index.php?page=messages`,
  employerMessages: `${APP_BASE}/users/employer/index.php?page=messages`,
  support: `${APP_BASE}/index.php?page=contact`,
  adminMessages: `${APP_BASE}/users/admin/index.php?page=messages`
};

function getCurrentUser() {
  const raw = JSON.parse(localStorage.getItem("skillsync_user") || "null");
  if (!raw) return null;

  return {
    ...raw,
    role: String(raw.role || "").trim().toLowerCase()
  };
}

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem("skillsync_user");
    return;
  }

  const normalizedUser = {
    ...user,
    role: String(user.role || "").trim().toLowerCase()
  };

  localStorage.setItem("skillsync_user", JSON.stringify(normalizedUser));
}

function logoutUser() {
  const confirmed = window.confirm("Are you sure you want to sign out?");
  if (!confirmed) return;

  localStorage.removeItem("skillsync_user");
  syncHomepageAuthState?.();
  window.location.href = ROUTES.publicHome;
}

function syncHomepageAuthState() {
  const user = getCurrentUser();
  const isLoggedIn = !!(user && user.id);

  document.body.dataset.loggedIn = isLoggedIn ? "true" : "false";

  const publicHome = document.getElementById("publicHomePage");
  if (!publicHome) return;

  publicHome.classList.toggle("is-authenticated", isLoggedIn);
}

function getDashboardRoute(role) {
  if (role === "employer") return ROUTES.employerDashboard;
  if (role === "admin") return ROUTES.adminDashboard;
  return ROUTES.userDashboard;
}

function getBrandHomeRoute() {
  const user = getCurrentUser();
  return user ? getDashboardRoute(user.role) : ROUTES.publicHome;
}

function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(String(password || ""));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function requireLogin(expectedRole) {
  const user = getCurrentUser();

  if (!user) {
    alert("Please log in first.");
    window.location.href = ROUTES.login;
    return null;
  }

  const actualRole = String(user.role || "").trim().toLowerCase();
  const neededRole = expectedRole ? String(expectedRole).trim().toLowerCase() : "";

  if (neededRole && actualRole !== neededRole) {
    alert("You do not have access to this page.");

    if (actualRole === "employer") {
      window.location.href = ROUTES.employerDashboard;
    } else if (actualRole === "admin") {
      window.location.href = ROUTES.adminDashboard;
    } else {
      window.location.href = ROUTES.userDashboard;
    }

    return null;
  }

  return user;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeSkills(skills) {
  const raw = Array.isArray(skills) ? skills : String(skills || "").split(",");
  return raw.map((skill) => String(skill).trim()).filter(Boolean);
}

function formatSkills(skills) {
  if (Array.isArray(skills)) return skills.length ? skills.join(", ") : "N/A";
  const value = String(skills || "").trim();
  return value || "N/A";
}

function formatSalary(job) {
  if (job?.salary_display) return job.salary_display;
  if (job?.salary_min != null && job?.salary_max != null) return `${job.salary_min} - ${job.salary_max}`;
  if (job?.salary_min != null) return String(job.salary_min);
  if (job?.salary_max != null) return String(job.salary_max);
  return "N/A";
}

function calculateMatchScore(userSkills, jobSkills) {
  const userSet = new Set(normalizeSkills(userSkills).map((skill) => skill.toLowerCase()));
  const normalizedJobSkills = normalizeSkills(jobSkills);
  if (!normalizedJobSkills.length) return 0;
  const matched = normalizedJobSkills.filter((skill) => userSet.has(skill.toLowerCase())).length;
  return Math.round((matched / normalizedJobSkills.length) * 100);
}

async function apiFetch(url, options = {}) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : { "Content-Type": "application/json", ...(options.headers || {}) };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const rawText = await response.text();
  let data = {};

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (parseError) {
    console.error("Non-JSON API response from:", url);
    console.error(rawText);
    throw new Error("Server returned invalid response. Check Node server terminal.");
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed.");
  }

  return data;
}

function updateNavUserText() {
  const user = getCurrentUser();
  qsa("[data-user-name]").forEach((element) => {
    element.textContent = user ? `Hi, ${user.name}` : "Hi, User";
  });
  const welcome = qs("[data-welcome-name]");
  if (welcome && user) welcome.textContent = user.name;
  const company = qs("[data-company-name]");
  if (company && user) company.textContent = user.name;
}

async function handleRegister(event) {
  event.preventDefault();
  const role = qs("#regisform-role")?.value || "";
  const name = qs("#regisform-fullname")?.value.trim() || "";
  const phone = qs("#regisform-phone")?.value.trim() || "";
  const password = qs("#regisform-password")?.value || "";
  const confirmPassword = qs("#regisform-confirm-password")?.value || "";
  const email = qs("#regisform-email")?.value.trim() || "";
 const otp = qs("#regisform-email-otp")?.value.trim() || "";
 if (!/^\d{6}$/.test(otp)) {
  alert("OTP must be a 6-digit number.");
  return;
}
const resumeFile = qs('#regisform-resume')?.files?.[0];

if (!role || !name || !email || !password || !confirmPassword || !otp) {
  alert("Please fill in all required fields including OTP.");
  return;
}
  if (!isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }
  if (!isStrongPassword(password)) {
    alert("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
    return;
  }

  const formData = new FormData();
  formData.append('role', role);
  formData.append('name', name);
  formData.append('phone', phone);
 formData.append('email', email);
formData.append('password', password);
formData.append('otp', otp);

if (role === 'jobseeker' && resumeFile) {
  formData.append('resume', resumeFile);
}

  try {
    const data = await apiFetch(`${API_BASE}/register`, {
      method: "POST",
      body: formData
    });
    alert(data.message + (role === 'jobseeker' && resumeFile ? ' Resume uploaded successfully.' : ''));
    window.location.href = ROUTES.login;
  } catch (error) {
    alert(error.message);
  }
}

function ensureAuthStatusBox(formSelector = '#regisform-login-form') {
  const form = qs(formSelector);
  if (!form) return null;

  let box = qs('#authStatusMessage');
  if (box) return box;

  box = document.createElement('div');
  box.id = 'authStatusMessage';
  box.style.marginTop = '10px';
  box.style.padding = '10px 12px';
  box.style.borderRadius = '10px';
  box.style.fontSize = '14px';
  box.style.display = 'none';
  form.appendChild(box);

  return box;
}

function showAuthStatusMessage(message, type = 'error', allowHtml = false) {
  const box = ensureAuthStatusBox();
  if (!box) return;

  if (allowHtml) {
    box.innerHTML = message || '';
  } else {
    box.textContent = message || '';
  }

  box.style.display = message ? 'block' : 'none';

  if (type === 'success') {
    box.style.background = 'rgba(25, 135, 84, 0.12)';
    box.style.border = '1px solid rgba(25, 135, 84, 0.35)';
    box.style.color = '#198754';
  } else if (type === 'warning') {
    box.style.background = 'rgba(255, 193, 7, 0.14)';
    box.style.border = '1px solid rgba(255, 193, 7, 0.35)';
    box.style.color = '#b78103';
  } else {
    box.style.background = 'rgba(220, 53, 69, 0.12)';
    box.style.border = '1px solid rgba(220, 53, 69, 0.35)';
    box.style.color = '#dc3545';
  }
}

function clearAuthStatusMessage() {
  const box = qs('#authStatusMessage');
  if (box) {
    box.textContent = '';
    box.style.display = 'none';
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = (qs("#regisform-email") || qs("#email"))?.value.trim() || "";
  const password = (qs("#regisform-password") || qs("#password"))?.value || "";
  clearAuthStatusMessage();

  try {
    const data = await apiFetch(`${API_BASE}/login`, {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    const normalizedUser = {
      ...data.user,
      role: String(data.user.role || "").trim().toLowerCase()
    };

    setCurrentUser(normalizedUser);
    syncHomepageAuthState();

    if (normalizedUser.role === "employer") {
      window.location.href = ROUTES.employerDashboard;
    } else if (normalizedUser.role === "admin") {
      window.location.href = ROUTES.adminDashboard;
    } else {
      window.location.href = ROUTES.userDashboard;
    }
 } catch (error) {
  const message = error?.message || "Login failed. Please try again.";

  if (
    message.includes("pending") ||
    message.includes("under review")
  ) {
    showAuthStatusMessage(
      `Your account is under review by the admin. If you need help, reach out to <a href="${ROUTES.support}" class="auth-status-link">Contact/Support</a>.`,
      "warning",
      true
    );

  } else if (
    message.includes("rejected") ||
    message.includes("disabled")
  ) {
    showAuthStatusMessage(
      `Your account has been rejected or disabled. Please reach out to <a href="${ROUTES.support}" class="auth-status-link">Contact/Support</a>.`,
      "error",
      true
    );

  } else if (
    message.includes("not verified")
  ) {
    showAuthStatusMessage("Your email is not verified yet.", "warning");

  } else {
    showAuthStatusMessage(message, "error");
  }
}
}

function getLogoUrl(job) {
  if (job?.logo) {
    if (/^https?:\/\//i.test(job.logo)) return job.logo;
    return `${API_ROOT}/uploads/${encodeURIComponent(job.logo)}`;
  }
  return "";
}

function getPublicPlaceholderCards() {
  return `
      <div class="modern-job-card placeholder-card">
        <div class="job-card-top">
          <span class="job-badge">Featured</span>
          <a href="?page=login" class="btn btn-apply">Apply Now</a>
        </div>
        <h5>Backend Developer</h5>
        <p class="company-line">XYZ Web Services</p>
        <div class="job-meta-row">
          <span>Cebu City, Philippines</span>
          <span>Full-time</span>
          <span>Posted 2026-03-24</span>
        </div>
      </div>
      <div class="modern-job-card placeholder-card mt-4">
        <div class="job-card-top">
          <span class="job-badge">Featured</span>
          <a href="?page=login" class="btn btn-apply">Apply Now</a>
        </div>
        <h5>Frontend Developer</h5>
        <p class="company-line">ABC Digital Solutions</p>
        <div class="job-meta-row">
          <span>Makati City, Philippines</span>
          <span>Internship</span>
          <span>Posted 2026-03-22</span>
        </div>
      </div>
      <div class="modern-job-card placeholder-card mt-4">
        <div class="job-card-top">
          <span class="job-badge">Featured</span>
          <a href="?page=login" class="btn btn-apply">Apply Now</a>
        </div>
        <h5>UI/UX Designer</h5>
        <p class="company-line">Creative Minds Studio</p>
        <div class="job-meta-row">
          <span>Quezon City, Philippines</span>
          <span>Contract</span>
          <span>Posted 2026-03-20</span>
        </div>
      </div>
  `;
}

function getApplicationActionButton(job) {
  const user = getCurrentUser?.();
  if (!user || user.role !== "jobseeker") return "";

  const applicationStatus = String(
    job.application_status || job.status_for_user || ""
  ).toLowerCase().trim();

  const applicationId = job.application_id || job.user_application_id || null;

  // 🔥 PRIORITY: already accepted job
  if (user.hasActiveJob === true && applicationStatus !== "accepted") {
    return `
      <button class="btn btn-secondary" disabled>
        Already Employed
      </button>
    `;
  }

  if (applicationStatus === "accepted") {
    return `<button class="btn btn-success" disabled>Accepted</button>`;
  }

  if (applicationStatus === "pending") {
    return `
      <button class="btn btn-warning text-dark"
        onclick="manageExistingApplication(${applicationId || "null"}, ${job.id}, 'pending')">
        Pending
      </button>
    `;
  }

  if (applicationStatus === "cancelled") {
    return `
      <button class="btn btn-success" onclick="applyToJob(${job.id})">
        Reapply
      </button>
    `;
  }

  if (applicationStatus === "rejected") {
    return `
      <button class="btn btn-danger" disabled>
        Rejected
      </button>
    `;
  }

  return `
    <button class="btn btn-apply" onclick="applyToJob(${job.id})">
      Apply Now
    </button>
  `;
}

async function manageExistingApplication(applicationId, jobId, status) {
  if (status !== "pending") return;

  const shouldCancel = confirm("You already applied to this job.\n\nDo you want to cancel your application?");
  if (!shouldCancel) return;

  await cancelApplication(applicationId, jobId);
}

async function cancelApplication(applicationId, jobId) {
  const user = requireLogin("jobseeker");
  if (!user) return;

  try {
    const data = await apiFetch(`${API_BASE}/applications/${applicationId}?userId=${user.id}`, {
      method: "DELETE"
    });

    alert(data.message);

    await loadApplicationsTable();
    await loadJobs("#recentJobsList", { limit: 3, showApply: true });
    await loadJobs("#userJobsList", { showApply: true });
    await loadJobs("#browseJobsPageList", { showApply: true });

    if (jobId) {
      await openJobDetails(jobId);
    }
  } catch (error) {
    alert(error.message);
  }
}

function getJobCardHtml(job, user, showApply = false, variant = "default") {
  const score = user?.role === "jobseeker"
    ? (job.match_score ?? calculateMatchScore(user.skills || [], job.skills || []))
    : 0;

  const logoUrl = getLogoUrl(job);
  const actionButton = showApply
    ? getApplicationActionButton(job)
    : "";

  return `
    <article class="modern-job-card ${variant === "public" ? "public-card" : ""}">
      <div class="job-card-top">
        <div>
          <span class="job-badge">${escapeHtml(job.job_type || "Open")}</span>
         ${user?.role === "jobseeker" ? `<span class="match-badge ${score >= 80 ? "match-high" : score >= 50 ? "match-medium" : "match-low"} ms-2">${score}% Match</span>` : ""}
        </div>
      </div>
      <div class="job-card-header">
        <div>
          <h5>${escapeHtml(job.title)}</h5>
          <p class="company-line mb-1">${escapeHtml(job.company)}</p>
          ${job.employer_email ? `<div class="contact-line">Employer email: ${escapeHtml(job.employer_email)}</div>` : ""}
        </div>
        ${logoUrl ? `<div class="job-card-logo"><img src="${logoUrl}" alt="${escapeHtml(job.company)} logo"></div>` : ""}
      </div>
      <div class="job-meta-row">
        <span>${escapeHtml(job.location || "Remote")}</span>
        <span>${escapeHtml(job.category || "General")}</span>
        <span>${escapeHtml(formatSalary(job))}</span>
      </div>
      <p class="job-description clamp">${escapeHtml(job.description || "No description provided.")}</p>
      <div class="skills-inline">${normalizeSkills(job.skills).slice(0, 5).map((skill) => `<span>${escapeHtml(skill)}</span>`).join("") || `<span>No skills listed</span>`}</div>
      <div class="job-card-actions">
        <button type="button" class="btn btn-outline-soft" onclick="openJobDetails(${job.id})">View Details</button>
        ${variant === "public" ? `<a href="?page=login" class="btn btn-apply">Apply Now</a>` : actionButton}
      </div>
      <small class="date-posted">Posted on ${escapeHtml(String(job.created_at || "").slice(0, 10) || "-")}</small>
    </article>
  `;
}


async function loadJobs(targetSelector, options = {}) {
  const user = getCurrentUser();
  const root = options.root || document;
  const search = qs("#jobSearch", root)?.value.trim() || qs("#job-search", root)?.value.trim() || "";
  const category = qs("#jobCategoryFilter", root)?.value || "";
  const location = qs("#jobLocationFilter", root)?.value.trim() || "";
  const type = qs("#jobTypeFilter", root)?.value || "";
  const skill = qs("#jobSkillFilter", root)?.value.trim() || "";

  let url = `${API_BASE}/jobs?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}&type=${encodeURIComponent(type)}&skill=${encodeURIComponent(skill)}`;
  if (user?.role === "jobseeker") url += `&userId=${user.id}`;

  try {
    let jobs = await apiFetch(url);

    const isPublicList = targetSelector === "#publicJobsList" && !options.limit;
    if (isPublicList) {
      allJobsCache = jobs;
      const start = (currentPage - 1) * jobsPerPage;
      const end = start + jobsPerPage;
      jobs = jobs.slice(start, end);
    } else if (options.limit) {
      jobs = jobs.slice(0, options.limit);
    }

    const container = qs(targetSelector);
    if (!container) return;

    if (!jobs.length) {
      container.innerHTML = options.variant === "public"
        ? getPublicPlaceholderCards()
        : '<p class="text-muted">No jobs found. Try adjusting your filters.</p>';

      const pagination = document.getElementById("jobsPagination");
      if (pagination && targetSelector === "#publicJobsList") {
        pagination.innerHTML = "";
      }
      return;
    }

    container.innerHTML = jobs
      .map((job) =>
        getJobCardHtml(
          job,
          user,
          options.showApply ?? user?.role === "jobseeker",
          options.variant || "default"
        )
      )
      .join("");

    if (isPublicList) {
      renderPaginationControls("#publicJobsList", options);
    }
  } catch (error) {
    console.error(error);
  }
}

async function openJobDetails(jobId) {
  try {
    const user = getCurrentUser();
    const query = user?.id ? `?userId=${user.id}` : "";
    const job = await apiFetch(`${API_BASE}/jobs/${jobId}${query}`);
    const logoUrl = getLogoUrl(job);
    const canApply = user?.role === "jobseeker";
    const content = qs("#jobDetailsContent");

    if (content) {
      content.innerHTML = `
        <div class="job-details-hero">
          ${logoUrl ? `<div class="job-details-logo"><img src="${logoUrl}" alt="${escapeHtml(job.company)} logo"></div>` : ""}
          <div>
            <h2 class="mb-2">${escapeHtml(job.title)}</h2>
            <p class="mb-1"><strong>${escapeHtml(job.company)}</strong></p>
            <p class="mb-0 text-light-emphasis">${escapeHtml(job.description || "No description provided.")}</p>
          </div>
        </div>
        <div class="job-details-grid">
          <div class="job-detail-box"><strong>Location</strong><div>${escapeHtml(job.location || "Remote")}</div></div>
          <div class="job-detail-box"><strong>Category</strong><div>${escapeHtml(job.category || "General")}</div></div>
          <div class="job-detail-box"><strong>Job Type</strong><div>${escapeHtml(job.job_type || "Open")}</div></div>
          ${job.job_end_date ? `
  <div class="job-detail-box">
    <strong>End Date</strong>
    <div>${escapeHtml(job.job_end_date)}</div>
  </div>
` : ""}
          <div class="job-detail-box"><strong>Salary</strong><div>${escapeHtml(formatSalary(job))}</div></div>
          <div class="job-detail-box"><strong>Employer</strong><div>${escapeHtml(job.employer_name || job.company || "Employer")}</div></div>
          <div class="job-detail-box"><strong>Contact Email</strong><div>${escapeHtml(job.employer_email || "Not available")}</div></div>
        </div>
        <div class="mb-3"><strong>Required Skills</strong><div class="skills-inline mt-2">${normalizeSkills(job.skills).map(skill => `<span>${escapeHtml(skill)}</span>`).join("") || "<span>No skills listed</span>"}</div></div>
        <div class="mb-3"><strong>Requirements</strong><p class="mb-0 mt-2">${escapeHtml(job.requirements || "No additional requirements provided.")}</p></div>
        <div class="d-flex gap-2 flex-wrap mt-4">
          ${canApply ? getApplicationActionButton(job) : ""}
     ${job.employer_email && String(job.application_status || "").toLowerCase() === "accepted"
  ? `<button
        type="button"
        class="btn btn-outline-soft"
        onclick="return emailEmployer('${String(job.employer_email || "").replace(/'/g, "\\'")}', '${String(job.employer_id || "").replace(/'/g, "\\'")}', '${String(job.id || "").replace(/'/g, "\\'")}', event)">
        Email Employer
      </button>`
  : ""}
        </div>
      `;
    }

    const modalEl = qs("#jobDetailsModal");
    if (modalEl) new bootstrap.Modal(modalEl).show();
  } catch (error) {
    alert(error.message || "Failed to load job details.");
  }
}

async function emailEmployer(email, employerId = "", jobId = "", event = null) {
  if (event) event.preventDefault();

  const user = getCurrentUser?.();

  if (!user || !user.id) {
    showLoginPrompt(() => {
      window.location.href = "?page=login";
    });
    return false;
  }

  if (user.role !== "jobseeker") {
    alert("Only jobseekers can use this feature.");
    return false;
  }

  if (!email) {
    alert("Employer email is not available.");
    return false;
  }

  if (!jobId) {
    alert("Job reference is missing.");
    return false;
  }

  try {
    const job = await apiFetch(`${API_BASE}/jobs/${jobId}?userId=${user.id}`);

    if (String(job.application_status || "").toLowerCase() !== "accepted") {
      alert("You can only contact the employer after your application has been accepted.");
      return false;
    }

    const encodedEmail = encodeURIComponent(email);
    const encodedEmployerId = encodeURIComponent(employerId || "");
    window.location.href = `?page=messages&compose=1&recipient=${encodedEmail}&employerId=${encodedEmployerId}`;
    return false;
  } catch (error) {
    alert(error.message || "Unable to verify application status.");
    return false;
  }
}
function emailApplicant(email, applicantId = "", event = null) {
  if (event) event.preventDefault();

  const user = getCurrentUser?.();

  if (!user || !user.id) {
    showLoginPrompt(() => {
      window.location.href = "?page=login";
    });
    return false;
  }

  if (!email) {
    alert("Applicant email is not available.");
    return false;
  }

  const encodedEmail = encodeURIComponent(email);
  const encodedApplicantId = encodeURIComponent(applicantId || "");
  window.location.href = `?page=messages&compose=1&recipient=${encodedEmail}&applicantId=${encodedApplicantId}`;
  return false;
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector("i");

  if (!input || !icon) return;

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  }
}

async function applyToJob(jobId) {
  const user = requireLogin("jobseeker");
  if (!user) return;

  try {
    const data = await apiFetch(`${API_BASE}/applications`, {
      method: "POST",
      body: JSON.stringify({ user_id: user.id, job_id: jobId })
    });

    alert(data.message);

    await loadApplicationsTable();
    await loadJobs("#recentJobsList", { limit: 3, showApply: true });
    await loadJobs("#userJobsList", { showApply: true });
    await loadJobs("#browseJobsPageList", { showApply: true });
    await openJobDetails(jobId);
  } catch (error) {
    alert(error.message);
  }
}

async function loadStudentDashboard() {
  const user = requireLogin("jobseeker");
  if (!user) return;

  updateNavUserText();

  try {
    const stats = await apiFetch(`${API_BASE}/dashboard/student/${user.id}`);
    user.hasActiveJob = Number(stats.acceptedApplications || 0) > 0;
    setCurrentUser(user);

    qs("#totalApplications").textContent = stats.totalApplications || 0;
    qs("#pendingApplications").textContent = stats.pendingApplications || 0;

    const approved = qs("#approvedApplications");
    if (approved) approved.textContent = stats.acceptedApplications || 0;

    await loadDashboardRecentJobs();

    if (qs("#userJobsList")) {
      await loadJobs("#userJobsList", { showApply: true });
    }

    if (qs("#applicationsTableBody")) {
      await loadApplicationsTable();
    }
  } catch (error) {
    console.error(error);
  }
}

function createApplicantTextBlock(label, text, key) {
  const safeText = escapeHtml(text || `No ${label.toLowerCase()} provided.`);
  const shouldToggle = safeText.length > 180;

  return `
    <div class="applicant-text-block">
      <strong>${label}:</strong>
      <p id="${key}" class="job-description applicant-text ${shouldToggle ? "clamp" : ""}">
        ${safeText}
      </p>
      ${shouldToggle ? `
        <button
          type="button"
          id="${key}-toggle"
          class="btn btn-link applicant-readmore-btn p-0"
          onclick="toggleApplicantText('${key}')">
          Read more
        </button>
      ` : ""}
    </div>
  `;
}

function toggleApplicantText(key) {
  const textEl = document.getElementById(key);
  const btnEl = document.getElementById(`${key}-toggle`);
  if (!textEl || !btnEl) return;

  const isClamped = textEl.classList.contains("clamp");
  if (isClamped) {
    textEl.classList.remove("clamp");
    btnEl.textContent = "Show less";
  } else {
    textEl.classList.add("clamp");
    btnEl.textContent = "Read more";
  }
}

window.toggleApplicantText = toggleApplicantText;

let employerApplicationsPage = 1;
const employerApplicationsPerPage = 3;
let employerApplicationsCache = [];

function getEmployerApplicationsPageItems(items, page = 1, perPage = employerApplicationsPerPage) {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

function renderEmployerApplicationsPagination(totalItems) {
  const wrap = qs("#employerApplicationsPagination");
  if (!wrap) return;

  const totalPages = Math.max(1, Math.ceil(totalItems / employerApplicationsPerPage));

  if (totalItems <= employerApplicationsPerPage) {
    wrap.innerHTML = "";
    return;
  }

  wrap.innerHTML = `
    <div class="dashboard-pagination-inner">
      <button
        type="button"
        class="btn btn-sm btn-outline-light"
        ${employerApplicationsPage <= 1 ? "disabled" : ""}
        onclick="changeEmployerApplicationsPage(-1)">
        Previous
      </button>

      <span class="dashboard-pagination-label">
        Page ${employerApplicationsPage} of ${totalPages}
      </span>

      <button
        type="button"
        class="btn btn-sm btn-outline-light"
        ${employerApplicationsPage >= totalPages ? "disabled" : ""}
        onclick="changeEmployerApplicationsPage(1)">
        Next
      </button>
    </div>
  `;
}


function changeEmployerApplicationsPage(direction) {
  const totalPages = Math.max(1, Math.ceil(employerApplicationsCache.length / employerApplicationsPerPage));
  employerApplicationsPage += direction;

  if (employerApplicationsPage < 1) employerApplicationsPage = 1;
  if (employerApplicationsPage > totalPages) employerApplicationsPage = totalPages;

  renderEmployerApplicationsSection();
}

function renderEmployerApplicationsSection() {
  const jobList = qs("#employerJobList");
  if (!jobList) return;

  const currentItems = getEmployerApplicationsPageItems(
    employerApplicationsCache,
    employerApplicationsPage,
    employerApplicationsPerPage
  );

  jobList.innerHTML = currentItems.length
    ? currentItems.map((item) => {
        const currentStatus = String(item.status || "pending").toLowerCase();

        const statusClass =
          currentStatus === "accepted"
            ? "accepted"
            : currentStatus === "rejected" || currentStatus === "cancelled"
            ? "rejected"
            : "pending";

        const actionButtons = currentStatus === "pending"
          ? `
              <button class="btn btn-success" onclick="updateApplicationStatus(${item.id}, 'accepted')">Accept</button>
              <button class="btn btn-danger" onclick="updateApplicationStatus(${item.id}, 'rejected')">Reject</button>
            `
          : `
              <button class="application-status-btn application-status-${statusClass}" disabled>
                ${escapeHtml(currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1))}
              </button>
            `;

        const resumeBtn = item.resume_path
          ? `<a class="btn btn-outline-soft" href="${API_ROOT}/uploads/${encodeURIComponent(item.resume_path)}" target="_blank">View Resume</a>`
          : `<button class="btn btn-outline-soft" disabled>No Resume</button>`;

        const skillTags = normalizeSkills(item.skills)
          .map((skill) => `<span>${escapeHtml(skill)}</span>`)
          .join("") || "<span>No skills added</span>";

        const matchScore = Number(item.match_score || 0);
        const matchClass =
          matchScore >= 80 ? "match-high" :
          matchScore >= 50 ? "match-medium" :
          "match-low";

        const aboutBlock = createApplicantTextBlock(
          "About",
          item.about_me || "No introduction yet.",
          `about-${item.id}`
        );

        const experienceBlock = createApplicantTextBlock(
          "Experience",
          item.experience || "No experience details yet.",
          `exp-${item.id}`
        );

       const emailValue = String(item.email || "").trim();
const emailLine = emailValue ? escapeHtml(emailValue) : "N/A";

const emailButton = emailValue
  ? `<button type="button" class="btn btn-outline-soft employer-email-btn" onclick="return emailApplicant('${String(emailValue).replace(/'/g, "\\'")}', '${item.user_id || item.applicant_id || ""}', event)">Email Applicant</button>`
  : `<button class="btn btn-outline-soft employer-email-btn" disabled>Email Applicant</button>`;

        return `
          <article class="modern-job-card employer-application-card">
            <div class="job-card-top">
              <div>
                <span class="job-badge">Application</span>
                <span class="match-badge ${matchClass} ms-2">${matchScore}% Match</span>
                <span class="match-badge ms-2 status-${statusClass}">
                  ${escapeHtml(currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1))}
                </span>
              </div>
            </div>

            <div class="job-card-header">
              <div>
                <h5>${escapeHtml(item.name || "Applicant")}</h5>
                <p class="company-line mb-1">Role Applied: ${escapeHtml(item.title || "N/A")}</p>
                <div class="contact-line">Email: ${emailLine}</div>
              </div>
            </div>

            <div class="job-meta-row">
              <span>${escapeHtml(item.location || "Not provided")}</span>
              <span>${escapeHtml(item.degree || "Not provided")}</span>
              <span>${item.resume_path ? "Resume Available" : "No Resume"}</span>
            </div>

            ${aboutBlock}
            ${experienceBlock}

            <div class="skills-inline">
              ${skillTags}
            </div>

           <div class="job-card-actions">
  ${resumeBtn}
  ${emailButton}
  ${actionButtons}
</div>
          </article>
        `;
      }).join("")
    : '<div class="modern-job-card employer-application-card">No applications yet.</div>';

  renderEmployerApplicationsPagination(employerApplicationsCache.length);
}

window.changeEmployerApplicationsPage = changeEmployerApplicationsPage;

async function loadEmployerDashboard() {
  const user = requireLogin("employer");
  if (!user) return;

  updateNavUserText();

  try {
   const data = await apiFetch(`${API_BASE}/dashboard/employer/${user.id}?requesterId=${user.id}`);

    qs("#employerTotalJobs").textContent = data.stats.totalJobs || 0;
    qs("#employerRecentApplications").textContent = data.recentApplications.length || 0;

    employerApplicationsCache = Array.isArray(data.recentApplications)
      ? data.recentApplications
      : [];

    const totalPages = Math.max(
      1,
      Math.ceil(employerApplicationsCache.length / employerApplicationsPerPage)
    );

    if (employerApplicationsPage > totalPages) {
      employerApplicationsPage = totalPages;
    }

    if (employerApplicationsPage < 1) {
      employerApplicationsPage = 1;
    }

    renderEmployerApplicationsSection();
  } catch (error) {
    console.error(error);
  }
}

function shouldRequireJobEndDate(jobType) {
  const type = String(jobType || "").toLowerCase();
  return type === "contract" || type === "part-time";
}

function syncJobEndDateVisibility() {
  const jobTypeEl = qs("#jobType");
  const endDateWrap = qs("#jobEndDateWrap");
  const endDateInput = qs("#jobEndDate");

  if (!jobTypeEl || !endDateWrap || !endDateInput) return;

  const needsEndDate = shouldRequireJobEndDate(jobTypeEl.value);

  endDateWrap.classList.toggle("d-none", !needsEndDate);

  if (needsEndDate) {
    endDateInput.setAttribute("required", "required");
  } else {
    endDateInput.removeAttribute("required");
    endDateInput.value = "";
  }
}

let editingJobId = null;

function setPostJobMode(mode = "create", job = null) {
  const modalTitle = qs("#postJobModalLabel");
  const submitBtn = qs('#postJobForm button[type="submit"]');
  const form = qs("#postJobForm");

  if (mode === "edit" && job) {
    editingJobId = Number(job.id);

    if (modalTitle) modalTitle.textContent = "Edit Job Posting";
    if (submitBtn) submitBtn.textContent = "Save Changes";

    qs("#jobTitle").value = job.title || "";
    qs("#jobCompany").value = job.company || "";
    qs("#jobType").value = job.job_type || "Select Job Type";
    qs("#jobEndDate").value = job.job_end_date || "";
    qs("#jobCategory").value = job.category || "Select Job Category";
    qs("#jobLocation").value = job.location || "";
    qs("#jobSalary").value = job.salary_display || "";
    qs("#jobDescription").value = job.description || "";
    qs("#jobRequirements").value = job.requirements || "";
    qs("#jobSkills").value = Array.isArray(job.skills)
      ? job.skills.join(", ")
      : (job.skills || "");
      syncJobEndDateVisibility();
  } else {
    editingJobId = null;

    if (modalTitle) modalTitle.textContent = "Post a New Job";
    if (submitBtn) submitBtn.textContent = "Post Job";

    form?.reset();
    const endDateInput = qs("#jobEndDate");
if (endDateInput) endDateInput.value = "";
syncJobEndDateVisibility();
  }
}

function resetPostJobFormMode() {
  setPostJobMode("create");
}

function startEditJob(jobId) {
  const user = requireLogin("employer");
  if (!user) return;

  const job = employerManageJobsCache.find((item) => Number(item.id) === Number(jobId));
  if (!job) {
    alert("Job data not found.");
    return;
  }

  setPostJobMode("edit", job);

  const manageModalEl = qs("#manageJobModal");
  const postModalEl = qs("#postJobModal");

  const manageModal = manageModalEl ? window.bootstrap?.Modal.getInstance(manageModalEl) : null;
  if (manageModal) manageModal.hide();

  const postModal = postModalEl ? new window.bootstrap.Modal(postModalEl) : null;
  postModal?.show();
}

async function handlePostJob(event) {
  event.preventDefault();

  const user = requireLogin("employer");
  if (!user) return;

  const title = qs("#jobTitle")?.value.trim() || "";
  const company = qs("#jobCompany")?.value.trim() || "";
  const jobType = qs("#jobType")?.value || "";
  const jobEndDate = qs("#jobEndDate")?.value || "";
  const category = qs("#jobCategory")?.value || "";
  const location = qs("#jobLocation")?.value.trim() || "";
  const salary = qs("#jobSalary")?.value.trim() || "";
  const description = qs("#jobDescription")?.value.trim() || "";
  const requirementsRaw = qs("#jobRequirements")?.value.trim() || "";
  const skills = qs("#jobSkills")?.value.trim() || "";
  const logoFile = qs("#jobLogo")?.files?.[0];

  if (!title || !company || !location || !salary || !description || !skills) {
    alert("Please complete all required job fields first.");
    return;
  }

  if (!jobType || jobType === "Select Job Type") {
    alert("Please select a valid job type.");
    return;
  }

  if (!category || category === "Select Job Category") {
    alert("Please select a valid job category.");
    return;
  }

  if (shouldRequireJobEndDate(jobType) && !jobEndDate) {
    alert("Please choose an end date for this job type.");
    return;
  }

  const formData = new FormData();
  formData.append("employer_id", user.id);
  formData.append("requester_id", user.id);
  formData.append("title", title);
  formData.append("company", company);
  formData.append("job_type", jobType);
  formData.append("job_end_date", jobEndDate);
  formData.append("category", category);
  formData.append("location", location);
  formData.append("salary", salary);
  formData.append("salary_display", salary);
  formData.append("description", description);
  formData.append("requirements", requirementsRaw.replace(/\n/g, ", "));
  formData.append("skills", skills);

  if (logoFile) {
    formData.append("logo", logoFile);
  }

  const isEditing = !!editingJobId;
  const endpoint = isEditing
    ? `${API_BASE}/jobs/${editingJobId}`
    : `${API_BASE}/jobs`;

  const method = isEditing ? "PUT" : "POST";

  const submitBtn = qs('#postJobForm button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : "";

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = isEditing ? "Saving..." : "Posting...";
    }

    const data = await apiFetch(endpoint, {
      method,
      body: formData
    });

    const modalEl = qs("#postJobModal");
    const modalInstance = modalEl ? window.bootstrap?.Modal.getInstance(modalEl) : null;

    if (modalInstance) {
      modalInstance.hide();
    }

    resetPostJobFormMode();

    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    }, 250);

    await loadManageJobs();
    await loadEmployerDashboard();

    setTimeout(() => {
      alert(data.message || (isEditing ? "Job updated successfully." : "Job posted successfully."));
    }, 300);
  } catch (error) {
    console.error("Post job error:", error);
    alert(error.message || (isEditing ? "Failed to update job." : "Failed to post job."));
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText || (isEditing ? "Save Changes" : "Post Job");
    }
  }
}

let employerManageJobsCache = [];

function renderManageJobsRows(jobs) {
  const tbody = qs("#manageJobList");
  if (!tbody) return;

  if (!jobs.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">No jobs found.</td></tr>`;
    return;
  }

  tbody.innerHTML = jobs.map((job) => `
    <tr>
      <td>${escapeHtml(job.title || "N/A")}</td>
      <td>${escapeHtml(job.company || "N/A")}</td>
      <td>${escapeHtml(job.job_type || "N/A")}</td>
      <td>${escapeHtml(job.category || "N/A")}</td>
      <td>
        <span class="badge bg-${String(job.status || "open").toLowerCase() === "open" ? "success" : "secondary"}">
          ${escapeHtml(job.status || "open")}
        </span>
      </td>
      <td class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-sm btn-outline-light" onclick="openJobDetails(${job.id})">
          View
        </button>
        <button type="button" class="btn btn-sm btn-warning text-dark" onclick="startEditJob(${job.id})">
          Edit
        </button>
        <button type="button" class="btn btn-sm btn-danger" onclick="deleteJob(${job.id})">
          Delete
        </button>
      </td>
    </tr>
  `).join("");
}

function filterManageJobsList() {
  const keyword = (qs("#searchJob")?.value || "").trim().toLowerCase();

  if (!keyword) {
    renderManageJobsRows(employerManageJobsCache);
    return;
  }

  const filtered = employerManageJobsCache.filter((job) => {
    return [
      job.title,
      job.company,
      job.job_type,
      job.category,
      job.status,
      job.location
    ].some((value) => String(value || "").toLowerCase().includes(keyword));
  });

  renderManageJobsRows(filtered);
}

async function loadManageJobs() {
  const user = requireLogin("employer");
  if (!user) return;

  updateNavUserText();

  try {
    const jobs = await apiFetch(`${API_BASE}/my-jobs/${user.id}?requesterId=${user.id}`);
    employerManageJobsCache = Array.isArray(jobs) ? jobs : [];
    renderManageJobsRows(employerManageJobsCache);

    const searchInput = qs("#searchJob");
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.addEventListener("input", filterManageJobsList);
      searchInput.dataset.bound = "true";
    }
  } catch (error) {
    console.error(error);
    const tbody = qs("#manageJobList");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center">Failed to load jobs.</td></tr>`;
    }
  }
}

async function deleteJob(jobId) {
  const user = requireLogin("employer");
  if (!user) return;

  if (!confirm("Are you sure you want to delete this job posting?")) return;

  try {
    const data = await apiFetch(`${API_BASE}/jobs/${jobId}?employerId=${user.id}&requesterId=${user.id}`, {
      method: "DELETE"
    });

    employerManageJobsCache = employerManageJobsCache.filter(
      (job) => Number(job.id) !== Number(jobId)
    );

    renderManageJobsRows(employerManageJobsCache);

    await loadManageJobs();
    await loadEmployerDashboard();

    alert(data.message || "Job deleted successfully.");
  } catch (error) {
    alert(error.message || "Failed to delete job.");
  }
}

function showToast(message, type = "info", duration = 2000) {
  const container = document.getElementById("appToastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `app-toast app-toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 220);
  }, duration);
}

async function updateApplicationStatus(applicationId, status) {
  const user = requireLogin("employer");
  if (!user) return;

  const previousCache = JSON.parse(JSON.stringify(employerApplicationsCache));

  const itemIndex = employerApplicationsCache.findIndex(
    (item) => Number(item.id) === Number(applicationId)
  );

  if (itemIndex === -1) return;

  const previousStatus = employerApplicationsCache[itemIndex].status;

  employerApplicationsCache[itemIndex] = {
    ...employerApplicationsCache[itemIndex],
    status
  };

  renderEmployerApplicationsSection();

  try {
    await apiFetch(`${API_BASE}/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employer_id: user.id,
        status
      })
    });

    await loadEmployerDashboard();

    const toastMessage =
      status === "accepted"
        ? "Application accepted."
        : status === "rejected"
        ? "Application rejected."
        : "Application updated.";

    const toastType =
      status === "accepted"
        ? "success"
        : status === "rejected"
        ? "error"
        : "info";

    showToast(toastMessage, toastType, 2000);
  } catch (error) {
    employerApplicationsCache = previousCache;

    if (itemIndex !== -1) {
      employerApplicationsCache[itemIndex] = {
        ...employerApplicationsCache[itemIndex],
        status: previousStatus
      };
    }

    renderEmployerApplicationsSection();
    console.error(error);
    showToast(error.message || "Failed to update application status.", "warning", 2400);
  }
}

async function loadApplicationsTable() {
  const user = requireLogin("jobseeker");
  if (!user) return;

  try {
    const applications = await apiFetch(`${API_BASE}/applications/user/${user.id}`);
    const tbody = qs("#applicationsTableBody");
    if (!tbody) return;

    if (!applications.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No applications yet.</td></tr>';
      return;
    }

    tbody.innerHTML = applications.map((application, index) => {
      const status = String(application.status || "").toLowerCase();
      const badgeClass =
        status === "accepted"
          ? "success"
          : status === "rejected"
          ? "danger"
          : "warning text-dark";

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(application.title || "N/A")}</td>
          <td>${escapeHtml(application.company || "N/A")}</td>
          <td>
            <span class="badge bg-${badgeClass}">
              ${escapeHtml(status.charAt(0).toUpperCase() + status.slice(1))}
            </span>
          </td>
          <td>${escapeHtml(String(application.applied_at || "").slice(0, 10) || "-")}</td>
          <td>
            <button
              type="button"
              class="btn btn-sm btn-outline-soft"
              onclick="openJobDetails(${application.job_id || application.id})">
              View Job
            </button>
          </td>
        </tr>
      `;
    }).join("");
  } catch (error) {
    console.error(error);
  }
}

async function loadProfileForm() {
  const profileForm = qs('#profileForm');
  if (!profileForm) return;

  const user = requireLogin();
  if (!user) return;

  updateNavUserText();

  try {
    const profile = await apiFetch(`${API_BASE}/profile/${user.id}`);
    if (!profile) return;

    const fullName = qs('input[name="full_name"]');
    const email = qs('input[name="email"]');
    const phone = qs('input[name="phone"]');
    const location = qs('input[name="location"]');
    const degree = qs('input[name="degree"]');
    const headline = qs('input[name="headline"]');
    const companyName = qs('input[name="company_name"]');
    const website = qs('input[name="website"]');
    const availabilityStatus = qs('#availabilityStatus');
    const jobCategory = qs('#jobCategory');
    const skillsHidden = qs('#skillsHidden');
    const aboutMe = qs('textarea[name="about_me"]');
    const experience = qs('textarea[name="experience"]');

    if (fullName) fullName.value = profile.name || "";
    if (email) email.value = profile.email || "";
    if (phone) phone.value = profile.phone || "";
    if (location) location.value = profile.location || "";
    if (degree) degree.value = profile.degree || "";
    if (headline) headline.value = profile.headline || "";
    if (companyName) companyName.value = profile.company_name || "";
    if (website) website.value = profile.website || "";
    if (availabilityStatus) availabilityStatus.value = profile.availability_status || "Available";
    if (jobCategory) jobCategory.value = profile.job_category || "";
    if (skillsHidden) {
      skillsHidden.value = Array.isArray(profile.skills)
        ? profile.skills.join(", ")
        : (profile.skills || "");
    }
    if (aboutMe) aboutMe.value = profile.about_me || "";
    if (experience) experience.value = profile.experience || "";

    if (window.setExistingSkillsFromHidden) {
      window.setExistingSkillsFromHidden(
        Array.isArray(profile.skills) ? profile.skills.join(", ") : (profile.skills || "")
      );
    }

    const resumePreview = qs('#resumePreview');
    if (resumePreview) {
      resumePreview.innerHTML = profile.resume_path
        ? `<a class="btn btn-sm btn-outline-info" href="${API_ROOT}/uploads/${encodeURIComponent(profile.resume_path)}" target="_blank">View Current Resume</a>`
        : '<span class="text-secondary">No resume uploaded yet.</span>';
    }

    const avatarPreview = qs('#profileAvatarPreview');
    if (avatarPreview) {
      if (profile.profile_picture) {
        avatarPreview.innerHTML = `<img src="${API_ROOT}/uploads/${encodeURIComponent(profile.profile_picture)}" alt="Profile picture">`;
      } else {
        avatarPreview.textContent = (profile.name || 'SS')
          .split(' ')
          .map(part => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
      }
    }

    const statusPill = qs('#profileStatusPill');
    if (statusPill) statusPill.textContent = profile.availability_status || 'Available';

  } catch (error) {
    console.error(error);
  }
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  const user = requireLogin();
  if (!user) return;

  const formData = new FormData();
  formData.append("user_id", user.id);
  formData.append("full_name", qs('input[name="full_name"]').value.trim());
  formData.append("email", qs('input[name="email"]').value.trim());
  formData.append("phone", qs('input[name="phone"]').value.trim());
  formData.append("location", qs('input[name="location"]').value.trim());
  formData.append("degree", qs('input[name="degree"]').value.trim());
  formData.append("job_category", qs('#jobCategory').value);
  formData.append("headline", qs('input[name="headline"]')?.value.trim() || '');
  formData.append("company_name", qs('input[name="company_name"]')?.value.trim() || '');
  formData.append("website", qs('input[name="website"]')?.value.trim() || '');
  formData.append("availability_status", qs('#availabilityStatus')?.value || 'Available');
  formData.append("skills", qs('#skillsHidden').value);
  formData.append("about_me", qs('textarea[name="about_me"]').value.trim());
  formData.append("experience", qs('textarea[name="experience"]').value.trim());

  const resumeFile = qs('#resumeInput')?.files?.[0];
  if (resumeFile) formData.append('resume', resumeFile);

  const profileImageFile = qs('#profileImageInput')?.files?.[0];
  if (profileImageFile) formData.append('profile_picture', profileImageFile);

  try {
    const data = await apiFetch(`${API_BASE}/profile`, {
      method: "POST",
      body: formData
    });

    if (data.user) {
      setCurrentUser({
        ...user,
        ...data.user
      });
    }

    alert(data.message);

    const finalRole = data.user?.role || user.role;
    window.location.href = getDashboardRoute(finalRole);
  } catch (error) {
    alert(error.message);
  }
}

async function loadAdminDashboard() {
  const user = requireLogin("admin");
  if (!user) return;
  updateNavUserText();
  try {
    const [stats, users, jobs] = await Promise.all([
  apiFetch(`${API_BASE}/admin/stats?admin_id=${user.id}`),
  apiFetch(`${API_BASE}/admin/users?admin_id=${user.id}`),
  apiFetch(`${API_BASE}/admin/jobs?admin_id=${user.id}`)
]);
    qs('#adminTotalUsers').textContent = stats.totalUsers || 0;
    qs('#adminEmployers').textContent = stats.employers || 0;
    qs('#adminJobseekers').textContent = stats.jobSeekers || 0;
    qs('#adminApplications').textContent = stats.applications || 0;
    qs('#adminTotalJobs').textContent = stats.totalJobs || 0;
    qs('#adminApprovedJobs').textContent = stats.openJobs || 0;
    qs('#adminPendingJobs').textContent = stats.draftJobs || 0;

    const userTable = qs('#adminUsersTableBody');
  if (userTable) {
  userTable.innerHTML = users.length ? users.map((item, index) => {
    const emailVerified = Number(item.email_verified) === 1;
    const verificationStatus = String(item.verification_status || 'pending').toLowerCase();

    const emailBadgeClass = emailVerified ? 'bg-success' : 'bg-secondary';
    const verificationBadgeClass =
      verificationStatus === 'approved'
        ? 'bg-success'
        : verificationStatus === 'rejected'
          ? 'bg-danger'
          : 'bg-warning text-dark';

    const activeBadgeClass = item.is_active ? 'bg-success' : 'bg-danger';

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.email)}</td>
        <td>${escapeHtml(item.role)}</td>
        <td><span class="badge ${emailBadgeClass}">${emailVerified ? 'Verified' : 'Not Verified'}</span></td>
        <td><span class="badge ${verificationBadgeClass}">${escapeHtml(verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1))}</span></td>
        <td><span class="badge ${activeBadgeClass}">${item.is_active ? 'Active' : 'Disabled'}</span></td>
        <td>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-success" onclick="updateUserStatus(${item.id}, 1)" ${item.role === 'admin' || verificationStatus === 'approved' ? 'disabled' : ''}>Approve</button>
            <button class="btn btn-sm btn-outline-danger" onclick="updateUserStatus(${item.id}, 0)" ${item.role === 'admin' || verificationStatus === 'rejected' ? 'disabled' : ''}>Reject / Disable</button>
          </div>
        </td>
      </tr>`;
  }).join('') : '<tr><td colspan="8" class="text-center">No users found.</td></tr>';
}

    const jobTable = qs('#adminJobsTableBody');
    if (jobTable) {
      jobTable.innerHTML = jobs.length ? jobs.map((job, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(job.title)}</td>
          <td>${escapeHtml(job.company)}</td>
          <td>${escapeHtml(job.category || 'N/A')}</td>
          <td>${escapeHtml(String(job.created_at || '').slice(0, 10) || '-')}</td>
          <td><span class="badge bg-${job.status === 'open' ? 'success' : job.status === 'closed' ? 'secondary' : 'warning text-dark'}">${escapeHtml(job.status)}</span></td>
          <td>
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-sm btn-success" onclick="updateJobStatus(${job.id}, 'open')">Approve</button>
              <button class="btn btn-sm btn-warning" onclick="updateJobStatus(${job.id}, 'draft')">Pending</button>
              <button class="btn btn-sm btn-outline-danger" onclick="updateJobStatus(${job.id}, 'closed')">Close</button>
            </div>
          </td>
        </tr>`).join('') : '<tr><td colspan="7" class="text-center">No jobs found.</td></tr>';
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateUserStatus(userId, isActive) {
  const user = requireLogin('admin');
  if (!user) return;

  try {
    const data = await apiFetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        admin_id: user.id,
        is_active: isActive
      })
    });

    alert(data.message);
    loadAdminDashboard();
  } catch (error) {
    alert(error.message);
  }
}

async function updateJobStatus(jobId, status) {
  const user = requireLogin('admin');
  if (!user) return;

  try {
    const data = await apiFetch(`${API_BASE}/jobs/${jobId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        admin_id: user.id,
        status
      })
    });

    alert(data.message);
    loadAdminDashboard();
  } catch (error) {
    alert(error.message);
  }
}

async function loadPublicJobs() {
  currentPage = 1;
  await loadJobs("#publicJobsList", { showApply: false, variant: "public" });
}

function wireSearchInputs() {
  qs('#jobSearchButton')?.addEventListener('click', () => {
    const container = qs('#browseJobsPageList') ? '#browseJobsPageList' : '#userJobsList';
    loadJobs(container, { showApply: getCurrentUser()?.role === 'jobseeker' });
  });

  qs('#job-search')?.addEventListener('input', () => {
  currentPage = 1;
  loadPublicJobs();
});
  qs('#jobCategoryFilter')?.addEventListener('change', () => {
    const container = qs('#browseJobsPageList') ? '#browseJobsPageList' : '#userJobsList';
    loadJobs(container, { showApply: getCurrentUser()?.role === 'jobseeker' });
  });
  qs('#jobTypeFilter')?.addEventListener('change', () => {
    const container = qs('#browseJobsPageList') ? '#browseJobsPageList' : '#userJobsList';
    loadJobs(container, { showApply: getCurrentUser()?.role === 'jobseeker' });
  });
  qs('#jobLocationFilter')?.addEventListener('input', () => {
    const container = qs('#browseJobsPageList') ? '#browseJobsPageList' : '#userJobsList';
    loadJobs(container, { showApply: getCurrentUser()?.role === 'jobseeker' });
  });
  qs('#jobSkillFilter')?.addEventListener('input', () => {
    const container = qs('#browseJobsPageList') ? '#browseJobsPageList' : '#userJobsList';
    loadJobs(container, { showApply: getCurrentUser()?.role === 'jobseeker' });
  });
}


async function loadSettingsPage() {
  const user = requireLogin();
  if (!user) return;
  updateNavUserText();
  try {
    const data = await apiFetch(`${API_BASE}/account/${user.id}/settings`);
    qs('#settingsName').value = data.name || '';
    qs('#settingsEmail').value = data.email || '';
    qs('#settingsPhone').value = data.phone || '';
    qs('#settingsRole').value = (data.role || '').replace(/^./, (m) => m.toUpperCase());
    qs('#prefEmail').checked = Boolean(data.preferences?.email_notifications);
    qs('#prefMessages').checked = Boolean(data.preferences?.message_notifications);
    qs('#prefMarketing').checked = Boolean(data.preferences?.marketing_notifications);

    qsa('.settings-nav').forEach((button) => {
      button.addEventListener('click', () => {
        qsa('.settings-nav').forEach((b) => b.classList.remove('active'));
        qsa('.settings-pane').forEach((pane) => pane.classList.remove('active'));
        button.classList.add('active');
        qs(`#${button.dataset.settingsTarget}`)?.classList.add('active');
      });
    });
  } catch (error) {
    console.error(error);
  }
}

async function handlePreferencesForm(event) {
  event.preventDefault();
  event.stopPropagation();

  const user = requireLogin();
  if (!user) return false;

  const submitBtn = qs('#preferencesForm button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : '';

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    const data = await apiFetch(`${API_BASE}/account/${user.id}/settings`, {
      method: 'PUT',
      body: JSON.stringify({
        name: qs('#settingsName')?.value.trim() || user.name || '',
        email: qs('#settingsEmail')?.value.trim() || user.email || '',
        phone: qs('#settingsPhone')?.value.trim() || user.phone || '',
        preferences: {
          email_notifications: qs('#prefEmail')?.checked || false,
          message_notifications: qs('#prefMessages')?.checked || false,
          marketing_notifications: qs('#prefMarketing')?.checked || false
        }
      })
    });

    if (data.user) {
      setCurrentUser({
        ...getCurrentUser(),
        ...data.user
      });
    }

    alert(data.message || 'Preferences updated successfully.');
    return false;
  } catch (error) {
    alert(error.message || 'Failed to update preferences.');
    return false;
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText || 'Save preferences';
    }
  }
}

async function handleContactSupportForm(event) {
  event.preventDefault();

  const name = qs('#contactName')?.value.trim() || '';
  const email = qs('#contactEmail')?.value.trim() || '';
  const subject = qs('#contactSubject')?.value.trim() || '';
  const message = qs('#contactMessage')?.value.trim() || '';

  if (!name || !email || !subject || !message) {
    alert('Please complete all required fields.');
    return;
  }

  if (!isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  const submitBtn = qs('#contactSupportForm button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : '';

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    const data = await apiFetch(`${API_BASE}/public/inquiries`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        subject,
        message
      })
    });

    alert(data.message || 'Inquiry sent successfully.');
    qs('#contactSupportForm')?.reset();
  } catch (error) {
    alert(error.message || 'Failed to send inquiry.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText || 'Send Inquiry';
    }
  }
}

function prefillContactSupportForm() {
  const form = qs('#contactSupportForm');
  if (!form) return;

  const user = getCurrentUser?.();
  if (!user) return;

  const nameInput = qs('#contactName');
  const emailInput = qs('#contactEmail');

  if (nameInput && !nameInput.value.trim()) {
    nameInput.value = user.name || '';
  }

  if (emailInput && !emailInput.value.trim()) {
    emailInput.value = user.email || '';
  }
}

async function handleSettingsForm(event) {
  event.preventDefault();
  const user = requireLogin();
  if (!user) return;
  if (!isValidEmail(qs('#settingsEmail')?.value.trim() || '')) {
    alert('Please enter a valid email address.');
    return;
  }
  try {
    const data = await apiFetch(`${API_BASE}/account/${user.id}/settings`, {
      method: 'PUT',
      body: JSON.stringify({
        name: qs('#settingsName')?.value.trim() || '',
        email: qs('#settingsEmail')?.value.trim() || '',
        phone: qs('#settingsPhone')?.value.trim() || '',
        preferences: {
          email_notifications: qs('#prefEmail')?.checked || false,
          message_notifications: qs('#prefMessages')?.checked || false,
          marketing_notifications: qs('#prefMarketing')?.checked || false
        }
      })
    });
   if (data.user) setCurrentUser({ ...getCurrentUser(), ...data.user });
    updateNavUserText();
    alert(data.message);
  } catch (error) {
    alert(error.message);
  }
}

async function handlePasswordForm(event) {
  event.preventDefault();
  const user = requireLogin();
  if (!user) return;
  const currentPassword = qs('#currentPassword').value;
  const newPassword = qs('#newPassword').value;
  const confirmNewPassword = qs('#confirmNewPassword').value;
  if (newPassword !== confirmNewPassword) return alert('New passwords do not match.');
  if (!isStrongPassword(newPassword)) return alert('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
  try {
    const data = await apiFetch(`${API_BASE}/account/${user.id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    alert(data.message);
    qs('#passwordForm').reset();
  } catch (error) {
    alert(error.message);
  }
}

async function loadNotificationsPage() {
  const user = requireLogin();
  if (!user) return;

  updateNavUserText();

  try {
    const items = await apiFetch(
      `${API_BASE}/notifications/${user.id}?requesterId=${user.id}`
    );

    const container = qs('#notificationsList');
    if (!container) return;

    container.innerHTML = items.length ? items.map((item) => `
      <div class="stack-card ${item.is_read ? '' : 'unread'}">
        <div class="d-flex justify-content-between gap-3 align-items-start">
          <div>
            <h5>${escapeHtml(item.title)}</h5>
            <p class="mb-1">${escapeHtml(item.message)}</p>
            <small>${escapeHtml(String(item.created_at || '').slice(0, 16).replace('T', ' '))}</small>
          </div>
          ${item.is_read ? '<span class="dot read"></span>' : '<span class="dot"></span>'}
        </div>
      </div>
    `).join('') : '<div class="empty-state">No notifications yet.</div>';
  } catch (error) {
    console.error(error);
  }
}

async function markNotificationsRead() {
  const user = requireLogin();
  if (!user) return false;

  await apiFetch(`${API_BASE}/notifications/mark-all-read`, {
    method: 'PATCH',
    body: JSON.stringify({
      userId: user.id
    })
  });

  await loadNotificationsPage();
  return true;
}

let messagesState = {
  all: [],
  grouped: [],
  selectedEmail: "",
  selectedSubject: "",
  userId: null,
  isComposeMode: false
};

messagesState.isComposeMode = false;

function startNewConversation(prefillRecipient = "", prefillSubject = "") {
  messagesState.selectedEmail = "";
  messagesState.selectedSubject = "";
  messagesState.isComposeMode = true;

  qs('#conversationEmptyState')?.classList.add('d-none');
  qs('#conversationPanel')?.classList.add('d-none');
  qs('#newMessageForm')?.classList.remove('d-none');

  const recipientInput = qs('#newMessageRecipient');
  const subjectInput = qs('#newMessageSubject');
  const bodyInput = qs('#newMessageBody');

  if (recipientInput) recipientInput.value = prefillRecipient || "";
  if (subjectInput) subjectInput.value = prefillSubject || "";
  if (bodyInput) bodyInput.value = "";

  bodyInput?.focus();

  renderMessagesInbox();
}

function getProfilePictureUrl(profilePicture, fallbackName = "User") {
  if (profilePicture && String(profilePicture).trim() !== "") {
    const cleanPath = String(profilePicture).trim();

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    if (cleanPath.startsWith("/uploads/")) {
      return `${API_ROOT}${cleanPath}`;
    }

    if (cleanPath.startsWith("uploads/")) {
      return `${API_ROOT}/${cleanPath}`;
    }

    if (cleanPath.startsWith("/")) {
      return `${API_ROOT}${cleanPath}`;
    }

    return `${API_ROOT}/uploads/${encodeURIComponent(cleanPath)}`;
  }

  const encodedName = encodeURIComponent(fallbackName || "User");
  return `https://ui-avatars.com/api/?name=${encodedName}&background=2563eb&color=ffffff`;
}

async function loadMessagesPage() {
  const user = requireLogin();
  if (!user) return;

  updateNavUserText();
  messagesState.userId = user.id;

  try {
    const messages = await apiFetch(`${API_BASE}/messages/${user.id}`);
    messagesState.all = Array.isArray(messages) ? messages : [];
    await loadHeaderBadges();

    const groupedMap = new Map();

    messagesState.all.forEach((item) => {
      const isOutgoing = Number(item.sender_id) === Number(user.id);

      const partnerEmail = isOutgoing
        ? (item.recipient_email || "")
        : (item.sender_email || "");

      const partnerName = isOutgoing
        ? (item.recipient_name || item.recipient_email || "Recipient")
        : (item.sender_name || item.sender_email || "Sender");

      if (!partnerEmail) return;

const partnerProfilePicture = isOutgoing
  ? item.recipient_profile_picture
  : item.sender_profile_picture;

     if (!groupedMap.has(partnerEmail)) {
  groupedMap.set(partnerEmail, {
    partnerEmail,
    partnerName,
    partnerProfilePicture,
    latestAt: "",
    latestPreview: "",
    latestSubject: "",
    unreadCount: 0
  });
}

      const group = groupedMap.get(partnerEmail);
      if (!group.partnerProfilePicture && partnerProfilePicture) {
  group.partnerProfilePicture = partnerProfilePicture;
}

      const createdAt = String(item.created_at || "");
      if (!group.latestAt || new Date(createdAt) > new Date(group.latestAt)) {
        group.latestAt = createdAt;
        group.latestPreview = item.body || "";
        group.latestSubject = item.subject || "SkillSync Conversation";
      }

      if (!isOutgoing && !Number(item.is_read)) {
        group.unreadCount += 1;
      }
    });

    messagesState.grouped = Array.from(groupedMap.values()).sort(
      (a, b) => new Date(b.latestAt || 0) - new Date(a.latestAt || 0)
    );

    renderMessagesInbox();
    loadHeaderBadges();

    const params = new URLSearchParams(window.location.search);
    const preferredRecipient = params.get("recipient") || "";
    const preferredSubject = params.get("subject") || "";

    if (preferredRecipient) {
      const existingThread = messagesState.grouped.find(
        (item) => item.partnerEmail.toLowerCase() === preferredRecipient.toLowerCase()
      );

      if (existingThread) {
        openConversation(existingThread.partnerEmail, preferredSubject);
      } else {
        startNewConversation(preferredRecipient, preferredSubject);
      }
      return;
    }

    if (messagesState.grouped.length) {
      openConversation(messagesState.grouped[0].partnerEmail);
    } else {
      showConversationEmpty();
    }
  } catch (error) {
    console.error(error);
  }
}

function renderMessagesInbox() {
  const container = qs('#messagesList');
  if (!container) return;

  if (!messagesState.grouped.length) {
    container.innerHTML = '<div class="empty-state">No messages yet.</div>';
    return;
  }

 container.innerHTML = messagesState.grouped.map((thread) => `
  <div class="message-thread-card ${thread.unreadCount ? 'unread' : ''} ${messagesState.selectedEmail === thread.partnerEmail ? 'active' : ''}"
       onclick="openConversation('${String(thread.partnerEmail).replace(/'/g, "\\'")}', '${String(thread.latestSubject || '').replace(/'/g, "\\'")}')">

    <img
      src="${getProfilePictureUrl(thread.partnerProfilePicture, thread.partnerName || 'User')}"
      alt="${escapeHtml(thread.partnerName || 'User')}"
      class="message-thread-avatar"
    >

    <div class="flex-grow-1">
      <div class="d-flex justify-content-between gap-3">
        <div>
          <h5>${escapeHtml(thread.partnerName)}</h5>
          <p class="thread-meta">${escapeHtml(thread.partnerEmail)}</p>
        </div>
        ${thread.unreadCount ? `<span class="badge bg-primary">${thread.unreadCount}</span>` : ''}
      </div>
      <p class="thread-preview">${escapeHtml(thread.latestPreview || 'No message preview available.')}</p>
      <p class="thread-time mt-2">${escapeHtml(formatMessageDate(thread.latestAt))}</p>
    </div>

  </div>
`).join('');
}

function openConversation(partnerEmail, preferredSubject = "") {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

    apiFetch(`${API_BASE}/messages/read`, {
    method: 'PATCH',
    body: JSON.stringify({
      userId: currentUser.id,
      partnerEmail
    })
  })
    .then(() => loadHeaderBadges())
    .catch((error) => console.error(error));

  messagesState.selectedEmail = partnerEmail || "";
  messagesState.isComposeMode = false;

  qs('#newMessageForm')?.classList.add('d-none');

  const titleEl = qs('#conversationTitle');
  const subtextEl = qs('#conversationSubtext');
  const threadEl = qs('#conversationThread');
  const emptyEl = qs('#conversationEmptyState');
  const panelEl = qs('#conversationPanel');
  const recipientInput = qs('#messageRecipient');
  const subjectInput = qs('#messageSubject');
  const recipientLabel = qs('#replyRecipientLabel');
  const subjectLabel = qs('#replySubjectLabel');

  const threadMeta = messagesState.grouped.find(
    (item) => item.partnerEmail === partnerEmail
  );

  const conversationMessages = messagesState.all
    .filter((item) => {
      const senderEmail = String(item.sender_email || "").toLowerCase();
      const recipientEmail = String(item.recipient_email || "").toLowerCase();
      const targetEmail = String(partnerEmail || "").toLowerCase();
      const myEmail = String(currentUser.email || "").toLowerCase();

      return (
        (senderEmail === myEmail && recipientEmail === targetEmail) ||
        (senderEmail === targetEmail && recipientEmail === myEmail)
      );
    })
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

  const finalSubject =
    preferredSubject ||
    threadMeta?.latestSubject ||
    conversationMessages[conversationMessages.length - 1]?.subject ||
    "SkillSync Conversation";

  if (recipientInput) recipientInput.value = partnerEmail || "";
  if (subjectInput) subjectInput.value = finalSubject;
  if (recipientLabel) recipientLabel.textContent = partnerEmail || "-";
  if (subjectLabel) subjectLabel.textContent = finalSubject || "-";

  if (titleEl) titleEl.textContent = threadMeta?.partnerName || partnerEmail || "Conversation";
  if (subtextEl) subtextEl.textContent = partnerEmail || "";

  if (emptyEl) emptyEl.classList.add('d-none');
  if (panelEl) panelEl.classList.remove('d-none');

  if (threadEl) {
    if (!conversationMessages.length) {
      threadEl.innerHTML = `
        <div class="empty-state">
          No conversation yet with <strong>${escapeHtml(partnerEmail)}</strong>.<br>
          Send your first message below.
        </div>
      `;
    } else {
     threadEl.innerHTML = conversationMessages.map((item) => {
  const isOutgoing = Number(item.sender_id) === Number(currentUser.id);

  const avatar = isOutgoing
    ? getProfilePictureUrl(item.sender_profile_picture, item.sender_name || "You")
    : getProfilePictureUrl(item.sender_profile_picture, item.sender_name || "User");

  return `
    <div class="message-row ${isOutgoing ? 'is-self' : 'is-other'}">

      ${!isOutgoing ? `
        <img
          src="${avatar}"
          alt="${escapeHtml(item.sender_name || 'User')}"
          class="message-bubble-avatar"
        >
      ` : ''}

      <div class="message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}">
        <strong class="message-sender-name">
          ${escapeHtml(isOutgoing ? "You" : (item.sender_name || "User"))}
        </strong>
        <div>${escapeHtml(item.body || '')}</div>
        <small class="message-time">${escapeHtml(formatMessageDate(item.created_at))}</small>
      </div>

      ${isOutgoing ? `
        <img
          src="${avatar}"
          alt="You"
          class="message-bubble-avatar"
        >
      ` : ''}

    </div>
  `;
}).join('');
    }

    threadEl.scrollTop = threadEl.scrollHeight;
  }

  renderMessagesInbox();
}

function showConversationEmpty() {
  qs('#conversationEmptyState')?.classList.remove('d-none');
  qs('#conversationPanel')?.classList.add('d-none');
}

function formatMessageDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16).replace('T', ' ');
  return date.toLocaleString();
}

async function handleMessageForm(event) {
  event.preventDefault();

  const user = requireLogin();
  if (!user) return;

  const recipient = qs('#messageRecipient')?.value.trim() || '';
  const subject = qs('#messageSubject')?.value.trim() || '';
  const body = qs('#messageBody')?.value.trim() || '';

  if (!recipient || !subject || !body) {
    alert('Please complete the message first.');
    return;
  }

  try {
    const data = await apiFetch(`${API_BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        sender_id: user.id,
        recipient_email: recipient,
        subject,
        body
      })
    });

    if (qs('#messageBody')) {
      qs('#messageBody').value = '';
    }

    await loadMessagesPage();
    await loadHeaderBadges();
    openConversation(recipient, subject);
  } catch (error) {
    alert(error.message);
  }
}

async function handlePublicInquiry(event) {
  event.preventDefault();
  const name = qs('#aboutName')?.value.trim() || '';
  const email = qs('#aboutEmail')?.value.trim() || '';
  const subject = qs('#aboutSubject')?.value.trim() || '';
  const message = qs('#aboutMessage')?.value.trim() || '';
  if (!name || !email || !subject || !message) return alert('Please complete all required fields.');
  if (!isValidEmail(email)) return alert('Please enter a valid email address.');
  try {
    const data = await apiFetch(`${API_BASE}/public/inquiries`, {
      method: 'POST',
      body: JSON.stringify({ name, email, subject, message })
    });
    alert(data.message);
    qs('#aboutContactForm')?.reset();
  } catch (error) {
    alert(error.message);
  }
}

function initPage() {
  updateNavUserText();

  qs('#regisform-login-form')?.addEventListener('submit', handleLogin);
 qs('#regisform-register-form')?.addEventListener('submit', handleRegister);
  qs('#profileForm')?.addEventListener('submit', handleProfileSubmit);
  qs('#settingsForm')?.addEventListener('submit', handleSettingsForm);
  qs('#preferencesForm')?.addEventListener('submit', handlePreferencesForm);
  qs('#passwordForm')?.addEventListener('submit', handlePasswordForm);
  qs('#postJobForm')?.addEventListener('submit', handlePostJob);
  qs('#contactSupportForm')?.addEventListener('submit', handleContactSupportForm);
  if (document.getElementById('contactSupportForm')) {
  prefillContactSupportForm();
}
  qs('#messageForm')?.addEventListener('submit', handleMessageForm);
  qs('#newMessageForm')?.addEventListener('submit', handleNewMessageForm);

  qsa('[data-logout-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      logoutUser();
    });
  });

 const regisformFullname = document.getElementById("regisform-fullname");
const regisformPhone = document.getElementById("regisform-phone");

if (regisformFullname) {
  regisformFullname.addEventListener("input", () => {
    regisformFullname.value = regisformFullname.value
      .replace(/[^a-zA-Z\s.'-]/g, "")   // allow letters + space + . ' -
      .replace(/\s{2,}/g, " ")          // prevent double spaces
      .replace(/^\s+/, "");             // no leading space
  });
}

  if (regisformPhone) {
    regisformPhone.addEventListener("input", () => {
      regisformPhone.value = regisformPhone.value.replace(/[^0-9]/g, "");
    });
  }

  const roleSelect = qs('#regisform-role');
  const resumeContainer = qs('#registerResumeContainer');

  const syncRegisterResumeVisibility = () => {
    if (!resumeContainer || !roleSelect) return;
    const showResume = roleSelect.value === 'jobseeker';
    resumeContainer.style.display = showResume ? '' : 'none';

    const resumeInput = qs('#regisform-resume');
    if (resumeInput && !showResume) resumeInput.value = '';
  };

  roleSelect?.addEventListener('change', syncRegisterResumeVisibility);
  syncRegisterResumeVisibility();

  qsa('[data-brand-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = getBrandHomeRoute();
    });
  });

  qsa('.password-toggle[data-target]').forEach((button) => {
    const targetSelector = button.getAttribute('data-target');
    const input = targetSelector ? document.querySelector(targetSelector) : null;

    if (!input) return;

    button.classList.add('inline', 'eye-toggle');
    wirePasswordButton(button, input);
  });

  if (document.getElementById('publicHomePage')) {
    loadPublicJobs();
    wireSearchInputs();
  }

  if (document.getElementById('studentDashboardPage')) {
    loadStudentDashboard();
  }

  if (document.getElementById('employerDashboardPage')) {
    loadEmployerDashboard();
  }

  if (document.getElementById('adminDashboardPage')) {
    loadAdminDashboard();
  }

    if (
    document.getElementById('userBrowsePage') ||
    document.getElementById('employerBrowsePage') ||
    document.getElementById('adminBrowsePage')
  ) {
    const currentUser = getCurrentUser();

    loadJobs('#browseJobsPageList', {
      showApply: currentUser?.role === 'jobseeker'
    });

    wireSearchInputs();
  }

  if (document.getElementById('profileForm')) {
    loadProfileForm();
  }

   if (document.getElementById('notificationsList')) {
    loadNotificationsPage();
  }

  if (document.getElementById('messagesList')) {
    loadMessagesPage();
  }

  if (document.getElementById('myJobsPage')) {
    loadMyJobsPage();
  }

  if (document.getElementById('manageJobList')) {
    loadManageJobs();
  }

  if (document.getElementById('settingsName')) {
    loadSettingsPage();
  }
}

async function handleNewMessageForm(event) {
  event.preventDefault();

  const user = requireLogin();
  if (!user) return;

  const recipient = qs('#newMessageRecipient')?.value.trim() || '';
  const subject = qs('#newMessageSubject')?.value.trim() || '';
  const body = qs('#newMessageBody')?.value.trim() || '';

  if (!recipient || !subject || !body) {
    alert('Please complete all message fields.');
    return;
  }

  try {
    const data = await apiFetch(`${API_BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        sender_id: user.id,
        recipient_email: recipient,
        subject,
        body
      })
    });

    alert(data.message);
    await loadMessagesPage();
    await loadHeaderBadges();
    openConversation(recipient, subject);
  } catch (error) {
    alert(error.message);
  }
}

function getEyeIconMarkup(isHidden = true) {
  return isHidden
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"></path><path d="M10.6 10.7a3 3 0 0 0 4.2 4.2"></path><path d="M9.9 5.2A11.3 11.3 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-4 4.8"></path><path d="M6.6 6.7C4.1 8.4 2.5 12 2.5 12A18.6 18.6 0 0 0 12 19a11.6 11.6 0 0 0 3-.4"></path></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
}

function wirePasswordButton(button, input) {
  if (!button || !input) return;

  const syncButtonState = () => {
    const isHidden = input.type === 'password';
    button.innerHTML = getEyeIconMarkup(isHidden);
    button.setAttribute('aria-label', isHidden ? 'Show password' : 'Hide password');
    button.setAttribute('title', isHidden ? 'Show password' : 'Hide password');
  };

  syncButtonState();

  button.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
    syncButtonState();
  });
}

function initChatbot() {
  const chatbotContainer = document.getElementById('chatbotContainer');
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotBox = document.getElementById('chatbotBox');
  const chatbotClose = document.getElementById('chatbotClose');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const chatbotBody = document.getElementById('chatbotBody');

  if (!chatbotContainer || !chatbotToggle || !chatbotBox || !chatbotBody) return;

  const user = getCurrentUser?.();
  const role = user?.role || 'guest';
  const chatStorageKey = `skillsync_chat_${user?.id || 'guest'}`;

  const assistantNames = {
    guest: 'SkillSync Assistant',
    jobseeker: 'Job Search Assistant',
    employer: 'Hiring Assistant',
    admin: 'Admin Assistant'
  };

function getSuggestedQuestionsByRole(role) {
  if (role === "jobseeker") {
    return [
      "Recommend jobs",
      "Improve resume",
      "Match my skills",
      "How to apply"
    ];
  }

  if (role === "employer") {
    return [
      "Post a job",
      "Find applicants",
      "Review applications",
      "Improve job post"
    ];
  }

  if (role === "admin") {
    return [
      "View system stats",
      "Manage users",
      "Approve accounts",
      "Monitor jobs"
    ];
  }

  // public / guest
  return [
    "About SkillSync",
    "How to register",
    "Find jobs",
    "Contact support"
  ];
}

function appendMessage(message, type = 'bot', save = true) {
  const row = document.createElement('div');
  row.className = `chatbot-row ${type}`;

  const bubble = document.createElement('div');
  bubble.className = `chatbot-message ${type}-message`;
  bubble.textContent = message;

  row.appendChild(bubble);
  chatbotBody.appendChild(row);

  chatbotBody.scrollTo({
    top: chatbotBody.scrollHeight,
    behavior: 'smooth'
  });

  if (save) {
  const chatHistory = JSON.parse(localStorage.getItem(chatStorageKey) || '[]');
  chatHistory.push({ message, type });
  localStorage.setItem(chatStorageKey, JSON.stringify(chatHistory));
}
}

function renderSuggestedQuestions() {
  const wrap = document.getElementById("chatbotQuickActions");
  if (!wrap) return;

  const questions = getSuggestedQuestionsByRole(role);

  wrap.innerHTML = questions.map((question) => `
    <button
      type="button"
      class="chatbot-quick-btn"
      data-chatbot-question="${escapeHtml(question)}">
      ${escapeHtml(question)}
    </button>
  `).join("");

  qsa('[data-chatbot-question]', wrap).forEach((button) => {
    button.addEventListener('click', () => {
      sendMessage(button.getAttribute('data-chatbot-question'));
    });
  });
}

function clearChat() {
  const confirmClear = confirm("Clear all chat messages?");
  if (!confirmClear) return;

  localStorage.removeItem(chatStorageKey);

  chatbotBody.innerHTML = "";

  const welcomeMessage = `Hello${user?.name ? `, ${user.name}` : ''}. I’m your ${
    assistantNames[role] || assistantNames.guest
  }. Ask me about ${
    role === 'guest'
      ? 'registration, login, and jobs'
      : role === 'jobseeker'
      ? 'profiles, matches, and applications'
      : role === 'employer'
      ? 'posting jobs, applicants, and messages'
      : 'approvals, moderation, and monitoring'
  }.`;

  appendMessage(welcomeMessage, 'bot', true);
  renderSuggestedQuestions();

  if (chatInput) chatInput.value = '';
}

window.clearChat = clearChat;

  function openChatbot() {
    chatbotContainer.classList.add('is-open');
    chatbotToggle.setAttribute('aria-expanded', 'true');
    chatbotBox.style.display = 'flex';

    setTimeout(() => {
      chatbotBody.scrollTop = chatbotBody.scrollHeight;
      chatInput?.focus();
    }, 100);
  }

  function closeChatbot() {
    chatbotContainer.classList.remove('is-open');
    chatbotToggle.setAttribute('aria-expanded', 'false');
    chatbotBox.style.display = 'none';
  }

  async function sendMessage(messageText = null) {
    const text = (messageText || chatInput?.value || '').trim();
    if (!text) return;

    appendMessage(text, 'user');

    if (chatInput) {
      chatInput.value = '';
      chatInput.focus();
    }

    const typingRow = document.createElement('div');
    typingRow.className = 'chatbot-row bot';
    typingRow.id = 'chatbotTypingRow';

    const typingBubble = document.createElement('div');
    typingBubble.className = 'chatbot-message bot-message';
    typingBubble.textContent = 'Thinking.';

    typingRow.appendChild(typingBubble);
    chatbotBody.appendChild(typingRow);

    chatbotBody.scrollTo({
      top: chatbotBody.scrollHeight,
      behavior: 'smooth'
    });

    try {
      const user = getCurrentUser();

const data = await apiFetch(`${API_BASE}/ai/chat`, {
  method: 'POST',
  body: JSON.stringify({
    message: text,
    role,
    userId: user?.id || null
  })
});

      const typing = document.getElementById('chatbotTypingRow');
if (typing) typing.remove();

const reply = data.reply || 'No response.';

const row = document.createElement('div');
row.className = 'chatbot-row bot';

const bubble = document.createElement('div');
bubble.className = 'chatbot-message bot-message';
bubble.textContent = '';

row.appendChild(bubble);
chatbotBody.appendChild(row);

let i = 0;
const speed = 15;

function typeEffect() {
  if (i < reply.length) {
    bubble.textContent += reply.charAt(i);
    i++;
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
    setTimeout(typeEffect, speed);
  } else {
    const chatHistory = JSON.parse(localStorage.getItem(chatStorageKey) || '[]');
    chatHistory.push({ message: reply, type: 'bot' });
    localStorage.setItem(chatStorageKey, JSON.stringify(chatHistory));
  }
}

typeEffect();
    } catch (error) {
      console.error('Chatbot AI error:', error);

      const typing = document.getElementById('chatbotTypingRow');
      if (typing) typing.remove();

      appendMessage('Sorry, the AI assistant is unavailable right now.', 'bot');
    }
  }

  chatbotBody.innerHTML = '';

const savedChat = JSON.parse(localStorage.getItem(chatStorageKey) || '[]');

if (savedChat.length > 0) {
  savedChat.forEach((msg) => {
    appendMessage(msg.message, msg.type, false);
  });
} else {
  appendMessage(
    `Hello${user?.name ? `, ${user.name}` : ''}. I’m your ${
      assistantNames[role] || assistantNames.guest
    }. Ask me about ${
      role === 'guest'
        ? 'registration, login, and jobs'
        : role === 'jobseeker'
        ? 'profiles, matches, and applications'
        : role === 'employer'
        ? 'posting jobs, applicants, and messages'
        : 'approvals, moderation, and monitoring'
    }.`
  );
}

  renderSuggestedQuestions();

  chatbotToggle.addEventListener('click', openChatbot);
  chatbotClose?.addEventListener('click', closeChatbot);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatbotContainer.classList.contains('is-open')) {
      closeChatbot();
    }
  });

  chatSend?.addEventListener('click', () => sendMessage());

  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
} 

async function loadHeaderBadges() {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const [notifications, messages] = await Promise.all([
      apiFetch(`${API_BASE}/notifications/${user.id}?requesterId=${user.id}`),
      apiFetch(`${API_BASE}/messages/${user.id}`)
    ]);

    const noteUnread = notifications.filter(item => !item.is_read).length;
    const msgUnread = messages.filter(item =>
      Number(item.recipient_id) === Number(user.id) && Number(item.is_read) === 0
    ).length;

    const noteBadge = qs('#headerNotificationBadge');
    const msgBadge = qs('#headerMessageBadge');

    if (noteBadge) {
      noteBadge.textContent = noteUnread;
      noteBadge.classList.toggle('d-none', !noteUnread);
    }

    if (msgBadge) {
      msgBadge.textContent = msgUnread;
      msgBadge.classList.toggle('d-none', !msgUnread);
    }

    const name = user.name || 'SkillSync User';
    const avatar = qs('#headerAvatar');

    if (avatar) {
      if (user.profile_picture) {
        avatar.innerHTML = `<img src="${API_ROOT}/uploads/${encodeURIComponent(user.profile_picture)}" alt="Profile">`;
      } else {
        avatar.textContent = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
      }
    }

    const nameTargets = qsa('[data-user-name]');
    nameTargets.forEach(el => el.textContent = name);

    const emailEl = qs('[data-user-email]');
    if (emailEl) emailEl.textContent = user.email || '';

    const roleEl = qs('#dropdownRoleLabel');
    if (roleEl) roleEl.textContent = `${(user.role || 'user').toUpperCase()} account`;

    const statusEl = qs('#headerUserStatus');
    if (statusEl) statusEl.textContent = user.availability_status || 'Available for opportunities';

    const statusDot = qs('#headerStatusDot');
    if (statusDot) {
      statusDot.className = `header-status-dot ${String(user.availability_status || 'Available').toLowerCase().replace(/[^a-z]+/g, '-')}`;
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadMyJobsPage() {
  const user = requireLogin('jobseeker');
  if (!user) return;
  updateNavUserText();
  try {
    const applications = await apiFetch(`${API_BASE}/applications/user/${user.id}`);
   const accepted = applications.filter(app => {
  const status = String(app.status || '').toLowerCase();
  return status === 'accepted' || status === 'approved';
});
    const wrap = qs('#acceptedJobsList');
    if (!wrap) return;
    wrap.innerHTML = accepted.length ? accepted.map(item => `
      <div class="stack-card unread">
        <div class="d-flex justify-content-between gap-3 flex-wrap align-items-start">
          <div>
            <h4>${escapeHtml(item.title)}</h4>
            <p class="mb-1"><strong>${escapeHtml(item.company)}</strong></p>
            <p class="mb-1">${escapeHtml(item.location || 'Location not provided')} • ${escapeHtml(item.job_type || 'Open')}</p>
            <p class="mb-2">Congratulations. This application is marked as accepted.</p>
            ${item.employer_email ? `<p class="mb-2"><strong>Employer Email:</strong> ${escapeHtml(item.employer_email)}</p>` : ''}
            <div class="skills-inline">${normalizeSkills(item.skills).map(skill => `<span>${escapeHtml(skill)}</span>`).join('') || '<span>No skills listed</span>'}</div>
          </div>
          <div class="accepted-job-actions">
  <a href="?page=messages" class="btn btn-primary app-btn btn-sm">Open Messages</a>

  <a href="?page=notifications" class="btn updates-btn btn-sm">
    <span class="updates-btn-icon">🔔</span>
    <span class="updates-btn-text">View Updates</span>
  </a>

  <button type="button" class="btn btn-outline-soft btn-sm" onclick="openJobDetails(${item.job_id || item.id})">View Job</button>
</div>
        </div>
      </div>`).join('') : '<div class="empty-state">No accepted jobs yet. Once an employer accepts your application, it will appear here.</div>';
  } catch (error) { console.error(error); }
}

function initDeveloperCarousel() {
  const track = qs('#developerTrack');
  if (!track) return;
  qsa('[data-dev-carousel]').forEach(button => {
    button.addEventListener('click', () => {
      const direction = button.getAttribute('data-dev-carousel');
      track.scrollBy({ left: direction === 'next' ? 320 : -320, behavior: 'smooth' });
    });
  });
}

function initFaq() {
  qsa('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      item?.classList.toggle('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  syncHomepageAuthState();
  initPage();
  initChatbot();
  initDeveloperCarousel();
  initFaq();
  loadHeaderBadges();

  const user = getCurrentUser();
  if (user && document.getElementById('publicHomePage')) {
    window.location.href = getDashboardRoute(user.role);
    return;
  }
});
window.applyToJob = applyToJob;
window.deleteJob = deleteJob;
window.updateApplicationStatus = updateApplicationStatus;
window.logoutUser = logoutUser;
window.updateUserStatus = updateUserStatus;
window.updateJobStatus = updateJobStatus;
window.openJobDetails = openJobDetails;
window.startEditJob = startEditJob;
window.emailApplicant = emailApplicant;

document.addEventListener("DOMContentLoaded", () => {
  const postBtn = document.getElementById("navPostJob");
  const manageBtn = document.getElementById("navManageJob");

  const postModal = document.getElementById("postJobModal");
  const manageModal = document.getElementById("manageJobModal");
    const jobTypeEl = document.getElementById("jobType");
  if (jobTypeEl && !jobTypeEl.dataset.endDateBound) {
    jobTypeEl.addEventListener("change", syncJobEndDateVisibility);
    jobTypeEl.dataset.endDateBound = "true";
    syncJobEndDateVisibility();
  }
   
  if (postModal) {
    postModal.addEventListener("hidden.bs.modal", () => {
      resetPostJobFormMode();
    });
  }

  function clearModalActive() {
    document.querySelectorAll(".modal-nav-link").forEach(el => {
      el.classList.remove("modal-active");
    });
  }

  if (postBtn && postModal) {
    postModal.addEventListener("show.bs.modal", () => {
      clearModalActive();
      postBtn.classList.add("modal-active");
    });

    postModal.addEventListener("hidden.bs.modal", () => {
      postBtn.classList.remove("modal-active");
    });
  }

  if (manageBtn && manageModal) {
    manageModal.addEventListener("show.bs.modal", () => {
      clearModalActive();
      manageBtn.classList.add("modal-active");
    });

    manageModal.addEventListener("hidden.bs.modal", () => {
      manageBtn.classList.remove("modal-active");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  syncHomepageAuthState();

  const loader = document.getElementById("pageLoader");

  window.addEventListener("load", () => {
    loader?.classList.remove("show");
  });

  document.querySelectorAll('a[href*="?page="]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";

      if (
        !href ||
        href.startsWith("#") ||
        link.hasAttribute("data-bs-toggle") ||
        link.hasAttribute("data-logout-link") ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      loader?.classList.add("show");
    });
  });

    const faqList = document.getElementById("homepageFaqList");
  const faqToggleBtn = document.getElementById("faqToggleBtn");

  if (faqList && faqToggleBtn) {
    const faqItems = Array.from(faqList.querySelectorAll(".faq-item"));
    const initialVisibleFaqs = 6;
    let faqExpanded = false;

    const updateFaqVisibility = () => {
      faqItems.forEach((item, index) => {
        item.classList.toggle("faq-hidden", !faqExpanded && index >= initialVisibleFaqs);
      });

      faqToggleBtn.textContent = faqExpanded ? "Show less FAQs" : "Show more FAQs";
      faqToggleBtn.style.display = faqItems.length > initialVisibleFaqs ? "inline-flex" : "none";
    };

    updateFaqVisibility();

    faqToggleBtn.addEventListener("click", () => {
      faqExpanded = !faqExpanded;
      updateFaqVisibility();
    });
  }

  // Footer social links (placeholder behavior)
  const footerFacebook = document.getElementById("footerFacebookLink");
  const footerTwitter = document.getElementById("footerTwitterLink");
  const footerLinkedIn = document.getElementById("footerLinkedInLink");

  const handleSocialClick = (platform) => {
    alert(`Official ${platform} page is not available yet.`);
  };

  footerFacebook?.addEventListener("click", (e) => {
    e.preventDefault();
    handleSocialClick("Facebook");
  });

  footerTwitter?.addEventListener("click", (e) => {
    e.preventDefault();
    handleSocialClick("Twitter / X");
  });

  footerLinkedIn?.addEventListener("click", (e) => {
    e.preventDefault();
    handleSocialClick("LinkedIn");
  });

  // Footer subscribe form (placeholder behavior)
  const subscribeForm = document.getElementById("footerSubscribeForm");
  const subscribeEmail = document.getElementById("footerSubscribeEmail");

  subscribeForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = (subscribeEmail?.value || "").trim();

    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    alert("Subscription feature is not available yet.");
    subscribeForm.reset();
  });

});



document.querySelectorAll('.regisform-send-otp').forEach((btn) => {
  let cooldownTimer = null;
  let cooldownLeft = 0;

  const startCooldown = (seconds = 60) => {
    cooldownLeft = seconds;
    btn.disabled = true;
    btn.innerText = `Resend in ${cooldownLeft}s`;

    cooldownTimer = setInterval(() => {
      cooldownLeft -= 1;

      if (cooldownLeft <= 0) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
        btn.disabled = false;
        btn.innerText = 'Send OTP';
        return;
      }

      btn.innerText = `Resend in ${cooldownLeft}s`;
    }, 1000);
  };

  btn.addEventListener('click', async () => {
    const form = btn.closest('form');
    const emailInput = form.querySelector('input[name="email"]');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
      showOtpStatusMessage('Enter your email first.', 'warning');
      return;
    }

    if (btn.disabled) return;

    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Sending...';

    try {
      clearOtpStatusMessage();

      const response = await fetch('assets/php/send_otp.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'email=' + encodeURIComponent(email)
      });

      const rawText = await response.text();
      let data;

      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error("OTP raw response:", rawText);
        throw new Error("OTP endpoint returned invalid JSON.");
      }

      if (data.status === 'success') {
        showOtpStatusMessage('OTP sent to your email. Please check your inbox.', 'success');
        startCooldown(60);
      } else {
        showOtpStatusMessage(data.message || 'Failed to send OTP.', 'error');
        btn.disabled = false;
        btn.innerText = originalText;
      }
    } catch (error) {
      console.error(error);
      showOtpStatusMessage('Something went wrong while sending OTP.', 'error');
      btn.disabled = false;
      btn.innerText = originalText;
    }
  });
});

function ensureOtpStatusBox(formSelector = '#regisform-register-form') {
  const form = qs(formSelector) || qs('#regisform-form') || document.body;
  let box = qs('#otpStatusMessage');
  if (box) return box;

  box = document.createElement('div');
  box.id = 'otpStatusMessage';
  box.style.marginTop = '10px';
  box.style.padding = '10px 12px';
  box.style.borderRadius = '10px';
  box.style.fontSize = '14px';
  box.style.display = 'none';
  form.appendChild(box);

  return box;
}

function showOtpStatusMessage(message, type = 'success') {
  const box = ensureOtpStatusBox();
  if (!box) return;

  box.textContent = message || '';
  box.style.display = message ? 'block' : 'none';

  if (type === 'success') {
    box.style.background = 'rgba(25, 135, 84, 0.12)';
    box.style.border = '1px solid rgba(25, 135, 84, 0.35)';
    box.style.color = '#198754';
  } else if (type === 'warning') {
    box.style.background = 'rgba(255, 193, 7, 0.14)';
    box.style.border = '1px solid rgba(255, 193, 7, 0.35)';
    box.style.color = '#b78103';
  } else {
    box.style.background = 'rgba(220, 53, 69, 0.12)';
    box.style.border = '1px solid rgba(220, 53, 69, 0.35)';
    box.style.color = '#dc3545';
  }
}

function clearOtpStatusMessage() {
  const box = qs('#otpStatusMessage');
  if (box) {
    box.textContent = '';
    box.style.display = 'none';
  }
}

function getPasswordStrengthInfo(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { label: 'Weak', color: '#ef4444', width: '33%' };
  }
  if (score <= 4) {
    return { label: 'Medium', color: '#f59e0b', width: '66%' };
  }
  return { label: 'Strong', color: '#22c55e', width: '100%' };
}


function getPasswordStrengthInput() {
  const registerInput = document.querySelector('#regisform-register-form #regisform-password');
  if (registerInput) return registerInput;

  const resetInput = document.querySelector('#resetPasswordForm #newPassword');
  if (resetInput) return resetInput;

  const settingsInput =
    document.querySelector('#changePasswordForm #newPassword') ||
    document.querySelector('#passwordForm #newPassword');
  if (settingsInput) return settingsInput;

  return null;
}

function ensurePasswordStrengthUI() {
  const passwordInput = getPasswordStrengthInput();
  if (!passwordInput) return null;

  let wrap = document.getElementById('passwordStrengthWrap');
  if (wrap) return wrap;

  wrap = document.createElement('div');
  wrap.id = 'passwordStrengthWrap';
  wrap.className = 'password-strength-wrap';

  wrap.innerHTML = `
    <div id="passwordStrengthText" class="password-strength-text"></div>
    <div class="password-strength-track">
      <div id="passwordStrengthBar" class="password-strength-bar"></div>
    </div>
  `;

  const fieldWrap = passwordInput.closest('.password-field-wrap, .password-input-wrap');
  if (fieldWrap) {
    fieldWrap.insertAdjacentElement('afterend', wrap);
  } else {
    passwordInput.insertAdjacentElement('afterend', wrap);
  }

  return wrap;
}

function updatePasswordStrengthUI() {
  const passwordInput = getPasswordStrengthInput();
  if (!passwordInput) return;

  ensurePasswordStrengthUI();

  const textEl = document.getElementById('passwordStrengthText');
  const barEl = document.getElementById('passwordStrengthBar');
  if (!textEl || !barEl) return;

  const value = passwordInput.value || '';

  if (!value.trim()) {
    textEl.textContent = '';
    barEl.style.width = '0%';
    barEl.style.background = 'transparent';
    return;
  }

  const info = getPasswordStrengthInfo(value);

  textEl.textContent = `Password strength: ${info.label}`;
  textEl.style.color = info.color;
  barEl.style.width = info.width;
  barEl.style.background = info.color;
}

// Initialize password strength indicator on page load
function initPasswordStrengthUI() {
  const passwordInput = getPasswordStrengthInput();
  if (!passwordInput) return;

  ensurePasswordStrengthUI();

  passwordInput.removeEventListener('input', updatePasswordStrengthUI);
  passwordInput.addEventListener('input', updatePasswordStrengthUI);

  passwordInput.removeEventListener('focus', updatePasswordStrengthUI);
  passwordInput.addEventListener('focus', updatePasswordStrengthUI);

  updatePasswordStrengthUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPasswordStrengthUI);
} else {
  initPasswordStrengthUI();
}

document.addEventListener('DOMContentLoaded', () => {
  const otpInput = qs('#regisform-email-otp');

  if (otpInput) {
    otpInput.setAttribute('inputmode', 'numeric');
    otpInput.setAttribute('pattern', '[0-9]*');
    otpInput.setAttribute('maxlength', '6');
    otpInput.setAttribute('autocomplete', 'one-time-code');

    otpInput.addEventListener('input', () => {
      otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, 6);
    });

    otpInput.addEventListener('paste', (event) => {
      event.preventDefault();
      const pasted = (event.clipboardData || window.clipboardData).getData('text') || '';
      otpInput.value = pasted.replace(/\D/g, '').slice(0, 6);
    });
  }
});

async function sendChatMessage(message, role = "guest") {
  const response = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message, role })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to get AI response.");
  }

  return data.reply;
}

/* ===== REQUIRE LOGIN BEFORE APPLY (PUBLIC ONLY) ===== */
document.addEventListener("click", function (e) {
  const applyBtn = e.target.closest(".btn-apply, .apply-now-btn");
  if (!applyBtn) return;

  /* only run this on public landing/public pages */
  const isPublicPage = !!document.getElementById("publicHomePage");
  if (!isPublicPage) return;

  const isLoggedIn = document.body.dataset.loggedIn === "true";
  if (isLoggedIn) return;

  e.preventDefault();

  showLoginPrompt(() => {
    window.location.href = "?page=login";
  });
});



/* ===== SIMPLE LOGIN PROMPT ===== */
function showLoginPrompt(callback) {
  const modal = document.createElement("div");
  modal.className = "login-required-modal";

  modal.innerHTML = `
    <div class="login-required-box">
      <h4>Login Required</h4>
      <p>You need to log in first before continuing.</p>
      <div class="login-required-actions">
        <button class="btn btn-secondary cancel-login">Cancel</button>
        <button class="btn btn-primary proceed-login">Login</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".cancel-login").onclick = () => {
    modal.remove();
  };

  modal.querySelector(".proceed-login").onclick = () => {
    modal.remove();
    if (callback) callback();
  };
}


/* ===== ENTER TO SEND (ALL MESSAGE FORMS) ===== */
(function () {

  function attachEnterToSend(textareaId, formSelector) {
    const textarea = document.getElementById(textareaId);
    const form = document.querySelector(formSelector);

    if (!textarea || !form) return;

    textarea.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        // prevent empty message
        if (!textarea.value.trim()) return;

        form.requestSubmit(); // cleaner than click
      }
    });
  }

  // Apply to BOTH forms
  attachEnterToSend("messageBody", "#messageForm");
  attachEnterToSend("newMessageBody", "#newMessageForm");

})();

/* ===== GLOBAL MODAL CLEANUP (FIX FREEZE BUG) ===== */
document.addEventListener("hidden.bs.modal", function () {
  setTimeout(() => {
    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
  }, 200);
});


function handleEmailEmployerClick(email, employerId) {
  const currentUser = getCurrentUser?.();

  if (!currentUser || !currentUser.id) {
    showLoginPrompt(() => {
      window.location.href = "?page=login";
    });
    return;
  }

  if (!email) {
    alert("Employer email is not available.");
    return;
  }

  const encodedEmail = encodeURIComponent(email);
  const encodedEmployerId = encodeURIComponent(employerId || "");
  window.location.href = `?page=messages&compose=1&recipient=${encodedEmail}&employerId=${encodedEmployerId}`;
}



function renderPaginationControls(targetSelector, options = {}) {
  const pagination = document.getElementById("jobsPagination");
  if (!pagination) return;

  if (targetSelector !== "#publicJobsList") {
    pagination.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(allJobsCache.length / jobsPerPage);
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = i;
    btn.className = `pagination-btn ${i === currentPage ? "active" : ""}`;

    btn.addEventListener("click", () => {
      currentPage = i;
      loadJobs(targetSelector, options);
    });

    pagination.appendChild(btn);
  }
}

async function loadDashboardRecentJobs() {
  const user = getCurrentUser();

  let url = `${API_BASE}/jobs`;
  if (user?.role === "jobseeker") {
    url += `?userId=${user.id}`;
  }

  try {
    const jobs = await apiFetch(url);
    dashboardJobsCache = jobs;

    const start = (dashboardCurrentPage - 1) * dashboardJobsPerPage;
    const end = start + dashboardJobsPerPage;
    const jobsToShow = jobs.slice(start, end);

    const container = document.getElementById("recentJobsList");
    if (!container) return;

    container.innerHTML = jobsToShow.length
      ? jobsToShow.map((job) => getJobCardHtml(job, user, true, "default")).join("")
      : '<div class="text-secondary py-4">No jobs found.</div>';

    renderDashboardJobsPagination();
  } catch (error) {
    console.error(error);
  }
}

function renderDashboardJobsPagination() {
  const pagination = document.getElementById("dashboardJobsPagination");
  if (!pagination) return;

  const totalPages = Math.ceil(dashboardJobsCache.length / dashboardJobsPerPage);
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = i;
    btn.className = `pagination-btn ${i === dashboardCurrentPage ? "active" : ""}`;

    btn.addEventListener("click", () => {
      dashboardCurrentPage = i;
      loadDashboardRecentJobs();
    });

    pagination.appendChild(btn);
  }
}

async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const body = document.getElementById("chatbotBody");
  const user = getCurrentUser?.();

  if (!input || !body) return;

  const message = input.value.trim();
  if (!message) return;

  body.innerHTML += `
    <div class="chatbot-message chatbot-user">
      <div class="chatbot-bubble">${escapeHtml(message)}</div>
    </div>
  `;

  input.value = "";

  body.innerHTML += `
    <div class="chatbot-message chatbot-bot chatbot-thinking" id="chatbotThinking">
      <div class="chatbot-bubble">Thinking...</div>
    </div>
  `;
  body.scrollTop = body.scrollHeight;

  try {
    const data = await apiFetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      body: JSON.stringify({
        message,
        role: user?.role || "guest"
      })
    });

    const thinking = document.getElementById("chatbotThinking");
    if (thinking) thinking.remove();

    body.innerHTML += `
      <div class="chatbot-message chatbot-bot">
        <div class="chatbot-bubble">${escapeHtml(data.reply || "No response.")}</div>
      </div>
    `;
  } catch (error) {
    const thinking = document.getElementById("chatbotThinking");
    if (thinking) thinking.remove();

    body.innerHTML += `
      <div class="chatbot-message chatbot-bot">
        <div class="chatbot-bubble">Sorry, the AI assistant is unavailable right now.</div>
      </div>
    `;
  }

body.scrollTop = body.scrollHeight;
};

qs('#markNotificationsRead')?.addEventListener('click', async () => {
  const btn = qs('#markNotificationsRead');
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = 'Marking...';

  try {
    await markNotificationsRead();

    if (typeof updateHeaderBadges === 'function') {
      updateHeaderBadges();
    }
  } catch (error) {
    console.error(error);
    alert(error.message || 'Failed to mark notifications.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Mark all as read';
  }
});


function clearChat() {
  const confirmClear = confirm("Clear all chat messages?");
  if (!confirmClear) return;

  if (typeof chatStorageKey !== "undefined" && chatStorageKey) {
    localStorage.removeItem(chatStorageKey);
  }

  localStorage.removeItem("skillsync_chat_guest");

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("skillsync_chat_")) {
      localStorage.removeItem(key);
    }
  });

  const chatBody = document.getElementById("chatbotBody");
  if (chatBody) {
    chatBody.innerHTML = "";
  }

  const user = getCurrentUser?.();
  const roleName =
    typeof role !== "undefined" && role
      ? role
      : (user?.role || "guest");

  const assistantLabel =
    typeof assistantNames !== "undefined" && assistantNames?.[roleName]
      ? assistantNames[roleName]
      : "SkillSync Assistant";

  const welcomeMessage = `Hello${user?.name ? `, ${user.name}` : ''}. I’m your ${assistantLabel}. Ask me about ${
    roleName === 'guest'
      ? 'registration, login, and jobs'
      : roleName === 'jobseeker'
      ? 'profiles, matches, and applications'
      : roleName === 'employer'
      ? 'posting jobs, applicants, and messages'
      : 'approvals, moderation, and monitoring'
  }.`;

  if (typeof appendMessage === "function") {
    appendMessage(welcomeMessage, "bot", false);
  }

  if (typeof renderSuggestedQuestions === "function") {
    renderSuggestedQuestions();
  }

  if (typeof chatHistory !== "undefined" && Array.isArray(chatHistory)) {
    chatHistory.length = 0;
    chatHistory.push({ sender: "bot", text: welcomeMessage });
  }

  if (typeof chatStorageKey !== "undefined" && chatStorageKey) {
    localStorage.setItem(chatStorageKey, JSON.stringify(chatHistory || [{ sender: "bot", text: welcomeMessage }]));
  }
}