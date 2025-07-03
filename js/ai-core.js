// --- 상태 변수 ---
const apiSettings = (function(){
  const saved = localStorage.getItem('apiSettings');
  if (saved) return JSON.parse(saved);
  return {
    chatgpt: { apiKey: '', model: '', enabled: false },
    gemini: { apiKey: '', model: '', enabled: false },
    claude: { apiKey: '', model: '', enabled: false },
    activeProvider: ''
  };
})();
const knowledgeBase = (function(){
  const saved = localStorage.getItem('knowledgeBase');
  if (saved) return JSON.parse(saved);
  return {
    files: [],
    content: '',
    parsedData: [],
    enabled: false
  };
})();

function saveApiSettingsToStorage() {
  localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
}
function saveKnowledgeBaseToStorage() {
  localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
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

// ... 기존 함수들에서 apiSettings, knowledgeBase 대신 apiSettingsProxy, knowledgeBaseProxy 사용 ...
// 내보내기 확장
window.AICore = {
  apiSettings: apiSettingsProxy,
  knowledgeBase: knowledgeBaseProxy,
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