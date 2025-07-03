// 피닉스 치과 AI 코어 엔진
console.log('🤖 AICore 엔진 로딩 시작...');

// 기본 설정
const apiSettings = {
  chatgpt: { apiKey: '', model: '', enabled: false },
  gemini: { apiKey: '', model: '', enabled: false },
  claude: { apiKey: '', model: '', enabled: false },
  activeProvider: ''
};

const knowledgeBase = {
  files: [],
  parsedData: [],
  enabled: false
};

// 저장된 설정 로드
function loadSavedSettings() {
  try {
    const savedSettings = localStorage.getItem('phoenix_ai_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      Object.assign(apiSettings, parsed);
      console.log('✅ 저장된 API 설정 로드됨');
    }
  } catch (error) {
    console.log('⚠️ 저장된 설정 로드 실패:', error);
  }
}

// 설정 저장
function saveSettings() {
  try {
    localStorage.setItem('phoenix_ai_settings', JSON.stringify(apiSettings));
    console.log('💾 API 설정 저장됨');
  } catch (error) {
    console.log('⚠️ 설정 저장 실패:', error);
  }
}

// 페이지 로드 시 설정 복원
loadSavedSettings();

// 기본 응답 함수
function getDefaultResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  if (message.includes('진료시간') || message.includes('언제') || message.includes('몇시')) {
    return `🕘 <strong>피닉스 치과 진료시간</strong><br><br>
    📅 <strong>평일</strong>: 오전 9시 ~ 오후 6시<br>
    📅 <strong>토요일</strong>: 오전 9시 ~ 오후 3시<br>
    🍽️ <strong>점심시간</strong>: 12시 30분 ~ 1시 30분<br>
    🚫 <strong>휴진</strong>: 일요일, 공휴일<br><br>
    💡 <strong>예약 안내</strong><br>
    • 온라인 예약: 24시간 언제든 가능<br>
    • 전화 예약: 070-1234-1234`;
  }
  
  if (message.includes('예약') || message.includes('신청') || message.includes('접수')) {
    return `📞 <strong>예약 및 상담 안내</strong><br><br>
    🌟 <strong>온라인 예약</strong> (추천)<br>
    • 24시간 언제든 예약 가능<br>
    • 원하는 날짜/시간 선택<br>
    • 즉시 예약 확인<br><br>
    📱 <strong>전화 예약</strong><br>
    • 070-1234-1234<br>
    • 평일 09:00-18:00, 토요일 09:00-15:00`;
  }
  
  if (message.includes('비용') || message.includes('가격') || message.includes('얼마')) {
    return `💰 <strong>치료비 안내</strong><br><br>
    🦷 <strong>기본 진료</strong><br>
    • 초진료: 15,000원<br>
    • 재진료: 10,000원<br>
    • 스케일링: 50,000원 (건강보험 적용시 연1회 무료)<br><br>
    ✨ <strong>전문 치료</strong><br>
    • 미백치료: 200,000 ~ 300,000원<br>
    • 교정치료: 1,500,000 ~ 6,000,000원<br>
    • 임플란트: 1,200,000 ~ 1,500,000원`;
  }
  
  if (message.includes('위치') || message.includes('주소') || message.includes('어디')) {
    return `🏥 <strong>피닉스 치과 오시는 길</strong><br><br>
    📍 <strong>주소</strong><br>
    피닉스시 피닉스로 11길 11, 피닉스타워 11층 11호<br><br>
    🚇 <strong>지하철</strong><br>
    2호선 강남역 3번 출구 → 도보 5분<br><br>
    🚌 <strong>버스</strong><br>
    강남역 정류장 하차 → 도보 3분<br><br>
    🚗 <strong>주차 안내</strong><br>
    • 건물 지하 1~3층 무료 주차<br>
    • 3시간 무료 이용`;
  }
  
  if (message.includes('치료') || message.includes('시술')) {
    return `🦷 <strong>피닉스 치과 진료과목</strong><br><br>
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
    • 무해한 재료 사용`;
  }
  
  return `😊 <strong>안녕하세요! 피닉스 치과 AI 상담사입니다</strong><br><br>
  💡 <strong>무엇을 도와드릴까요?</strong><br>
  • 진료시간 및 예약 안내<br>
  • 치료 비용 상담<br>
  • 오시는 길 안내<br>
  • 진료과목 상세 정보<br>
  • 기타 궁금한 점<br><br>
  🦷 건강한 미소를 위한 여러분의 든든한 파트너가 되겠습니다!`;
}

// 지식베이스 검색 함수
function searchInKnowledgeBase(userMessage) {
  if (!knowledgeBase.enabled || knowledgeBase.parsedData.length === 0) {
    return null;
  }
  
  const message = userMessage.toLowerCase().trim();
  
  for (let qa of knowledgeBase.parsedData) {
    const question = qa.question.toLowerCase();
    const answer = qa.answer.toLowerCase();
    
    if (question.includes(message) || message.includes(question) || answer.includes(message)) {
      return formatKnowledgeBaseAnswer(qa);
    }
  }
  
  return null;
}

// 지식베이스 답변 포맷팅
function formatKnowledgeBaseAnswer(qa) {
  return `📚 <strong>피닉스 치과 전문 안내</strong><br><br>
  ${qa.answer}<br><br>
  <div style="background: #f0f8ff; padding: 10px; border-radius: 8px; margin-top: 10px;">
    💡 <strong>추가 도움이 필요하시다면:</strong><br>
    📞 전화상담: 070-1234-1234 (24시간)<br>
    🕘 진료시간: 평일 09:00-18:00, 토요일 09:00-15:00<br>
    📍 위치: 강남역 3번 출구 도보 5분
  </div>`;
}

