<section class="admin-container mt-3">
   <div class="container" id="adminDashboardPage">
        <h1 class="mb-3">Admin Dashboard</h1>
        <p class="text-muted mb-4">Approve users, moderate jobs, and monitor platform activity.</p>

        <div class="row g-3 mb-4">
            <div class="col-md-3"><div class="card text-center text-primary"><div class="card-body"><p class="card-text">Total Users</p><h2 id="adminTotalUsers">0</h2></div></div></div>
            <div class="col-md-3"><div class="card text-center text-success"><div class="card-body"><p class="card-text">Employers</p><h2 id="adminEmployers">0</h2></div></div></div>
            <div class="col-md-3"><div class="card text-center text-info"><div class="card-body"><p class="card-text">Job Seekers</p><h2 id="adminJobseekers">0</h2></div></div></div>
            <div class="col-md-3"><div class="card text-center text-warning"><div class="card-body"><p class="card-text">Applications</p><h2 id="adminApplications">0</h2></div></div></div>
        </div>

        <div class="row g-3 mb-5">
            <div class="col-md-4"><div class="card text-center text-primary"><div class="card-body"><p class="card-text">Total Jobs</p><h2 id="adminTotalJobs">0</h2></div></div></div>
            <div class="col-md-4"><div class="card text-center text-success"><div class="card-body"><p class="card-text">Open Jobs</p><h2 id="adminApprovedJobs">0</h2></div></div></div>
            <div class="col-md-4"><div class="card text-center text-warning"><div class="card-body"><p class="card-text">Draft Jobs</p><h2 id="adminPendingJobs">0</h2></div></div></div>
        </div>

        <div class="card bg-dark text-white border-secondary mb-4">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <h3 class="mb-1">User Management</h3>
                    <small class="text-secondary">Approve new users or disable inactive accounts.</small>
                </div>
            </div>
            <div class="card-body table-responsive">
                <table class="table table-dark table-striped align-middle">
                    <thead>
                       <tr>
    <th>#</th>
    <th>Name</th>
    <th>Email</th>
    <th>Role</th>
    <th>Email Verified</th>
    <th>Verification</th>
    <th>Status</th>
    <th>Actions</th>
</tr>
                    </thead>
                    <tbody id="adminUsersTableBody">
                        <tr><td colspan="8" class="text-center">Loading users...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card bg-dark text-white border-secondary">
            <div class="card-header">
                <h3 class="mb-1">Job Moderation</h3>
                <small class="text-secondary">Approve, hold, or close posted jobs.</small>
            </div>
            <div class="card-body table-responsive">
                <table class="table table-dark table-striped align-middle">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Category</th>
                            <th>Posted</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="adminJobsTableBody">
                        <tr><td colspan="7" class="text-center">Loading jobs...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</section>
