// 피닉스치과 AI 챗봇 엔진 (팝업/별도창 공통)
(function() {
  // --- 설정 및 상태 변수 ---
  let chatbotOpen = false;
  const alwaysOpen = window.location.pathname.endsWith('ai-chatbot.html');
  let root = document.getElementById('chatbot-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'chatbot-root';
    document.body.appendChild(root);
  }

  // 플로팅 버튼 (팝업형만)
  if (!alwaysOpen) {
    const btn = document.createElement('button');
    btn.className = 'chatbot-fab';
    btn.innerHTML = '🤖';
    btn.onclick = toggleChatbot;
    document.body.appendChild(btn);
  }

  // 챗봇 팝업
  const popup = document.createElement('div');
  popup.className = 'chatbot-popup';
  popup.id = 'chatbotPopup';
  popup.style.display = alwaysOpen ? 'flex' : 'none';
  popup.innerHTML = `
    <div class="chatbot-header">
      <div class="chatbot-title"><span>🤖</span> 피닉스 AI 상담사</div>
      <button class="chatbot-close">✕</button>
    </div>
    <div class="chatbot-messages" id="chatbotMessages"></div>
    <div class="chatbot-input">
      <textarea id="chatbotInput" placeholder="메시지를 입력하세요..." autocomplete="off" rows="1" style="height:45px;"></textarea>
      <button class="chatbot-send">전송</button>
    </div>
  `;
  document.body.appendChild(popup);

  // 닫기 버튼
  const closeBtn = popup.querySelector('.chatbot-close');
  if (alwaysOpen) closeBtn.style.display = 'none';
  else closeBtn.onclick = closeChatbot;

  // 메시지/입력/전송
  const messages = popup.querySelector('#chatbotMessages');
  const input = popup.querySelector('#chatbotInput');
  const sendBtn = popup.querySelector('.chatbot-send');

  function toggleChatbot() {
    if (chatbotOpen) {
      closeChatbot();
    } else {
      popup.style.display = 'flex';
      chatbotOpen = true;
      input.focus();
      showWelcome();
    }
  }

  function closeChatbot() {
    popup.style.display = 'none';
    chatbotOpen = false;
  }

  function showWelcome() {
    messages.innerHTML = '';
    addBotMessage('안녕하세요! 피닉스 치과 AI 상담사입니다. 😊<br>치과 관련 궁금한 점이 있으시면 언제든 문의해주세요!<div class="quick-buttons"><button class="quick-button" onclick="sendQuickMessage(\'진료시간 알려주세요\')">진료시간</button><button class="quick-button" onclick="sendQuickMessage(\'예약하고 싶어요\')">예약문의</button><button class="quick-button" onclick="sendQuickMessage(\'치료비용 궁금해요\')">치료비용</button><button class="quick-button" onclick="sendQuickMessage(\'위치 알려주세요\')">오시는길</button></div>');
  }

  function sendMessage() {
    const message = input.value.trim();
    if (message) {
      addUserMessage(message);
      input.value = '';
      input.style.height = '45px';
      const loadingMessage = addBotMessage('🤔 생각하고 있습니다...');
      window.AICore.generateAIResponse(message).then(response => {
        loadingMessage.remove();
        addBotMessage(response);
      });
    }
  }

  function sendQuickMessage(message) {
    addUserMessage(message);
    const loadingMessage = addBotMessage('🤔 생각하고 있습니다...');
    window.AICore.generateAIResponse(message).then(response => {
      loadingMessage.remove();
      addBotMessage(response);
    });
  }

  function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
      <div class="message-avatar">👤</div>
      <div class="message-content">${message}</div>
    `;
    messages.appendChild(messageDiv);
    scrollToBottom();
  }

  function addBotMessage(message) {
    const reservationBtn = '<br><button class="reservation-link-btn" onclick="openReservationFromChat()">📅 예약하기</button>';
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">${message}${reservationBtn}</div>
    `;
    messages.appendChild(messageDiv);
    scrollToBottom();
    return messageDiv;
  }

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function getDefaultResponse(userMessage) {
    const message = userMessage.toLowerCase();
    if (message.includes('진료시간')) return '🕘 평일 9시~18시, 토요일 9시~15시, 점심 12:30~1:30, 일요일/공휴일 휴진입니다.';
    if (message.includes('예약')) return '📞 예약은 070-1234-1234 또는 온라인 예약을 이용해주세요!';
    if (message.includes('비용')) return '💰 진료비는 초진 15,000원, 스케일링 50,000원, 임플란트 120만원~입니다.';
    if (message.includes('위치')) return '🏥 강남역 3번 출구 도보 5분, 피닉스시 피닉스로 11길 11입니다.';
    return '😊 궁금하신 점을 말씀해주시면 친절하게 안내드리겠습니다!';
  }

  sendBtn.onclick = sendMessage;
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // 외부에서 빠른 버튼/예시 질문 전송 지원
  window.sendQuickMessage = sendQuickMessage;

  // 최초 환영 메시지
  showWelcome();

  // 별도창은 항상 열림
  if (alwaysOpen) {
    popup.style.display = 'flex';
    chatbotOpen = true;
    input.focus();
  }

  // 예약하기 버튼 동작 지원
  function isKakaoInAppBrowser() {
    return /KAKAOTALK/i.test(navigator.userAgent);
  }
  window.openReservationFromChat = function() {
    if (isKakaoInAppBrowser()) {
      // 카카오톡 인앱 브라우저: 현재 창에서 예약페이지로 이동
      window.location.href = 'https://phoenixai-agent.site/#reservation';
    } else if (window.location.pathname.endsWith('ai-chatbot.html')) {
      // 별도창: 랜딩페이지 예약창 새 창/탭으로 열고, 현재 창 닫기
      window.open('https://phoenixai-agent.site/#reservation', '_blank');
      window.close();
    } else {
      // 팝업형: 기존 예약창 오픈
      closeChatbot();
      if (typeof openReservation === 'function') openReservation();
    }
  };
})(); 