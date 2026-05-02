<!-- Modal -->
<div class="modal fade" id="postJobModal" tabindex="-1" aria-labelledby="postJobModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content bg-dark text-white">
      <div class="modal-header">
        <h5 class="modal-title" id="postJobModalLabel">Post a New Job</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">

        <form id="postJobForm">
          <div class="mb-3">
            <input id="jobTitle" type="text" class="form-control" placeholder="Job Title" required>
          </div>

          <div class="row mb-3">
            <div class="col-md-8 mb-2 mb-md-0">
              <input id="jobCompany" type="text" class="form-control" placeholder="Company" required>
            </div>
            <div class="col-md-4">
              <select id="jobType" class="form-select">
                <option>Select Job Type</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <select id="jobCategory" class="form-select">
              <option>Select Job Category</option>
              <option>Information Technology</option>
              <option>Healthcare</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Sales</option>
              <option>Education</option>
              <option>Finance</option>
              <option>Human Resources</option>
              <option>Customer Service</option>
              <option>Administration</option>
              <option>Manufacturing</option>
              <option>Retail</option>
              <option>Hospitality</option>
              <option>Legal</option>
              <option>Construction</option>
              <option>Transportation</option>
              <option>Other</option>
            </select>
          </div>

          <div class="mb-3">
            <input id="jobLocation" type="text" class="form-control" placeholder="Location">
          </div>

          <div class="mb-3">
            <input id="jobSalary" type="text" class="form-control" placeholder="Salary Range">
          </div>

          <div class="mb-3">
            <input id="jobSkills" type="text" class="form-control" placeholder="Required Skills (comma separated)">
          </div>

          <div class="mb-3">
            <label for="jobLogo" class="form-label text-light">Company Logo (optional)</label>
            <input id="jobLogo" type="file" class="form-control" accept="image/*">
            <small class="text-secondary">Upload a logo image for the public job card.</small>
          </div>

          <div class="mb-3">
            <textarea id="jobDescription" class="form-control" rows="5" placeholder="Job Description" required></textarea>
          </div>

<div class="mb-3">
  <label class="form-label">Requirements</label>
  <textarea id="jobRequirements" class="form-control" rows="3" placeholder="Enter job requirements..."></textarea>
</div>

          <div class="d-flex justify-content-end gap-2">
            <button type="submit" class="btn btn-success">Post Job</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          </div>

        </form>

      </div>
    </div>
  </div>
</div>

<!-- Manage Jobs Modal -->
<div class="modal fade" id="manageJobModal" tabindex="-1" aria-labelledby="manageJobModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-xl">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title" id="manageJobModalLabel">Manage Job Postings</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">

        <!-- Search / Filter -->
        <div class="mb-3">
          <input type="text" id="searchJob" class="form-control" placeholder="Search job title or company...">
        </div>

        <!-- Jobs Table -->
        <div class="table-responsive">
          <table class="table table-dark table-striped table-hover align-middle">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Type</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="manageJobList">
              <tr>
                <td>Frontend Developer</td>
                <td>Acme Corp</td>
                <td>Full-time</td>
                <td>Information Technology</td>
                <td><span class="badge bg-success">Active</span></td>
                <td>
                  <button class="btn btn-sm btn-primary view-job-btn">View</button>
                  <button class="btn btn-sm btn-warning edit-job-btn">Edit</button>
                  <button class="btn btn-sm btn-danger delete-job-btn">Delete</button>
                </td>
              </tr>
              <tr>
                <td>UI/UX Designer</td>
                <td>Design Studio</td>
                <td>Contract</td>
                <td>Design</td>
                <td><span class="badge bg-secondary">Inactive</span></td>
                <td>
                  <button class="btn btn-sm btn-primary view-job-btn">View</button>
                  <button class="btn btn-sm btn-warning edit-job-btn">Edit</button>
                  <button class="btn btn-sm btn-danger delete-job-btn">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>

    </div>
  </div>
</div>