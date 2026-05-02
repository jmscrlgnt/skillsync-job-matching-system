const skillsByCategory = {
  "Information Technology": [
    "HTML", "CSS", "JavaScript", "TypeScript", "Node.js", "Express.js",
    "React", "Vue.js", "Angular", "PHP", "Laravel", "Python", "Java",
    "C++", "C#", "SQL", "MySQL", "MongoDB", "PostgreSQL", "Git",
    "GitHub", "REST API", "JSON", "Bootstrap", "Tailwind CSS",
    "UI/UX Design", "Figma", "Debugging", "Testing", "Cybersecurity",
    "Networking", "Cloud Computing", "Data Structures", "Algorithms"
  ],

  "Healthcare": [
    "Patient Care", "Vital Signs Monitoring", "Medical Terminology",
    "CPR", "First Aid", "Phlebotomy", "Clinical Skills", "Medication Administration",
    "Infection Control", "Healthcare Management", "Medical Records",
    "Patient Communication", "Nursing Care", "Emergency Response",
    "Team Coordination"
  ],

  "Engineering": [
    "AutoCAD", "SolidWorks", "MATLAB", "Technical Drawing",
    "Project Management", "Problem Solving", "Mechanical Design",
    "Electrical Systems", "Civil Engineering", "Blueprint Reading",
    "Quality Control", "Process Improvement", "Safety Compliance",
    "Data Analysis", "Troubleshooting"
  ],

  "Marketing": [
    "SEO", "Content Writing", "Copywriting", "Social Media Marketing",
    "Digital Marketing", "Google Ads", "Facebook Ads", "Branding",
    "Email Marketing", "Market Research", "Canva", "Graphic Design",
    "Analytics", "Campaign Management", "Public Relations"
  ],

  "Sales": [
    "Communication", "Negotiation", "Lead Generation", "Customer Relationship Management",
    "Closing Sales", "Product Knowledge", "Persuasion", "Presentation Skills",
    "Cold Calling", "Upselling", "Cross-selling", "Sales Reporting"
  ],

  "Education": [
    "Teaching", "Lesson Planning", "Classroom Management", "Public Speaking",
    "Curriculum Development", "Student Assessment", "Instructional Design",
    "Communication", "Mentoring", "Educational Technology", "Time Management"
  ],

  "Finance": [
    "Accounting", "Bookkeeping", "Financial Analysis", "Budgeting",
    "Taxation", "Auditing", "Microsoft Excel", "Forecasting",
    "Payroll", "Cost Analysis", "Financial Reporting", "Risk Management"
  ],

  "Human Resources": [
    "Recruitment", "Interviewing", "Employee Relations", "Payroll",
    "Training and Development", "HR Policies", "Conflict Resolution",
    "Onboarding", "Performance Management", "Communication",
    "Documentation", "People Management"
  ],

  "Customer Service": [
    "Communication", "Problem Solving", "Customer Support", "Call Handling",
    "Conflict Resolution", "CRM Tools", "Active Listening",
    "Complaint Handling", "Time Management", "Email Support",
    "Chat Support", "Multitasking"
  ],

  "Administration": [
    "Data Entry", "Office Management", "Scheduling", "Documentation",
    "Microsoft Office", "Organization", "Email Management",
    "File Management", "Clerical Work", "Record Keeping",
    "Communication", "Time Management"
  ],

  "Manufacturing": [
    "Machine Operation", "Quality Control", "Production Planning",
    "Safety Procedures", "Inventory Management", "Assembly Line Work",
    "Maintenance", "Process Improvement", "Technical Skills",
    "Troubleshooting", "Warehouse Operations"
  ],

  "Retail": [
    "Customer Service", "Cash Handling", "Sales", "Merchandising",
    "Inventory Management", "POS System", "Product Knowledge",
    "Store Operations", "Communication", "Upselling"
  ],

  "Hospitality": [
    "Customer Service", "Front Desk", "Housekeeping", "Food Service",
    "Event Management", "Reservation Handling", "Communication",
    "Time Management", "Problem Solving", "Teamwork"
  ],

  "Legal": [
    "Legal Research", "Documentation", "Contracts", "Case Analysis",
    "Compliance", "Attention to Detail", "Writing", "Confidentiality",
    "File Management", "Critical Thinking"
  ],

  "Construction": [
    "Carpentry", "Plumbing", "Electrical Work", "Blueprint Reading",
    "Safety Compliance", "Masonry", "Welding", "Project Coordination",
    "Heavy Equipment Operation", "Measurement Skills"
  ],

  "Transportation": [
    "Driving", "Logistics", "Route Planning", "Vehicle Maintenance",
    "Time Management", "Inventory Tracking", "Delivery Management",
    "Safety Procedures", "Navigation", "Communication"
  ]
};

