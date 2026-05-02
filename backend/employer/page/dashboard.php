<section class="employer-dashboard">
<div class="employerlogin-header" id="employerDashboardPage">
    <div class="employerlogin-title">Welcome, <span data-welcome-name>User</span></div>
    <div class="employerlogin-subtitle" data-company-name>Company</div>
</div>
<div class="employerlogin-stats">
    <div class="employerlogin-card">
        <h4>Total Jobs Posted</h4>
        <p id="employerTotalJobs">0</p>
    </div>
    <div class="employerlogin-card">
        <h4>Recent Applications</h4>
        <p id="employerRecentApplications" style="color:#22c55e;">0</p>
    </div>
    <div class="employerlogin-card">
        <h4>Status</h4>
        <p style="color:#22c55e;">Active</p>
    </div>
</div>
<div class="employerlogin-actions">
    <div data-bs-toggle="modal" data-bs-target="#postJobModal" class="employerlogin-postnewjob">
        <h3>+ Post New Job</h3>
        <p>Create a new job listing</p>
    </div>
    <div class="employerlogin-managejobs"
     data-bs-toggle="modal"
     data-bs-target="#manageJobModal"
     role="button"
     tabindex="0">
    <h3>Manage Jobs</h3>
    <p>View and manage your job postings</p>
</div>
</div>
<div class="employerlogin-joblist">
  <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
    <h2 class="mb-0">Recent Applications</h2>
    <small class="text-secondary">Use Accept or Reject to update each application.</small>
  </div>

  <div id="employerJobList">
  <div class="modern-job-card employer-application-card">Loading applications...</div>
</div>

<div id="employerApplicationsPagination" class="dashboard-pagination-wrap"></div>
</div>
</section>