// 피닉스치과 AI 챗봇 엔진 (팝업/별도창 공통)
console.log('🤖 Chatbot UI 로딩 시작...');

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
      openChatbot();
    }
  }

  function openChatbot() {
    popup.style.display = 'flex';
    chatbotOpen = true;
    input.focus();
    showWelcome();
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
      
      // AI 응답 생성
      generateResponse(message, loadingMessage);
    }
  }

  function sendQuickMessage(message) {
    addUserMessage(message);
    const loadingMessage = addBotMessage('🤔 생각하고 있습니다...');
    generateResponse(message, loadingMessage);
  }

  function generateResponse(message, loadingMessage) {
    console.log('🤖 응답 생성 시작:', message);
    console.log('🔍 AICore 존재 여부:', !!window.AICore);
    console.log('🔍 AICore.generateAIResponse 존재 여부:', !!(window.AICore && window.AICore.generateAIResponse));
    
    if (window.AICore) {
      console.log('📊 AICore 상태:', {
        apiSettings: window.AICore.apiSettings,
        activeProvider: window.AICore.apiSettings.activeProvider,
        chatgptEnabled: window.AICore.apiSettings.chatgpt.enabled,
        geminiEnabled: window.AICore.apiSettings.gemini.enabled,
        claudeEnabled: window.AICore.apiSettings.claude.enabled
      });
    }
    
    // AICore가 있으면 사용
    if (window.AICore && window.AICore.generateAIResponse) {
      console.log('✅ AICore 사용');
      window.AICore.generateAIResponse(message)
        .then(response => {
          console.log('✅ AI 응답 성공:', response);
          loadingMessage.remove();
          addBotMessage(response);
        })
        .catch(error => {
          console.error('❌ AICore 오류:', error);
          loadingMessage.remove();
          addBotMessage(getDefaultResponse(message));
        });
    } else {
      console.log('⚠️ AICore 없음, 기본 응답 사용');
      setTimeout(() => {
        loadingMessage.remove();
        addBotMessage(getDefaultResponse(message));
      }, 1000);
    }
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
  
  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
  
  input.addEventListener('keydown', handleKeyPress);

  // 외부에서 빠른 버튼/예시 질문 전송 지원
  window.sendQuickMessage = sendQuickMessage;
  
  // ChatbotUI 객체를 전역으로 export
  window.ChatbotUI = {
    toggleChatbot: toggleChatbot,
    closeChatbot: closeChatbot,
    sendQuickMessage: sendQuickMessage,
    sendMessage: sendMessage,
    handleKeyPress: handleKeyPress
  };

  // 최초 환영 메시지
  showWelcome();

  // 별도창은 항상 열림
  if (alwaysOpen) {
    popup.style.display = 'flex';
    chatbotOpen = true;
    input.focus();
  }

  // AICore 로드 확인
  console.log('🤖 Chatbot UI 로드 완료');
  console.log('🔍 AICore 상태:', {
    exists: !!window.AICore,
    generateAIResponse: !!(window.AICore && window.AICore.generateAIResponse)
  });

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