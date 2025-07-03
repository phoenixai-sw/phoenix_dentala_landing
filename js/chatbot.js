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