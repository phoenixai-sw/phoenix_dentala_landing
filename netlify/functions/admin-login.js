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
  console.log('Environment check:', {
    hasUrl: !!process.env.SUPABASE_URL,
    hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
    urlLength: process.env.SUPABASE_URL?.length,
    keyLength: process.env.SUPABASE_ANON_KEY?.length
  });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

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
    error: loginError?.message 
  });

  if (loginError) {
    console.error('Login error:', loginError);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        error: loginError.message || 'Invalid credentials',
        details: loginError
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
};
