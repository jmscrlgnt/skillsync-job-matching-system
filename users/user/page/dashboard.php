<section class="user-container">
    <div class="container my-5" id="studentDashboardPage">
        <h1 class="mb-2">Welcome back, <span data-welcome-name>User</span>!</h1>
        <p class="text-muted mb-4">Find your next opportunity</p>

        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="dashboard-card blue">
                    <p>Total Applications</p>
                    <h2 id="totalApplications">0</h2>
                </div>
            </div>
            <div class="col-md-4">
                <div class="dashboard-card orange">
                    <p>Pending</p>
                    <h2 id="pendingApplications">0</h2>
                </div>
            </div>
            <div class="col-md-4">
                <div class="dashboard-card green">
                    <p>Approved</p>
                    <h2 id="approvedApplications">0</h2>
                </div>
            </div>
        </div>

        <div class="row g-3 dashboard-actions mb-5">
            <div class="col-md-6">
                <a href="#" class="action-card blue-bg" data-bs-toggle="modal" data-bs-target="#browseJobsModal">
                    <h3>🔍 Browse Jobs</h3>
                    <p>Search for new opportunities</p>
                </a>
            </div>
            <div class="col-md-6">
                <a href="#" class="action-card green-bg" data-bs-toggle="modal" data-bs-target="#myApplicationsModal">
                    <h3>💼 My Applications</h3>
                    <p>Track your job applications</p>
                </a>
            </div>
        </div>

        <div class="recent-header">
            <h2>Recent Job Openings</h2>
            <a href="#" data-bs-toggle="modal" data-bs-target="#browseJobsModal">View All</a>
        </div>

        <div id="recentJobs" class="row g-3">
    <div class="browse-results-box">
        <div class="container">
            <div id="recentJobsList" class="job-list modern-job-grid">
                        <div class="text-secondary py-4">Loading jobs...</div>
                    </div>

                   <div id="dashboardJobsPagination" class="pagination-container"></div>
                </div>
            </div>
        </div>
    </div>
</section>