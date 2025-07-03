// --- 상태 변수 ---
const apiSettings = (function(){
  try {
    const saved = localStorage.getItem('apiSettings');
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.warn('localStorage 접근 오류:', error);
  }
  return {
    chatgpt: { apiKey: '', model: '', enabled: false },
    gemini: { apiKey: '', model: '', enabled: false },
    claude: { apiKey: '', model: '', enabled: false },
    activeProvider: ''
  };
})();
const knowledgeBase = (function(){
  try {
    const saved = localStorage.getItem('knowledgeBase');
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.warn('localStorage 접근 오류:', error);
  }
  return {
    files: [],
    content: '',
    parsedData: [],
    enabled: false
  };
})();

function saveApiSettingsToStorage() {
  try {
    localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
  } catch (error) {
    console.warn('localStorage 저장 오류:', error);
  }
}
function saveKnowledgeBaseToStorage() {
  try {
    localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
  } catch (error) {
    console.warn('localStorage 저장 오류:', error);
  }
}

// apiSettings, knowledgeBase 값이 바뀔 때마다 저장하도록 Proxy 적용
const apiSettingsProxy = new Proxy(apiSettings, {
  set(target, prop, value) {
    target[prop] = value;
    saveApiSettingsToStorage();
    return true;
  }
});
const knowledgeBaseProxy = new Proxy(knowledgeBase, {
  set(target, prop, value) {
    target[prop] = value;
    saveKnowledgeBaseToStorage();
    return true;
  }
});

// 관리자 로그인 함수
function adminLogin(id, pw) {
  return id === 'phoenix' && pw === 'phoenix';
}

