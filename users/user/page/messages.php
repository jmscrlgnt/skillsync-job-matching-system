<section class="settings-shell" id="messagesPage">
  <div class="container py-5">
    <div class="page-head mb-4">
      <h2 class="mb-1">Messages</h2>
      <p class="text-secondary mb-0">Communicate with employers, job seekers, and the SkillSync team.</p>
    </div>

    <div class="messages-app-layout">
      <aside class="messages-sidebar">
        <div class="messages-sidebar-head d-flex justify-content-between align-items-center">
          <h4 class="mb-0">Inbox</h4>
          <button type="button" class="btn btn-sm btn-outline-soft" onclick="startNewConversation()">New Message</button>
        </div>

        <div id="messagesList" class="messages-thread-list">
          <div class="empty-state">Loading messages...</div>
        </div>
      </aside>

      <section class="messages-conversation-panel">
        <div id="conversationEmptyState" class="messages-empty-state">
          <h4>No conversation selected</h4>
          <p class="text-secondary mb-3">Choose a conversation on the left or start a new one.</p>
          <button type="button" class="btn btn-primary app-btn" onclick="startNewConversation()">Start New Message</button>
        </div>

        <form id="newMessageForm" class="conversation-reply-box d-none">
          <div class="settings-group mb-3">
            <label>Recipient email</label>
            <input type="email" id="newMessageRecipient" placeholder="Enter recipient email" required>
          </div>

          <div class="settings-group mb-3">
            <label>Subject</label>
            <input type="text" id="newMessageSubject" placeholder="Enter subject" required>
          </div>

          <div class="conversation-reply-row">
            <textarea id="newMessageBody" rows="3" placeholder="Write your message here..." required></textarea>
            <button class="btn btn-primary app-btn" type="submit">Send</button>
          </div>
        </form>

        <div id="conversationPanel" class="d-none">
          <div class="conversation-header">
            <div>
              <h4 id="conversationTitle" class="mb-1">Conversation</h4>
              <p id="conversationSubtext" class="mb-0 text-secondary"></p>
            </div>
          </div>

          <div id="conversationThread" class="conversation-thread">
            <div class="empty-state">No messages yet.</div>
          </div>

          <form id="messageForm" class="conversation-reply-box">
            <input type="hidden" id="messageRecipient">
            <input type="hidden" id="messageSubject">

            <div class="reply-meta mb-2">
              <small><strong>To:</strong> <span id="replyRecipientLabel">-</span></small>
              <small class="ms-3"><strong>Subject:</strong> <span id="replySubjectLabel">-</span></small>
            </div>

            <div class="conversation-reply-row">
              <textarea id="messageBody" rows="3" placeholder="Write your message here..." required></textarea>
              <button class="btn btn-primary app-btn" type="submit">Send</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  </div>
</section>