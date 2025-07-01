// 챗봇 팝업/별도창 공통 엔진
(function() {
  // 옵션: 별도창에서는 alwaysOpen=true
  const alwaysOpen = window.location.pathname.endsWith('ai-chatbot.html');
  const root = document.getElementById('chatbot-root');
  if (!root) return;

  // 플로팅 버튼 생성 (별도창이 아니면)
  if (!alwaysOpen) {
    const btn = document.createElement('button');
    btn.className = 'chatbot-fab';
    btn.innerHTML = '🤖';
    btn.onclick = function() {
      popup.style.display = 'flex';
      setTimeout(() => input.focus(), 100);
    };
    document.body.appendChild(btn);
  }

  // 팝업 챗봇 생성
  const popup = document.createElement('div');
  popup.className = 'chatbot-popup';
  popup.style.display = alwaysOpen ? 'flex' : 'none';
  popup.innerHTML = `
    <div class="chatbot-header">
      <div class="chatbot-title"><span>🤖</span> 피닉스 AI 상담사</div>
      <button class="chatbot-close">✕</button>
    </div>
    <div class="chatbot-messages" id="chatbotMessages"></div>
    <div class="chatbot-input">
      <input id="chatbotInput" type="text" placeholder="메시지를 입력하세요..." autocomplete="off" />
      <button class="chatbot-send">전송</button>
    </div>
  `;
  document.body.appendChild(popup);

  // 닫기 버튼 (별도창은 숨김)
  const closeBtn = popup.querySelector('.chatbot-close');
  if (alwaysOpen) closeBtn.style.display = 'none';
  else closeBtn.onclick = () => (popup.style.display = 'none');

  // 메시지 영역/입력/전송
  const messages = popup.querySelector('#chatbotMessages');
  const input = popup.querySelector('#chatbotInput');
  const sendBtn = popup.querySelector('.chatbot-send');

  function addMessage(text, from) {
    const div = document.createElement('div');
    div.className = 'message ' + from;
    div.innerHTML = `
      <div class="message-avatar">${from === 'user' ? '👤' : '🤖'}</div>
      <div class="message-content">${text}</div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function botWelcome() {
    addMessage('안녕하세요! 피닉스 치과 AI 상담사입니다. 😊<br>치과 관련 궁금한 점이 있으시면 언제든 문의해주세요!', 'bot');
  }

  // 최초 환영 메시지
  messages.innerHTML = '';
  botWelcome();

  // 전송 이벤트
  function send() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    setTimeout(() => {
      addMessage('(여기에 AI 답변이 표시됩니다)', 'bot');
    }, 500);
  }
  sendBtn.onclick = send;
  input.onkeydown = e => { if (e.key === 'Enter') send(); };

  // 별도창에서는 팝업 항상 열림, index.html에서는 버튼으로 토글
})(); 