// 기본 응답 함수
function getDefaultResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  if (message.includes('진료시간') || message.includes('언제') || message.includes('몇시') || message.includes('운영시간')) {
    return `🕘 <strong>피닉스 치과 진료시간 안내</strong><br><br>
    
    <div style="background: #f0f8ff; padding: 15px; border-radius: 10px; margin: 10px 0;">
      📅 <strong>평일</strong>: 오전 9시 ~ 오후 6시<br>
      📅 <strong>토요일</strong>: 오전 9시 ~ 오후 3시<br>
      🍽️ <strong>점심시간</strong>: 12시 30분 ~ 1시 30분<br>
      🚫 <strong>휴진</strong>: 일요일, 공휴일
    </div>
    
    💡 <strong>예약 안내</strong><br>
    • 온라인 예약: 24시간 언제든 가능<br>
    • 전화 예약: 070-1234-1234<br>
    • 응급 상담: 24시간 가능<br><br>
    
    😊 편리한 온라인 예약을 추천드립니다!`;
  }
  
  if (message.includes('예약') || message.includes('신청') || message.includes('접수') || message.includes('방문')) {
    return `📞 <strong>예약 및 상담 안내</strong><br><br>
    
    <div style="background: #fff8f0; padding: 15px; border-radius: 10px; margin: 10px 0;">
      🌟 <strong>온라인 예약</strong> (추천)<br>
      • 24시간 언제든 예약 가능<br>
      • 원하는 날짜/시간 선택<br>
      • 즉시 예약 확인<br><br>
      
      📱 <strong>전화 예약</strong><br>
      • 070-1234-1234<br>
      • 평일 09:00-18:00, 토요일 09:00-15:00<br>
      • 24시간 응급상담 가능
    </div>
    
    💝 <strong>초진 환자 특별 혜택</strong><br>
    • 정밀 검진 및 상담<br>
    • 개인별 맞춤 치료 계획 수립<br>
    • 25년 경력 홍길동 원장님 직접 진료`;
  }
  
  if (message.includes('비용') || message.includes('가격') || message.includes('얼마') || message.includes('돈') || message.includes('금액')) {
    return `💰 <strong>치료비 안내</strong><br><br>
    
    <div style="background: #f8fff8; padding: 15px; border-radius: 10px; margin: 10px 0;">
      🦷 <strong>기본 진료</strong><br>
      • 초진료: 15,000원<br>
      • 재진료: 10,000원<br>
      • 스케일링: 50,000원 (건강보험 적용시 연1회 무료)<br><br>
      
      ✨ <strong>전문 치료</strong><br>
      • 미백치료: 200,000 ~ 300,000원<br>
      • 교정치료: 1,500,000 ~ 6,000,000원<br>
      • 임플란트: 1,200,000 ~ 1,500,000원<br>
      • 보철치료: 개별 상담 후 안내
    </div>
    
    💡 <strong>안내사항</strong><br>
    • 정확한 비용은 검진 후 개별 안내드립니다<br>
    • 분할 결제 및 카드 결제 가능<br>
    • 건강보험 적용 항목 다수`;
  }
  
  if (message.includes('위치') || message.includes('주소') || message.includes('어디') || message.includes('찾아') || message.includes('교통')) {
    return `🏥 <strong>피닉스 치과 오시는 길</strong><br><br>
    
    <div style="background: #f0fff0; padding: 15px; border-radius: 10px; margin: 10px 0;">
      📍 <strong>주소</strong><br>
      피닉스시 피닉스로 11길 11, 피닉스타워 11층 11호<br><br>
      
      🚇 <strong>지하철</strong><br>
      2호선 강남역 3번 출구 → 도보 5분<br><br>
      
      🚌 <strong>버스</strong><br>
      강남역 정류장 하차 → 도보 3분<br><br>
      
      🚗 <strong>주차 안내</strong><br>
      • 건물 지하 1~3층 무료 주차<br>
      • 3시간 무료 이용<br>
      • 주차 공간 넉넉함
    </div>
    
    🗺️ <strong>찾아오시는 길이 궁금하시면</strong><br>
    전화로 자세한 안내를 도와드리겠습니다!<br>
    📞 070-1234-1234`;
  }
  
  if (message.includes('치료') || message.includes('시술') || message.includes('진료과목')) {
    return `🦷 <strong>피닉스 치과 진료과목 안내</strong><br><br>
    
    <div style="background: #fff0f8; padding: 15px; border-radius: 10px; margin: 10px 0;">
      🔍 <strong>일반진료</strong><br>
      • 충치 치료, 잇몸 치료<br>
      • 스케일링, 정기 검진<br><br>
      
      ✨ <strong>미백치료</strong><br>
      • 전문가 미백, 홈케어 미백<br>
      • 1회 시술로 3-8단계 개선<br><br>
      
      🔧 <strong>교정치료</strong><br>
      • 부분교정, 전체교정<br>
      • 3D 시뮬레이션 상담<br><br>
      
      🦴 <strong>임플란트</strong><br>
      • 디지털 가이드 수술<br>
      • 프리미엄 재료 사용<br><br>
      
      👑 <strong>보철치료</strong><br>
      • 지르코니아 크라운<br>
      • 자연스러운 색상 매칭<br><br>
      
      🧒 <strong>소아치과</strong><br>
      • 어린이 친화적 환경<br>
      • 무해한 재료 사용
    </div>
    
    💫 <strong>25년 경력 홍길동 원장님이 직접 진료합니다!</strong>`;
  }
  
  return `😊 <strong>안녕하세요! 피닉스 치과 AI 상담사입니다</strong><br><br>
  
  <div style="background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%); padding: 20px; border-radius: 12px; margin: 10px 0;">
    🏥 <strong>피닉스 치과에 오신 것을 환영합니다!</strong><br><br>
    
    💡 <strong>무엇을 도와드릴까요?</strong><br>
    • 진료시간 및 예약 안내<br>
    • 치료 비용 상담<br>
    • 오시는 길 안내<br>
    • 진료과목 상세 정보<br>
    • 기타 궁금한 점
  </div>
  
  🦷 건강한 미소를 위한 여러분의 든든한 파트너가 되겠습니다!<br>
  궁금한 점이 있으시면 언제든 편하게 말씀해주세요! ✨`;
}

