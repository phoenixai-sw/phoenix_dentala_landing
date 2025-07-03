// Phoenix Dental AI Core (공통 모듈)
(function() {
  // --- 상태 변수 ---
  const apiSettings = {
    chatgpt: { apiKey: '', model: '', enabled: false },
    gemini: { apiKey: '', model: '', enabled: false },
    claude: { apiKey: '', model: '', enabled: false },
    activeProvider: ''
  };
  const knowledgeBase = {
    files: [],
    content: '',
    parsedData: [],
    enabled: false
  };

  // --- 관리자 인증 (간단 예시) ---
  function adminLogin(id, pw) {
    return id === 'phoenix' && pw === 'phoenix';
  }

  // --- AI 답변 생성 우선순위 (실제 API 연동) ---
  async function generateAIResponse(userMessage) {
    const knowledgeAnswer = searchInKnowledgeBase(userMessage);
    if (knowledgeAnswer) return knowledgeAnswer;
    if (apiSettings.activeProvider && apiSettings[apiSettings.activeProvider].enabled) {
      const provider = apiSettings.activeProvider;
      const settings = apiSettings[provider];
      let context = '';
      if (knowledgeBase.enabled && knowledgeBase.parsedData.length > 0) {
        context = knowledgeBase.parsedData.slice(0, 5).map((qa, i) => `${i+1}. Q: ${qa.question}\nA: ${qa.answer}`).join('\n');
      }
      if (provider === 'chatgpt') return await callChatGPTAPIWithContext(userMessage, settings, context);
      if (provider === 'gemini') return await callGeminiAPIWithContext(userMessage, settings, context);
      if (provider === 'claude') return await callClaudeAPIWithContext(userMessage, settings, context);
    }
    return getDefaultResponse(userMessage);
  }

  // --- 지식 파일 검색 (간단 예시) ---
  function searchInKnowledgeBase(userMessage) {
    if (!knowledgeBase.enabled || knowledgeBase.parsedData.length === 0) return null;
    const msg = userMessage.toLowerCase();
    for (const qa of knowledgeBase.parsedData) {
      if (qa.question.toLowerCase().includes(msg) || qa.answer.toLowerCase().includes(msg)) {
        return qa.answer;
      }
    }
    return null;
  }

  // --- AI API 호출 (간단 예시) ---
  async function callAIAPIWithContext(userMessage) {
    // 실제 구현은 index.html 참고, provider별 fetch
    return '[AI API 응답 예시]';
  }

  // --- 기본 FAQ 응답 (간단 예시) ---
  function getDefaultResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    if (msg.includes('진료시간')) return '🕘 평일 9시~18시, 토요일 9시~15시, 점심 12:30~1:30, 일요일/공휴일 휴진입니다.';
    if (msg.includes('예약')) return '📞 예약은 070-1234-1234 또는 온라인 예약을 이용해주세요!';
    if (msg.includes('비용')) return '💰 진료비는 초진 15,000원, 스케일링 50,000원, 임플란트 120만원~입니다.';
    if (msg.includes('위치')) return '🏥 강남역 3번 출구 도보 5분, 피닉스시 피닉스로 11길 11입니다.';
    return '😊 궁금하신 점을 말씀해주시면 친절하게 안내드리겠습니다!';
  }

  // --- 지식 파일 파싱 고도화 ---
  function parseKnowledgeFile(fileObj) {
    const content = fileObj.content;
    const lines = content.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0);
    const parsedQA = [];
    for (let i=0; i<lines.length; i++) {
      let q='', a='';
      if (lines[i].match(/^[Qq]\s*[:：]?\s*(.+)$/)) {
        q = lines[i].replace(/^[Qq]\s*[:：]?\s*/, '');
        if (i+1<lines.length && lines[i+1].match(/^[Aa]\s*[:：]?\s*(.+)$/)) {
          a = lines[i+1].replace(/^[Aa]\s*[:：]?\s*/, '');
          i++;
        }
      } else if (lines[i].match(/^\d+\.\s*(.+[?？])\s*$/)) {
        q = lines[i].replace(/^\d+\.\s*/, '');
        if (i+1<lines.length && !lines[i+1].match(/^\d+\./)) {
          a = lines[i+1];
          i++;
        }
      } else if (lines[i].length>5 && (lines[i].includes('?')||lines[i].includes('？'))) {
        q = lines[i];
        if (i+1<lines.length && !lines[i+1].match(/^[QqAa\d]/)) {
          a = lines[i+1];
          i++;
        }
      }
      if (q && a) parsedQA.push({question:q, answer:a, source:fileObj.name});
    }
    // 중복 제거
    const uniqueQA = [];
    parsedQA.forEach(qa=>{
      if (!uniqueQA.some(u=>u.question===qa.question && u.answer===qa.answer)) uniqueQA.push(qa);
    });
    return uniqueQA;
  }

  // --- AI 모델별 실제 API 연동 ---
  async function callChatGPTAPIWithContext(msg, settings, context) {
    try {
      const systemPrompt = `병원 전문 AI 상담사입니다.\n${context}`;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: msg }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e) {
      return `❌ ChatGPT API 오류: ${e.message}`;
    }
  }
  async function callGeminiAPIWithContext(msg, settings, context) {
    try {
      const prompt = `병원 전문 AI 상담사입니다.\n${context}\n질문: ${msg}`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      return `❌ Gemini API 오류: ${e.message}`;
    }
  }
  async function callClaudeAPIWithContext(msg, settings, context) {
    try {
      const prompt = `병원 전문 AI 상담사입니다.\n${context}\n질문: ${msg}`;
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: settings.model,
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.content[0].text;
    } catch (e) {
      return `❌ Claude API 오류: ${e.message}`;
    }
  }

  // --- 관리자 패널용 전체 API 테스트 ---
  async function testAllAPIs() {
    const results = [];
    const testMsg = '안녕하세요. API 연결 테스트입니다.';
    if (apiSettings.chatgpt.enabled) {
      const r = await callChatGPTAPIWithContext(testMsg, apiSettings.chatgpt, '');
      results.push(r.startsWith('❌') ? r : '✅ ChatGPT API 연결 성공');
    }
    if (apiSettings.gemini.enabled) {
      const r = await callGeminiAPIWithContext(testMsg, apiSettings.gemini, '');
      results.push(r.startsWith('❌') ? r : '✅ Gemini API 연결 성공');
    }
    if (apiSettings.claude.enabled) {
      const r = await callClaudeAPIWithContext(testMsg, apiSettings.claude, '');
      results.push(r.startsWith('❌') ? r : '✅ Claude API 연결 성공');
    }
    return results;
  }

  // --- 내보내기 확장 ---
  window.AICore = {
    apiSettings,
    knowledgeBase,
    adminLogin,
    generateAIResponse,
    searchInKnowledgeBase,
    callAIAPIWithContext,
    getDefaultResponse,
    parseKnowledgeFile,
    callChatGPTAPIWithContext,
    callGeminiAPIWithContext,
    callClaudeAPIWithContext,
    testAllAPIs
  };
})(); 