// AI 응답 생성 함수
function generateAIResponse(userMessage) {
  console.log('🤖 AI 응답 생성:', userMessage);
  
  // 1. 지식베이스 검색
  const knowledgeAnswer = searchInKnowledgeBase(userMessage);
  if (knowledgeAnswer) {
    console.log('✅ 지식베이스에서 답변 발견');
    return Promise.resolve(knowledgeAnswer);
  }
  
  // 2. API 호출 (설정된 경우)
  if (apiSettings.activeProvider && apiSettings[apiSettings.activeProvider].enabled) {
    console.log('🚀 API 호출 시도:', apiSettings.activeProvider);
    return callAIAPI(userMessage);
  }
  
  // 3. 기본 FAQ 응답
  console.log('💡 기본 FAQ 응답 사용');
  return Promise.resolve(getDefaultResponse(userMessage));
}

// AI API 호출 함수
async function callAIAPI(userMessage) {
  const provider = apiSettings.activeProvider;
  const settings = apiSettings[provider];
  
  try {
    let response;
    
    switch (provider) {
      case 'chatgpt':
        response = await callChatGPTAPI(userMessage, settings);
        break;
      case 'gemini':
        response = await callGeminiAPI(userMessage, settings);
        break;
      case 'claude':
        response = await callClaudeAPI(userMessage, settings);
        break;
      default:
        return getDefaultResponse(userMessage);
    }
    
    return formatAPIResponse(response, provider);
    
  } catch (error) {
    console.error('API 호출 오류:', error);
    return getDefaultResponse(userMessage);
  }
}

// ChatGPT API 호출
async function callChatGPTAPI(message, settings) {
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

  답변 가이드라인:
  1. 매우 친절하고 따뜻한 말투를 사용하세요
  2. 전문적이면서도 이해하기 쉽게 설명하세요
  3. 구체적인 정보를 제공하되, 정확하지 않은 의료 진단은 피하세요
  4. 예약이나 상담이 필요한 경우 적극 안내하세요`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 800,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Gemini API 호출
async function callGeminiAPI(message, settings) {
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

  질문: ${message}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Claude API 호출
async function callClaudeAPI(message, settings) {
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
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// API 응답 포맷팅
function formatAPIResponse(response, provider) {
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
  ${response}<br><br>
  <small>💡 추가 궁금한 점이 있으시면 언제든 문의해주세요!</small>`;
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
    
    if (line.match(/^[Qq]\s*[:：]\s*(.+)$/i)) {
      question = line.replace(/^[Qq]\s*[:：]\s*/i, '').trim();
      
      for (let j = i + 1; j < lines.length && j < i + 5; j++) {
        const nextLine = lines[j];
        if (nextLine.match(/^[Aa]\s*[:：]\s*(.+)$/i)) {
          answer = nextLine.replace(/^[Aa]\s*[:：]\s*/i, '').trim();
          i = j;
          break;
        } else if (!nextLine.match(/^[Qq]\s*[:：]/i)) {
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
    
    if (question && answer && question.length > 2 && answer.length > 3) {
      parsedQA.push({
        question: question,
        answer: answer,
        source: fileData.name
      });
    }
  }
  
  return parsedQA;
}

// 관리자 로그인 함수
function adminLogin(id, pw) {
  return id === 'phoenix' && pw === 'phoenix';
}

// window.AICore 객체로 export
window.AICore = {
  // 상태 변수들
  apiSettings: apiSettings,
  knowledgeBase: knowledgeBase,
  
  // 관리자 함수
  adminLogin: adminLogin,
  
  // AI 응답 함수들
  generateAIResponse: generateAIResponse,
  getDefaultResponse: getDefaultResponse,
  
  // 지식베이스 함수들
  searchInKnowledgeBase: searchInKnowledgeBase,
  formatKnowledgeBaseAnswer: formatKnowledgeBaseAnswer,
  parseKnowledgeFile: parseKnowledgeFile,
  
  // API 호출 함수들
  callChatGPTAPI: callChatGPTAPI,
  callGeminiAPI: callGeminiAPI,
  callClaudeAPI: callClaudeAPI,
  
  // 설정 관리 함수들
  saveSettings: saveSettings,
  loadSavedSettings: loadSavedSettings,
  
  // 테스트 함수들
  testAPISettings() {
    console.log('🔍 API 설정 상태 확인:');
    console.log('Active Provider:', apiSettings.activeProvider);
    console.log('ChatGPT enabled:', apiSettings.chatgpt.enabled);
    console.log('Gemini enabled:', apiSettings.gemini.enabled);
    console.log('Claude enabled:', apiSettings.claude.enabled);
    
    if (!apiSettings.activeProvider) {
      console.log('⚠️ 활성화된 API 제공자가 없습니다.');
      console.log('💡 관리자 페이지에서 API 키를 설정해주세요.');
    }
  },
  
  // 테스트용 API 설정 (개발용)
  setTestAPI(provider, apiKey, model) {
    console.log(`🧪 테스트 API 설정: ${provider}`);
    apiSettings[provider] = {
      apiKey: apiKey,
      model: model,
      enabled: true
    };
    apiSettings.activeProvider = provider;
    saveSettings();
    console.log('✅ 테스트 API 설정 완료');
  }
};

console.log('🤖 AICore 엔진 로드 완료!');
console.log('📋 사용 가능한 함수:', Object.keys(window.AICore)); 