// 지식베이스 검색 함수
function searchInKnowledgeBase(userMessage) {
  if (!knowledgeBase.enabled || knowledgeBase.parsedData.length === 0) {
    return null;
  }
  
  const message = userMessage.toLowerCase().trim();
  let searchResults = [];
  
  for (let qa of knowledgeBase.parsedData) {
    const question = qa.question.toLowerCase();
    const answer = qa.answer.toLowerCase();
    let score = 0;
    
    if (question === message || answer.includes(message)) {
      score += 1000;
    }
    
    if (question.includes(message) || message.includes(question)) {
      score += 800;
    }
    
    const messageWords = message.split(/\s+/).filter(word => word.length > 1);
    const questionWords = question.split(/\s+/).filter(word => word.length > 1);
    
    for (let word of messageWords) {
      if (question.includes(word)) {
        score += 200;
      }
      if (answer.includes(word)) {
        score += 100;
      }
    }
    
    if (score > 0) {
      searchResults.push({ qa, score });
    }
  }
  
  searchResults.sort((a, b) => b.score - a.score);
  
  if (searchResults.length > 0 && searchResults[0].score >= 30) {
    const bestMatch = searchResults[0].qa;
    return formatKnowledgeBaseAnswer(bestMatch, userMessage);
  }
  
  return null;
}

// 지식베이스 답변 포맷팅
function formatKnowledgeBaseAnswer(qa, originalQuestion) {
  let formattedAnswer = qa.answer.trim();
  
  formattedAnswer = formattedAnswer
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  return `📚 <strong>피닉스 치과 전문 안내</strong><br><br>
  ${formattedAnswer}<br><br>
  <div style="background: #f0f8ff; padding: 10px; border-radius: 8px; margin-top: 10px;">
    💡 <strong>추가 도움이 필요하시다면:</strong><br>
    📞 전화상담: 070-1234-1234 (24시간)<br>
    🕘 진료시간: 평일 09:00-18:00, 토요일 09:00-15:00<br>
    📍 위치: 강남역 3번 출구 도보 5분
  </div><br>
  <small>📖 출처: ${qa.source} | 더 궁금한 점이 있으시면 언제든 문의해주세요!</small>`;
}

// AI 응답 생성 함수
function generateAIResponse(userMessage) {
  console.log('🤖 AI 응답 생성 시작:', userMessage);
  console.log('📊 현재 설정:', {
    activeProvider: apiSettings.activeProvider,
    chatgptEnabled: apiSettings.chatgpt.enabled,
    geminiEnabled: apiSettings.gemini.enabled,
    claudeEnabled: apiSettings.claude.enabled,
    knowledgeBaseEnabled: knowledgeBase.enabled,
    knowledgeBaseDataCount: knowledgeBase.parsedData.length
  });
  
  const knowledgeAnswer = searchInKnowledgeBase(userMessage);
  if (knowledgeAnswer) {
    console.log('✅ 지식베이스에서 답변 발견');
    return Promise.resolve(knowledgeAnswer);
  }
  
  if (apiSettings.activeProvider && apiSettings[apiSettings.activeProvider].enabled) {
    console.log('🚀 API 호출로 답변 생성:', apiSettings.activeProvider);
    return callAIAPIWithContext(userMessage);
  }
  
  console.log('💡 기본 FAQ 응답 사용');
  return Promise.resolve(getDefaultResponse(userMessage));
}

// AI API 호출 함수
async function callAIAPIWithContext(userMessage) {
  const provider = apiSettings.activeProvider;
  const settings = apiSettings[provider];
  
  try {
    let response;
    let contextInfo = getContextFromKnowledgeBase();
    
    switch (provider) {
      case 'chatgpt':
        response = await callChatGPTAPIWithContext(userMessage, settings, contextInfo);
        break;
      case 'gemini':
        response = await callGeminiAPIWithContext(userMessage, settings, contextInfo);
        break;
      case 'claude':
        response = await callClaudeAPIWithContext(userMessage, settings, contextInfo);
        break;
      default:
        return getDefaultResponse(userMessage);
    }
    
    return formatFriendlyResponse(response, provider);
    
  } catch (error) {
    console.error('AI API 호출 오류:', error);
    return `❌ <strong>일시적인 오류가 발생했습니다</strong><br><br>
    죄송합니다. AI 서비스 연결에 문제가 있어 잠시 기본 안내로 도움드리겠습니다.<br><br>
    ${getDefaultResponse(userMessage)}<br><br>
    <small>💡 오류 내용: ${error.message}</small>`;
  }
}

