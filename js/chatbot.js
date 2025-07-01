// Minimal AI 챗봇 엔진 (공통)
// 향후 Firebase 연동 및 실제 챗봇 로직 추가 예정

(function() {
  const root = document.getElementById('chatbot-root');
  if (!root) return;

  // 기본 챗봇 UI
  root.innerHTML = `
    <div style="max-width:400px;margin:40px auto;padding:24px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);background:#fff;">
      <h2 style="margin-bottom:16px;font-size:1.3em;">🤖 AI 챗봇 상담</h2>
      <div id="chatbot-messages" style="min-height:120px;margin-bottom:12px;color:#333;font-size:1em;"></div>
      <form id="chatbot-form" style="display:flex;gap:8px;">
        <input id="chatbot-input" type="text" placeholder="메시지를 입력하세요..." style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid #ccc;" />
        <button type="submit" style="padding:8px 16px;border-radius:8px;background:#007bff;color:#fff;border:none;">전송</button>
      </form>
    </div>
  `;

  const messages = document.getElementById('chatbot-messages');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    messages.innerHTML += `<div style='margin-bottom:6px;'><b>나:</b> ${text}</div>`;
    input.value = '';
    // TODO: 실제 AI 응답 연동 (Firebase 등)
    setTimeout(() => {
      messages.innerHTML += `<div style='margin-bottom:6px;'><b>AI:</b> (여기에 AI 답변이 표시됩니다)</div>`;
      messages.scrollTop = messages.scrollHeight;
    }, 500);
  });
})(); 