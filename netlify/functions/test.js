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
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    
    // SMS API 환경변수
    hasMessagingApiKey: !!process.env.MESSAGING_API_KEY,
    hasMessagingSecretKey: !!process.env.MESSAGING_SECRET_KEY,
    
    // 관리자 비밀번호
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    
    // 전체 상태
    allRequired: !!(process.env.SUPABASE_URL && 
                   process.env.SUPABASE_ANON_KEY && 
                   process.env.MESSAGING_API_KEY && 
                   process.env.MESSAGING_SECRET_KEY)
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: '환경변수 상태 확인',
      environment: process.env.NODE_ENV || 'development',
      envCheck,
      timestamp: new Date().toISOString()
    })
  };
}; 