(function initSkillsTagScript() {
  const skills = [];
  const input = document.getElementById("skillsInput");
  const tagsContainer = document.getElementById("skillsTags");
  const suggestionsContainer = document.getElementById("skillsSuggestions");
  const hiddenInput = document.getElementById("skillsHidden");
  const categorySelect = document.getElementById("jobCategory");

  // Stop immediately if this page does not have the skills UI
  if (!input || !tagsContainer || !suggestionsContainer || !hiddenInput || !categorySelect) {
    window.setExistingSkillsFromHidden = function () {};
    return;
  }

  function getSkillsByCategory() {
    const category = categorySelect.value;
    return skillsByCategory[category] || [];
  }

  function updateHiddenInput() {
    hiddenInput.value = skills.join(", ");
  }

function renderTags() {
  tagsContainer.innerHTML = "";

  skills.forEach((skill, index) => {
    const tag = document.createElement("span");
    tag.className = "skill-tag";

    tag.innerHTML = `
      <span class="skill-text">${skill}</span>
      <button type="button" class="remove-tag" data-index="${index}">&times;</button>
    `;

    tag.querySelector(".remove-tag").addEventListener("click", function () {
      skills.splice(index, 1);
      renderTags();
      updateHiddenInput();
    });

    tagsContainer.appendChild(tag);
  });
}

  function addSkill(skill) {
    const trimmedSkill = skill.trim();
    if (trimmedSkill === "") return;

    const availableSkills = getSkillsByCategory();
    const exactMatch = availableSkills.find(
      (item) => item.toLowerCase() === trimmedSkill.toLowerCase()
    );

    const finalSkill = exactMatch || trimmedSkill;

    const alreadyExists = skills.some(
      (item) => item.toLowerCase() === finalSkill.toLowerCase()
    );

    if (!alreadyExists) {
      skills.push(finalSkill);
      renderTags();
      updateHiddenInput();
    }

    input.value = "";
    suggestionsContainer.innerHTML = "";
suggestionsContainer.style.display = "none";
  }

  function showSuggestions(value) {
  const search = value.toLowerCase().trim();
  const selectedCategory = categorySelect.value;
  const availableSkills = getSkillsByCategory();

  suggestionsContainer.innerHTML = "";
suggestionsContainer.style.display = "none";

  // 🔴 ADD THIS
  suggestionsContainer.style.display = "none";

  if (!selectedCategory) {
    if (search.length > 0) {
      suggestionsContainer.innerHTML =
        '<div class="suggestion-item">Select a category first</div>';

      // 🔴 ADD THIS
      suggestionsContainer.style.display = "block";
    }
    return;
  }

  if (!search) return;

  const filtered = availableSkills.filter(
    (skill) =>
      skill.toLowerCase().includes(search) &&
      !skills.some((selected) => selected.toLowerCase() === skill.toLowerCase())
  );

  if (filtered.length === 0) {
    suggestionsContainer.innerHTML =
      '<div class="suggestion-item">No matching skills found</div>';

    // 🔴 ADD THIS
    suggestionsContainer.style.display = "block";
    return;
  }

  filtered.forEach((skill) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.textContent = skill;

    item.addEventListener("click", function () {
      addSkill(skill);
    });

    suggestionsContainer.appendChild(item);
  });

  // 🔴 ADD THIS (MOST IMPORTANT)
  suggestionsContainer.style.display = "block";
}

  input.addEventListener("input", function () {
    showSuggestions(this.value);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(input.value.replace(",", ""));
    }

    if (e.key === "Backspace" && input.value === "" && skills.length > 0) {
      skills.pop();
      renderTags();
      updateHiddenInput();
    }
  });

 categorySelect.addEventListener("change", function () {
  skills.length = 0;
  renderTags();
  updateHiddenInput();
  input.value = "";

  // show suggestions immediately
  showSuggestions("");
});

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".skills-tag-box")) {
      suggestionsContainer.innerHTML = "";
    }
  });

  window.setExistingSkillsFromHidden = function (skillsText) {
    skills.length = 0;
    (skillsText || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((skill) => skills.push(skill));

    renderTags();
    updateHiddenInput();
  };
})();