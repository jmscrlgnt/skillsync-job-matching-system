<div class="modal fade" id="jobDetailsModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Job Details</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" id="jobDetailsContent">
        <div class="text-secondary">Loading job details...</div>
      </div>
    </div>
  </div>
</div>
<footer class="footer-section text-white pt-5 compact-private-footer">
  <div class="container">
    <div class="footer-clean-shell compact">

      <div class="footer-brand-stack">
        <img src="../../assets/images/sslogo.png" alt="SkillSync logo" class="footer-logo">
        <p>
         SkillSync streamlines hiring by connecting talent with opportunities through intelligent skill-based matching.
        </p>
      </div>

      <div class="footer-clean-links compact">

        <div>
  <h6>Workspace</h6>
  <a href="?page=dashboard">Dashboard</a>
  <a href="?page=user-profile">Profile</a>
  <a href="?page=settings">Settings</a>
</div>

               <div>
          <h6>Communication</h6>
          <a href="?page=notifications">Notifications</a>
          <a href="?page=messages">Messages</a>
          <a href="?page=about">About SkillSync</a>
        </div>

       <div>
  <h6>System</h6>
  <a href="?page=developers">Developers</a>
  <a href="?page=contact">Contact / Support</a>
  <span>Role-based access</span>
</div>

      </div>
    </div>
  </div>

  <div class="footer-bottom text-center mt-4 py-3">
    <small>&copy; 2026 SkillSync. All rights reserved.</small>
  </div>
</footer>
<!-- Chatbot -->
<div class="chatbot-container" id="chatbotContainer">
  <button class="chatbot-toggle" id="chatbotToggle" type="button" aria-label="Open SkillSync assistant" aria-expanded="false">
    <span class="chatbot-toggle-shell">
      <svg viewBox="0 0 24 24" aria-hidden="true" class="chatbot-toggle-svg">
        <path d="M12 3C7.03 3 3 6.58 3 11c0 2.2 1 4.2 2.64 5.66L5 21l4.74-1.92c.72.18 1.48.27 2.26.27 4.97 0 9-3.58 9-8s-4.03-8.35-9-8.35Z"></path>
        <path d="M8.5 11h.01"></path>
        <path d="M12 11h.01"></path>
        <path d="M15.5 11h.01"></path>
      </svg>
    </span>
  </button>

  <div class="chatbot-box" id="chatbotBox">
    <div class="chatbot-header">
      <div class="chatbot-header-left">
        <div class="chatbot-header-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="chatbot-header-svg">
            <path d="M12 3C7.03 3 3 6.58 3 11c0 2.2 1 4.2 2.64 5.66L5 21l4.74-1.92c.72.18 1.48.27 2.26.27 4.97 0 9-3.58 9-8s-4.03-8.35-9-8.35Z"></path>
            <path d="M8.5 11h.01"></path>
            <path d="M12 11h.01"></path>
            <path d="M15.5 11h.01"></path>
          </svg>
        </div>
        <div class="chatbot-title-wrap">
          <strong id="chatbotAssistantName">Hiring Assistant</strong>
       <small id="chatbotAssistantHint">
 AI may make mistakes. Verify important information with the system/admin.
</small>
        </div>
      </div>

     <div class="chatbot-header-actions">
  <button 
    type="button" 
    class="chatbot-clear" 
    onclick="clearChat()" 
    title="Clear chat">
    🗑
  </button>

  <button 
    class="chatbot-close" 
    id="chatbotClose" 
    type="button" 
    aria-label="Close chatbot">
    <span>&times;</span>
  </button>
</div>
    </div>

    <div class="chatbot-body" id="chatbotBody"></div>

    <div class="chatbot-quick-actions-wrap">
      <div class="chatbot-quick-actions" id="chatbotQuickActions"></div>
    </div>

    <div class="chatbot-input">
      <input type="text" id="chatInput" placeholder="Ask SkillSync anything...">
      <button id="chatSend" type="button">Send</button>
    </div>
  </div>
</div>

<div id="appToastContainer" class="app-toast-container" aria-live="polite" aria-atomic="true"></div>
<div id="pageLoader" class="page-loader">
  <div class="page-loader-spinner"></div>
</div>