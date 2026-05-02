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
          <strong id="chatbotAssistantName">SkillSync Assistant</strong>
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
<footer class="footer-section footer-premium text-white">
  <div class="container">
    <div class="footer-premium-grid">

      <div class="footer-premium-brand">
        <div class="footer-premium-logo-wrap">
  <img src="assets/images/sslogo.png" alt="SkillSync logo" class="footer-logo">
</div>
        <p>
          SkillSync connects job seekers and employers through skill-based matching,
          cleaner job discovery, and organized hiring workflows.
        </p>
      </div>

      <div class="footer-premium-links">
        <h6>Platform</h6>
        <a href="?page=about">About</a>
        <a href="?page=register">Register</a>
        <a href="?page=login">Login</a>

        <h6 class="footer-subtitle-space">Highlights</h6>
        <span>Skill-based matching</span>
        <span>Role-based system access</span>
        <span>Smart job discovery</span>
      </div>

      <div class="footer-premium-links">
        <h6>Explore</h6>
        <a href="index.php#job-list-section">Latest Jobs</a>
        <a href="?page=developers">Developers</a>
       

        <h6 class="footer-subtitle-space">More</h6>
       <a href="?page=about">About SkillSync</a>
<a href="?page=contact">Contact / Support</a>
        <a href="?page=login">Sign In</a>
      </div>

      <div class="footer-premium-contact">
        <h6>Get in touch</h6>

        <div class="footer-socials">
  <a href="#" id="footerFacebookLink" aria-label="Facebook">f</a>
  <a href="#" id="footerTwitterLink" aria-label="Twitter">t</a>
  <a href="#" id="footerLinkedInLink" aria-label="LinkedIn">in</a>
</div>

<h6 class="footer-subscribe-title">Subscribe</h6>
<form class="footer-subscribe-form" id="footerSubscribeForm">
  <input type="email" id="footerSubscribeEmail" placeholder="Enter email address">
  <button type="submit">Subscribe</button>
</form>
      </div>

    </div>
  </div>

  <div class="footer-bottom text-center">
    <small>&copy; 2026 SkillSync. All rights reserved.</small>
  </div>
</footer>

<div id="appToastContainer" class="app-toast-container" aria-live="polite" aria-atomic="true"></div>
<div id="pageLoader" class="page-loader">
  <div class="page-loader-spinner"></div>
</div>