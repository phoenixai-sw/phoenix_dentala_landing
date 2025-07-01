popup.innerHTML = `
  <div class="chatbot-header">
    <div class="chatbot-title"><span>🤖</span> 피닉스 AI 상담사</div>
    <button class="chatbot-close">✕</button>
  </div>
  <div class="chatbot-messages" id="chatbotMessages"></div>
  <div class="chatbot-input">
    <textarea id="chatbotInput" placeholder="메시지를 입력하세요..." autocomplete="off" rows="1" style="height:45px;"></textarea>
    <button class="chatbot-send">채팅 입력</button>
    <span class="input-guide">(Shift+Enter: 전송)</span>
  </div>
`; 