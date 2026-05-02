<section class="browse-container">
    <div class="container mt-5 mb-5" id="userBrowsePage">
        <h1 class="browse-title">Browse Jobs</h1>

        <div class="browse-filter-box">
            <input id="jobSearch" type="text" class="browse-input" placeholder="Search jobs...">

            <select id="jobCategoryFilter" class="browse-select">
                <option>All Categories</option>
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

            <input id="jobLocationFilter" type="text" class="browse-input" placeholder="Location">

            <select id="jobTypeFilter" class="browse-select">
                <option>All Types</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
            </select>

            <input id="jobSkillFilter" type="text" class="browse-input" placeholder="Skill keywords">

            <button id="jobSearchButton" class="homepage-login-btn" type="button">Search</button>
        </div>

        <div class="browse-results-box">
            <div class="container">
                <div id="browseJobsPageList" class="job-list modern-job-grid">
                    <div class="text-secondary py-4">Loading jobs...</div>
                </div>
            </div>
        </div>
    </div>
</section>