const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // OPTIONS 요청 처리 (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const { email, password } = JSON.parse(event.body || '{}');
  if (!email || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email and password required' })
    };
  }

  console.log('Login attempt:', { email, password: '***' });
  
  // 환경변수 상세 확인
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseKey,
    urlLength: supabaseUrl?.length,
    keyLength: supabaseKey?.length,
    urlStart: supabaseUrl?.substring(0, 20) + '...',
    keyStart: supabaseKey?.substring(0, 20) + '...'
  });

  // 환경변수 검증
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server configuration error - missing environment variables',
        details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }
      })
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created successfully');

    // 실제 로그인 시도
    console.log('Attempting Supabase login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('Login result:', { 
      success: !loginError, 
      hasData: !!loginData, 
      hasSession: !!loginData?.session,
      error: loginError?.message,
      errorType: loginError?.name
    });

    if (loginError) {
      console.error('Login error details:', loginError);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: loginError.message || 'Invalid credentials',
          details: {
            name: loginError.name,
            status: loginError.status,
            originalError: loginError.originalError
          }
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        token: loginData.session?.access_token,
        user: loginData.user?.email,
        success: true
      })
    };

  } catch (error) {
    console.error('Unexpected error during login:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error during login',
        details: {
          message: error.message,
          name: error.name,
          stack: error.stack
        }
      })
    };
  }
};
