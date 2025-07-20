exports.handler = async (event) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // OPTIONS 요청 처리 (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // 환경변수 확인
  const envCheck = {
    // Supabase 환경변수
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    supabaseUrl: process.env.SUPABASE_URL ? 'SET' : 'NOT_SET',
    supabaseKeyLength: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.length : 0,
    
    // SMS (Solapi) 환경변수
    hasMessagingApiKey: !!process.env.MESSAGING_API_KEY,
    hasMessagingSecretKey: !!process.env.MESSAGING_SECRET_KEY,
    messagingApiKeyLength: process.env.MESSAGING_API_KEY ? process.env.MESSAGING_API_KEY.length : 0,
    messagingSecretKeyLength: process.env.MESSAGING_SECRET_KEY ? process.env.MESSAGING_SECRET_KEY.length : 0,
    
    // 기타 환경변수들
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    adminPasswordLength: process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.length : 0
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Test function is working!',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      method: event.httpMethod,
      path: event.path,
      note: '환경변수가 모두 SET으로 표시되면 SMS 발송 준비 완료!'
    })
  };
}; 