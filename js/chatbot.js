// 피닉스치과 AI 챗봇 엔진 (팝업/별도창 공통)
(function() {
  // --- 설정 및 상태 변수 ---
  let apiSettings = {
    chatgpt: { apiKey: 'test-key', model: 'gpt-4o', enabled: true },
    gemini: { apiKey: '', model: '', enabled: false },
    claude: { apiKey: '', model: '', enabled: false },
    activeProvider: 'chatgpt'
  };
  let knowledgeBase = {
    files: ['치과FAQ.xlsx'],
    content: '',
    parsedData: [
      { question: '진료시간 알려주세요', answer: '평일 9시~18시, 토요일 9시~15시, 점심 12:30~1:30, 일요일/공휴일 휴진', source: '치과FAQ.xlsx' },
      { question: '치료비용 궁금해요', answer: '초진 15,000원, 스케일링 50,000원, 임플란트 120만원~', source: '치과FAQ.xlsx' },
      { question: '위치 알려주세요', answer: '강남역 3번 출구 도보 5분, 피닉스시 피닉스로 11길 11', source: '치과FAQ.xlsx' }
    ],
    enabled: true
  };
  let chatbotOpen = false;

  // --- UI 생성 ---
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

  // --- 챗봇 함수들 (index.html에서 이전) ---
  function toggleChatbot() {
    if (chatbotOpen) {
      closeChatbot();
    } else {
      popup.style.display = 'flex';
      chatbotOpen = true;
      input.focus();
      updateChatbotWelcomeMessage();
    }
  }

  function updateChatbotWelcomeMessage() {
    const firstMessage = messages.querySelector('.message.bot');
    if (firstMessage) {
      const messageContent = firstMessage.querySelector('.message-content');
      let welcomeText = `안녕하세요! 피닉스 치과 AI 상담사입니다. 😊<br>치과 관련 궁금한 점이 있으시면 언제든 문의해주세요!`;
      const hasAPI = apiSettings.chatgpt.enabled || apiSettings.gemini.enabled || apiSettings.claude.enabled;
      if (hasAPI) {
        welcomeText += `<br><br>🤖 <strong>AI 모델 연결됨!</strong> 더욱 정확한 답변을 제공할 수 있습니다.`;
        if (apiSettings.activeProvider) {
          const providerName = apiSettings.activeProvider.toUpperCase();
          welcomeText += `<br>현재 활성 모델: ${providerName}`;
        }
      }
      if (knowledgeBase.enabled) {
        welcomeText += `<br>📚 업로드된 지식 파일 ${knowledgeBase.files.length}개가 활성화되어 있습니다.`;
      }
      welcomeText += `<div class="quick-buttons">
        <button class="quick-button" onclick="sendQuickMessage('진료시간 알려주세요')">진료시간</button>
        <button class="quick-button" onclick="sendQuickMessage('예약하고 싶어요')">예약문의</button>
        <button class="quick-button" onclick="sendQuickMessage('치료비용 궁금해요')">치료비용</button>
        <button class="quick-button" onclick="sendQuickMessage('위치 알려주세요')">오시는길</button>
      </div>`;
      messageContent.innerHTML = welcomeText;
    }
  }

  function closeChatbot() {
    popup.style.display = 'none';
    chatbotOpen = false;
  }

  function sendMessage() {
    const message = input.value.trim();
    if (message) {
      addUserMessage(message);
      input.value = '';
      input.style.height = '45px';
      const loadingMessage = addBotMessage('🤔 생각하고 있습니다...');
      generateAIResponse(message).then(response => {
        loadingMessage.remove();
        addBotMessage(response);
      }).catch(error => {
        loadingMessage.remove();
        addBotMessage('❌ 죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      });
    }
  }

  function sendQuickMessage(message) {
    addUserMessage(message);
    const loadingMessage = addBotMessage('🤔 생각하고 있습니다...');
    generateAIResponse(message).then(response => {
      loadingMessage.remove();
      addBotMessage(response);
    }).catch(error => {
      loadingMessage.remove();
      addBotMessage('❌ 죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    });
  }

  function handleChatKeyPress(event) {
    const textarea = event.target;
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      sendMessage();
      return;
    }
    if (event.key === 'Enter') {
      setTimeout(() => {
        autoResizeTextarea(textarea);
      }, 0);
    }
  }

  function autoResizeTextarea(textarea) {
    textarea.style.height = '45px';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 120;
    if (scrollHeight > 45) {
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
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
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">${message}</div>
    `;
    messages.appendChild(messageDiv);
    scrollToBottom();
    return messageDiv;
  }

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function generateAIResponse(userMessage) {
    const knowledgeAnswer = searchInKnowledgeBase(userMessage);
    if (knowledgeAnswer) {
      return Promise.resolve(knowledgeAnswer);
    }
    if (apiSettings.activeProvider && apiSettings[apiSettings.activeProvider].enabled) {
      return callAIAPIWithContext(userMessage);
    }
    return Promise.resolve(getDefaultResponse(userMessage));
  }

  async function callAIAPIWithContext(userMessage) {
    // 실제 API 연동은 추후 구현 (현재는 기본 답변 반환)
    return getDefaultResponse(userMessage);
  }

  function getDefaultResponse(userMessage) {
    const message = userMessage.toLowerCase();
    if (message.includes('진료시간') || message.includes('언제') || message.includes('몇시') || message.includes('운영시간')) {
      return `🕘 <strong>피닉스 치과 진료시간 안내</strong><br><br>\n\n<div style="background: #f0f8ff; padding: 15px; border-radius: 10px; margin: 10px 0;">📅 <strong>평일</strong>: 오전 9시 ~ 오후 6시<br>📅 <strong>토요일</strong>: 오전 9시 ~ 오후 3시<br>🍽️ <strong>점심시간</strong>: 12시 30분 ~ 1시 30분<br>🚫 <strong>휴진</strong>: 일요일, 공휴일</div>\n\n💡 <strong>예약 안내</strong><br>• 온라인 예약: 24시간 언제든 가능<br>• 전화 예약: 070-1234-1234<br>• 응급 상담: 24시간 가능<br><br>😊 편리한 온라인 예약을 추천드립니다!<br><button class="reservation-link-btn" onclick="openReservationFromChat()">📅 지금 바로 예약하기</button>`;
    }
    if (message.includes('예약') || message.includes('신청') || message.includes('접수') || message.includes('방문')) {
      return `📞 <strong>예약 및 상담 안내</strong><br><br>\n\n<div style="background: #fff8f0; padding: 15px; border-radius: 10px; margin: 10px 0;">🌟 <strong>온라인 예약</strong> (추천)<br>• 24시간 언제든 예약 가능<br>• 원하는 날짜/시간 선택<br>• 즉시 예약 확인<br><br>📱 <strong>전화 예약</strong><br>• 070-1234-1234<br>• 평일 09:00-18:00, 토요일 09:00-15:00<br>• 24시간 응급상담 가능</div>\n\n💝 <strong>초진 환자 특별 혜택</strong><br>• 정밀 검진 및 상담<br>• 개인별 맞춤 치료 계획 수립<br>• 25년 경력 홍길동 원장님 직접 진료<br><br><button class="reservation-link-btn" onclick="openReservationFromChat()">📅 지금 바로 예약하기</button>`;
    }
    if (message.includes('비용') || message.includes('가격') || message.includes('얼마') || message.includes('돈') || message.includes('금액')) {
      return `💰 <strong>치료비 안내</strong><br><br>\n\n<div style="background: #f8fff8; padding: 15px; border-radius: 10px; margin: 10px 0;">🦷 <strong>기본 진료</strong><br>• 초진료: 15,000원<br>• 재진료: 10,000원<br>• 스케일링: 50,000원 (건강보험 적용시 연1회 무료)<br><br>✨ <strong>전문 치료</strong><br>• 미백치료: 200,000 ~ 300,000원<br>• 교정치료: 1,500,000 ~ 6,000,000원<br>• 임플란트: 1,200,000 ~ 1,500,000원<br>• 보철치료: 개별 상담 후 안내</div>\n\n💡 <strong>안내사항</strong><br>• 정확한 비용은 검진 후 개별 안내드립니다<br>• 분할 결제 및 카드 결제 가능<br>• 건강보험 적용 항목 다수<br><br>🎯 정확한 치료비 상담을 위해 방문해주세요!`;
    }
    if (message.includes('위치') || message.includes('주소') || message.includes('어디') || message.includes('찾아') || message.includes('교통')) {
      return `🏥 <strong>피닉스 치과 오시는 길</strong><br><br>\n\n<div style="background: #f0fff0; padding: 15px; border-radius: 10px; margin: 10px 0;">📍 <strong>주소</strong><br>피닉스시 피닉스로 11길 11, 피닉스타워 11층 11호<br><br>🚇 <strong>지하철</strong><br>2호선 강남역 3번 출구 → 도보 5분<br><br>🚌 <strong>버스</strong><br>강남역 정류장 하차 → 도보 3분<br><br>🚗 <strong>주차 안내</strong><br>• 건물 지하 1~3층 무료 주차<br>• 3시간 무료 이용<br>• 주차 공간 넉넉함</div>\n\n🗺️ <strong>찾아오시는 길이 궁금하시면</strong><br>전화로 자세한 안내를 도와드리겠습니다!<br>📞 070-1234-1234`;
    }
    if (message.includes('치료') || message.includes('시술') || message.includes('진료과목')) {
      return `🦷 <strong>피닉스 치과 진료과목 안내</strong><br><br>\n\n<div style="background: #fff0f8; padding: 15px; border-radius: 10px; margin: 10px 0;">🔍 <strong>일반진료</strong><br>• 충치 치료, 잇몸 치료<br>• 스케일링, 정기 검진<br><br>✨ <strong>미백치료</strong><br>• 전문가 미백, 홈케어 미백<br>• 1회 시술로 3-8단계 개선<br><br>🔧 <strong>교정치료</strong><br>• 부분교정, 전체교정<br>• 3D 시뮬레이션 상담<br><br>🦴 <strong>임플란트</strong><br>• 디지털 가이드 수술<br>• 프리미엄 재료 사용<br><br>👑 <strong>보철치료</strong><br>• 지르코니아 크라운<br>• 자연스러운 색상 매칭<br><br>🧒 <strong>소아치과</strong><br>• 어린이 친화적 환경<br>• 무해한 재료 사용</div>\n\n💫 <strong>25년 경력 홍길동 원장님이 직접 진료합니다!</strong>`;
    }
    return `😊 <strong>안녕하세요! 피닉스 치과 AI 상담사입니다</strong><br><br>\n\n<div style="background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%); padding: 20px; border-radius: 12px; margin: 10px 0;">🏥 <strong>피닉스 치과에 오신 것을 환영합니다!</strong><br><br>💡 <strong>무엇을 도와드릴까요?</strong><br>• 진료시간 및 예약 안내<br>• 치료 비용 상담<br>• 오시는 길 안내<br>• 진료과목 상세 정보<br>• 기타 궁금한 점</div>\n\n${knowledgeBase.enabled ? `📚 <strong>업로드된 전문 지식 ${knowledgeBase.files.length}개 파일이 준비되어 있어</strong><br>더욱 정확하고 전문적인 답변을 제공할 수 있습니다!<br><br>` : ''}🦷 건강한 미소를 위한 여러분의 든든한 파트너가 되겠습니다!<br>궁금한 점이 있으시면 언제든 편하게 말씀해주세요! ✨`;
  }

  function searchInKnowledgeBase(userMessage) {
    if (!knowledgeBase.enabled || knowledgeBase.parsedData.length === 0) return null;
    const message = userMessage.toLowerCase().trim();
    let searchResults = [];
    for (let qa of knowledgeBase.parsedData) {
      const question = qa.question.toLowerCase();
      const answer = qa.answer.toLowerCase();
      let score = 0;
      if (question === message || answer.includes(message)) score += 1000;
      if (question.includes(message) || message.includes(question)) score += 800;
      const messageWords = message.split(/\s+/).filter(word => word.length > 1);
      for (let word of messageWords) {
        if (question.includes(word)) score += 200;
        if (answer.includes(word)) score += 100;
      }
      if (score > 0) searchResults.push({ qa, score });
    }
    searchResults.sort((a, b) => b.score - a.score);
    if (searchResults.length > 0 && searchResults[0].score >= 30) {
      const bestMatch = searchResults[0].qa;
      return formatKnowledgeBaseAnswer(bestMatch, userMessage);
    }
    return null;
  }

  function formatKnowledgeBaseAnswer(qa, originalQuestion) {
    let formattedAnswer = qa.answer.trim();
    formattedAnswer = formattedAnswer.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
    return `📚 <strong>피닉스 치과 전문 안내</strong><br><br>${formattedAnswer}`;
  }

  // --- 이벤트 바인딩 ---
  sendBtn.onclick = sendMessage;
  input.addEventListener('keydown', handleChatKeyPress);
  input.addEventListener('input', function() { autoResizeTextarea(this); });

  // 최초 환영 메시지 및 예시/빠른버튼 항상 보장
  function ensureWelcomeAndExamples() {
    if (!messages.querySelector('.message.bot')) {
      addBotMessage('안녕하세요! 피닉스 치과 AI 상담사입니다. 😊<br>치과 관련 궁금한 점이 있으시면 언제든 문의해주세요!');
    }
    updateChatbotWelcomeMessage();
  }

  // 최초 환영 메시지
  messages.innerHTML = '';
  ensureWelcomeAndExamples();

  // 해시로 바로 열기 지원
  if (window.location.hash === '#chatbot') {
    popup.style.display = 'flex';
    chatbotOpen = true;
    input.focus();
    ensureWelcomeAndExamples();
  }

  // 외부에서 빠른 버튼/예시 질문 전송 지원
  window.sendQuickMessage = sendQuickMessage;
  window.openReservationFromChat = function() {
    closeChatbot();
    if (typeof openReservation === 'function') openReservation();
  };

  // 별도창에서도 항상 welcome/예시/빠른버튼 보장
  if (alwaysOpen) {
    ensureWelcomeAndExamples();
  }
})(); 