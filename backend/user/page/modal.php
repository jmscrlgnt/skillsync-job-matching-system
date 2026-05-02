<!-- Browse Jobs Modal -->
<div class="modal fade" id="browseJobsModal" tabindex="-1" aria-labelledby="browseJobsModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl">
    <div class="modal-content bg-dark text-white">
      <div class="modal-header border-0">
        <h5 class="modal-title" id="browseJobsModalLabel">Browse Jobs</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="browse-results-box">
          <div class="container">
            <div id="userJobsList" class="job-list modern-job-grid">
              <div class="text-secondary py-4">Loading jobs...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- My Applications Modal -->
<div class="modal fade" id="myApplicationsModal" tabindex="-1" aria-labelledby="myApplicationsModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content bg-dark text-white">
      <div class="modal-header border-0">
        <h5 class="modal-title" id="myApplicationsModalLabel">My Applications</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Track the status of all your job applications.</p>
        <div class="table-responsive">
          <table class="table table-dark table-striped align-middle">
            <thead>
  <tr>
    <th>#</th>
    <th>Job Title</th>
    <th>Employer</th>
    <th>Status</th>
    <th>Date Applied</th>
    <th>Action</th>
  </tr>
</thead>
<tbody id="applicationsTableBody">
  <tr><td colspan="6" class="text-center">Loading applications...</td></tr>
</tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>