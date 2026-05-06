<section class="profile-shell py-5" id="profilePage" data-profile-role="employer">
  <div class="container">
    <div class="profile-hero-card mb-4">
      <div class="profile-cover"></div>
      <div class="profile-hero-content">
        <div class="profile-avatar-wrap">
          <div class="profile-avatar-preview" id="profileAvatarPreview">SS</div>
          <label class="profile-avatar-upload" for="profileImageInput">Upload photo</label>
          <input type="file" id="profileImageInput" accept="image/*" hidden>
        </div>
        <div class="profile-hero-copy">
          <h1 class="profile-title">Employer Profile</h1>
          <p class="profile-subtitle">Present your company professionally so job seekers can trust your openings.</p>
          <div class="profile-status-row">
            <span class="status-pill" id="profileStatusPill">Available</span>
            <span class="profile-role-label">Employer Account</span>
          </div>
        </div>
      </div>
    </div>
    <form class="profile-form" id="profileForm">
      <div class="profile-grid three-col">
        <div class="profile-group"><label>Full Name</label><input type="text" name="full_name" placeholder="Enter your full name" required></div>
        <div class="profile-group"><label>Email</label><input type="email" name="email" placeholder="Enter your email" required></div>
        <div class="profile-group"><label>Phone Number</label><input type="text" name="phone" placeholder="Enter your phone number"></div>
        <div class="profile-group"><label>Location</label><input type="text" name="location" placeholder="Enter your location"></div>
        <div class="profile-group"><label>Industry / Department</label><input type="text" name="degree" placeholder="e.g. Human Resources / Technology"></div>
        <div class="profile-group"><label>Position in Company</label><input type="text" name="headline" placeholder="e.g. Hiring Manager"></div>
        <div class="profile-group"><label>Company Name</label><input type="text" name="company_name" placeholder="Enter company name"></div>
        <div class="profile-group"><label>Website / Portfolio</label><input type="text" name="website" placeholder="LinkedIn, portfolio, or company website"></div>
        <div class="profile-group"><label>Status</label><select name="availability_status" id="availabilityStatus"><option value="Available">Available</option><option value="Busy">Busy</option><option value="Interviewing">Interviewing</option><option value="Onboarded">Onboarded</option></select></div>
        <div class="profile-group"><label>Hiring Category</label><select name="job_category" id="jobCategory"><option value="">Select category</option><option>Information Technology</option><option>Healthcare</option><option>Engineering</option><option>Marketing</option><option>Sales</option><option>Education</option><option>Finance</option><option>Human Resources</option><option>Customer Service</option><option>Administration</option><option>Manufacturing</option><option>Retail</option><option>Hospitality</option><option>Legal</option><option>Construction</option><option>Transportation</option><option>Other</option></select></div>
      </div>
      <div class="profile-group"><label>Core Hiring Skills / Tools</label><div class="skills-tag-box"><div id="skillsTags" class="skills-tags"></div><input type="text" id="skillsInput" class="skills-input" placeholder="Type a skill and press Enter" autocomplete="off"><div id="skillsSuggestions" class="skills-suggestions"></div></div><input type="hidden" name="skills" id="skillsHidden"></div>
      <div class="profile-group"><label>About Company / Recruiter</label><textarea name="about_me" rows="5" placeholder="Describe the company, hiring team, and recruitment focus"></textarea></div>
      <div class="profile-group"><label>Recruitment Notes / Experience</label><textarea name="experience" rows="5" placeholder="Company background, hiring experience, employer brand, etc."></textarea></div>
      <div class="profile-group resume-group"><label for="resumeInput">Company Profile File (optional)</label><input type="file" id="resumeInput" name="resume" class="form-control" accept=".pdf,.doc,.docx"><small class="text-secondary d-block mt-2">Accepted: PDF, DOC, DOCX</small><div id="resumePreview" class="mt-2"></div></div>
      <button type="submit" class="profile-btn">Save Profile</button>
    </form>
  </div>
</section>