// 지식베이스 컨텍스트 가져오기
function getContextFromKnowledgeBase() {
  if (!knowledgeBase.enabled || knowledgeBase.parsedData.length === 0) {
    return '';
  }
  
  let context = '\n\n=== 병원 전문 지식 정보 ===\n';
  knowledgeBase.parsedData.forEach((qa, index) => {
    context += `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}\n`;
  });
  
  return context;
}

// 친화적 응답 포맷팅
function formatFriendlyResponse(response, provider) {
  let formattedResponse = response.trim();
  
  formattedResponse = formattedResponse
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  const providerIcon = {
    'chatgpt': '🧠',
    'gemini': '💎', 
    'claude': '🤖'
  };
  
  const providerName = {
    'chatgpt': 'ChatGPT',
    'gemini': 'Gemini',
    'claude': 'Claude'
  };
  
  return `${providerIcon[provider]} <strong>피닉스 치과 AI 상담사 (${providerName[provider]})</strong><br><br>
  ${formattedResponse}<br><br>
  <small>💡 추가 궁금한 점이 있으시면 언제든 문의해주세요!</small>`;
}

// ChatGPT API 호출
async function callChatGPTAPIWithContext(message, settings, contextInfo) {
  const systemPrompt = `당신은 피닉스 치과 병원의 전문 AI 상담사입니다. 
  매우 친절하고 전문적으로 답변해주세요.

  === 병원 기본 정보 ===
  • 병원명: 피닉스 치과 병원
  • 원장: 홍길동 (25년 경력 치주질환 전문의)
  • 진료시간: 평일 09:00-18:00, 토요일 09:00-15:00, 점심시간 12:30-13:30
  • 휴진: 일요일, 공휴일
  • 전화: 070-1234-1234 (24시간 응급상담 가능)
  • 주소: 피닉스시 피닉스로 11길 11, 피닉스타워 11층 11호
  • 교통: 지하철 2호선 강남역 3번 출구 도보 5분
  • 주차: 건물 지하 1-3층 무료 주차 (3시간)
  • 진료과목: 일반진료, 미백치료, 교정치료, 임플란트, 보철치료, 소아치과

  === 치료비 안내 ===
  • 일반진료: 초진 15,000원, 재진 10,000원
  • 스케일링: 50,000원 (건강보험 적용 시 연 1회 무료)
  • 미백치료: 200,000-300,000원
  • 교정치료: 1,500,000-6,000,000원
  • 임플란트: 1,200,000-1,500,000원

  ${contextInfo}

  답변 가이드라인:
  1. 매우 친절하고 따뜻한 말투를 사용하세요
  2. 전문적이면서도 이해하기 쉽게 설명하세요
  3. 구체적인 정보를 제공하되, 정확하지 않은 의료 진단은 피하세요
  4. 예약이나 상담이 필요한 경우 적극 안내하세요
  5. 답변을 구조화하여 읽기 쉽게 정리해주세요`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Gemini API 호출
async function callGeminiAPIWithContext(message, settings, contextInfo) {
  const prompt = `당신은 피닉스 치과 병원의 전문 AI 상담사입니다. 
  매우 친절하고 전문적으로 답변해주세요.

  === 병원 기본 정보 ===
  • 병원명: 피닉스 치과 병원
  • 원장: 홍길동 (25년 경력 치주질환 전문의)
  • 진료시간: 평일 09:00-18:00, 토요일 09:00-15:00, 점심시간 12:30-13:30
  • 휴진: 일요일, 공휴일
  • 전화: 070-1234-1234 (24시간 응급상담 가능)
  • 주소: 피닉스시 피닉스로 11길 11, 피닉스타워 11층 11호
  • 교통: 지하철 2호선 강남역 3번 출구 도보 5분
  • 주차: 건물 지하 1-3층 무료 주차 (3시간)
  • 진료과목: 일반진료, 미백치료, 교정치료, 임플란트, 보철치료, 소아치과

  === 치료비 안내 ===
  • 일반진료: 초진 15,000원, 재진 10,000원
  • 스케일링: 50,000원 (건강보험 적용 시 연 1회 무료)
  • 미백치료: 200,000-300,000원
  • 교정치료: 1,500,000-6,000,000원
  • 임플란트: 1,200,000-1,500,000원

  ${contextInfo}

  답변 가이드라인:
  1. 매우 친절하고 따뜻한 말투를 사용하세요
  2. 전문적이면서도 이해하기 쉽게 설명하세요
  3. 구체적인 정보를 제공하되, 정확하지 않은 의료 진단은 피하세요
  4. 예약이나 상담이 필요한 경우 적극 안내하세요
  5. 답변을 구조화하여 읽기 쉽게 정리해주세요

  질문: ${message}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Claude API 호출
async function callClaudeAPIWithContext(message, settings, contextInfo) {
  const prompt = `당신은 피닉스 치과 병원의 전문 AI 상담사입니다. 
  매우 친절하고 전문적으로 답변해주세요.

  === 병원 기본 정보 ===
  • 병원명: 피닉스 치과 병원
  • 원장: 홍길동 (25년 경력 치주질환 전문의)
  • 진료시간: 평일 09:00-18:00, 토요일 09:00-15:00, 점심시간 12:30-13:30
  • 휴진: 일요일, 공휴일
  • 전화: 070-1234-1234 (24시간 응급상담 가능)
  • 주소: 피닉스시 피닉스로 11길 11, 피닉스타워 11층 11호
  • 교통: 지하철 2호선 강남역 3번 출구 도보 5분
  • 주차: 건물 지하 1-3층 무료 주차 (3시간)
  • 진료과목: 일반진료, 미백치료, 교정치료, 임플란트, 보철치료, 소아치과

  === 치료비 안내 ===
  • 일반진료: 초진 15,000원, 재진 10,000원
  • 스케일링: 50,000원 (건강보험 적용 시 연 1회 무료)
  • 미백치료: 200,000-300,000원
  • 교정치료: 1,500,000-6,000,000원
  • 임플란트: 1,200,000-1,500,000원

  ${contextInfo}

  답변 가이드라인:
  1. 매우 친절하고 따뜻한 말투를 사용하세요
  2. 전문적이면서도 이해하기 쉽게 설명하세요
  3. 구체적인 정보를 제공하되, 정확하지 않은 의료 진단은 피하세요
  4. 예약이나 상담이 필요한 경우 적극 안내하세요
  5. 답변을 구조화하여 읽기 쉽게 정리해주세요

  질문: ${message}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: settings.model,
      max_tokens: 800,
      messages: [{
        role: "user",
        content: prompt
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// 지식 파일 파싱 함수
function parseKnowledgeFile(fileData) {
  if (!fileData.content || fileData.content.trim().length === 0) {
    return [];
  }
  
  const content = fileData.content;
  const lines = content.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const parsedQA = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let question = '';
    let answer = '';
    
    if (line.match(/^[QqㅁㅂㅊㄷㄹㅁㅏqQuestion문질의질문]\s*[:：]\s*(.+)$/i)) {
      question = line.replace(/^[QqㅁㅂㅊㄷㄹㅁㅏqQuestion문질의질문]\s*[:：]\s*/i, '').trim();
      
      for (let j = i + 1; j < lines.length && j < i + 5; j++) {
        const nextLine = lines[j];
        if (nextLine.match(/^[AaAnsw답변답응답]\s*[:：]\s*(.+)$/i)) {
          answer = nextLine.replace(/^[AaAnsw답변답응답]\s*[:：]\s*/i, '').trim();
          i = j;
          break;
        } else if (!nextLine.match(/^[QqㅁㅂㅊㄷㄹㅁㅏqQuestion문질의질문]\s*[:：]/i)) {
          answer = nextLine;
          i = j;
          break;
        }
      }
    }
    else if (line.match(/^\d+\.\s*(.+[?？])\s*$/)) {
      question = line.replace(/^\d+\.\s*/, '').trim();
      if (i + 1 < lines.length && !lines[i + 1].match(/^\d+\./)) {
        answer = lines[i + 1];
        i++;
      }
    }
    else if (line.match(/^[-•*]\s*(.+[?？])\s*$/)) {
      question = line.replace(/^[-•*]\s*/, '').trim();
      if (i + 1 < lines.length && !lines[i + 1].match(/^[-•*]/)) {
        answer = lines[i + 1];
        i++;
      }
    }
    else if (line.length > 5 && 
             (line.includes('?') || line.includes('？') ||
              line.match(/(어떻게|언제|어디서|왜|무엇|누가|얼마|몇시|어떤|뭔가|어디|몇|언제까지)/))) {
      question = line;
      
      const answerLines = [];
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const nextLine = lines[j];
        if (nextLine.match(/(어떻게|언제|어디서|왜|무엇|누가|얼마|몇시|어떤)[?？]/) ||
            nextLine.match(/^[\d\-•*QqㅁㅂㅊㄷㄹㅁㅏqQuestion문질의질문]/)) {
          break;
        }
        answerLines.push(nextLine);
        if (answerLines.join(' ').length > 200) break;
      }
      
      if (answerLines.length > 0) {
        answer = answerLines.join(' ').trim();
        i += answerLines.length;
      }
    }
    else if (line.match(/^([^:：]{2,20})[:：]\s*(.{5,})$/)) {
      const matches = line.match(/^([^:：]{2,20})[:：]\s*(.{5,})$/);
      if (matches) {
        question = matches[1].trim();
        answer = matches[2].trim();
      }
    }
    
    if (question && answer && question.length > 2 && answer.length > 3) {
      const qaItem = {
        question: question,
        answer: answer,
        source: fileData.name,
        lineNumber: i + 1,
        pattern: '자동감지'
      };
      
      parsedQA.push(qaItem);
    }
  }
  
  return parsedQA;
}

// API 테스트 함수
async function testAllAPIs() {
  const testResults = [];
  const testMessage = "안녕하세요. API 연결 테스트입니다.";
  
  if (apiSettings.chatgpt.enabled) {
    try {
      await callChatGPTAPIWithContext(testMessage, apiSettings.chatgpt, '');
      testResults.push('✅ ChatGPT API 연결 성공');
    } catch (error) {
      testResults.push(`❌ ChatGPT API 오류: ${error.message}`);
    }
  }
  
  if (apiSettings.gemini.enabled) {
    try {
      await callGeminiAPIWithContext(testMessage, apiSettings.gemini, '');
      testResults.push('✅ Gemini API 연결 성공');
    } catch (error) {
      testResults.push(`❌ Gemini API 오류: ${error.message}`);
    }
  }
  
  if (apiSettings.claude.enabled) {
    try {
      await callClaudeAPIWithContext(testMessage, apiSettings.claude, '');
      testResults.push('✅ Claude API 연결 성공');
    } catch (error) {
      testResults.push(`❌ Claude API 오류: ${error.message}`);
    }
  }
  
  return testResults;
}

// --- window.AICore 객체로 모든 함수 export ---
window.AICore = {
  // 상태 변수들
  apiSettings: apiSettings,
  knowledgeBase: knowledgeBase,
  
  // 관리자 함수
  adminLogin: adminLogin,
  
  // AI 응답 함수들
  generateAIResponse: generateAIResponse,
  callAIAPIWithContext: callAIAPIWithContext,
  getDefaultResponse: getDefaultResponse,
  
  // 지식베이스 함수들
  searchInKnowledgeBase: searchInKnowledgeBase,
  formatKnowledgeBaseAnswer: formatKnowledgeBaseAnswer,
  parseKnowledgeFile: parseKnowledgeFile,
  getContextFromKnowledgeBase: getContextFromKnowledgeBase,
  
  // API 호출 함수들
  callChatGPTAPIWithContext: callChatGPTAPIWithContext,
  callGeminiAPIWithContext: callGeminiAPIWithContext,
  callClaudeAPIWithContext: callClaudeAPIWithContext,
  testAllAPIs: testAllAPIs,
  
  // 유틸리티 함수들
  saveApiSettingsToStorage: saveApiSettingsToStorage,
  saveKnowledgeBaseToStorage: saveKnowledgeBaseToStorage,
  formatFriendlyResponse: formatFriendlyResponse
};

console.log('🤖 AICore 엔진 로드 완료:', Object.keys(window.AICore).length, '개 함수');
console.log('📋 AICore 함수 목록:', Object.keys(window.AICore));
console.log('🔧 초기 설정 상태:', {
  apiSettings: apiSettings,
  knowledgeBase: {
    enabled: knowledgeBase.enabled,
    filesCount: knowledgeBase.files.length,
    parsedDataCount: knowledgeBase.parsedData.length
  }
}); 