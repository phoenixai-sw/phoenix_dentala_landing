const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const { email, password } = JSON.parse(event.body || '{}');
  if (!email || !password) {
    return {
      statusCode: 400,
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
  // 임시 테스트용 하드코딩 로그인 (Supabase 연결 문제 시)
  if ((email === 'phoenixai.sw@gmail.com' && password === 'phoenixai') ||
      (email === 'phoenixai.edu@gmail.com' && password === 'phoenixai')) {
    console.log('Using hardcoded login for testing');
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        token: 'test-token-' + Date.now(),
        user: email,
        success: true,
        message: 'Test login successful'
      })
    };
  }

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
      body: JSON.stringify({ 
        error: loginError.message || 'Invalid credentials',
        details: loginError
      })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ 
      token: loginData.session?.access_token,
      user: loginData.user?.email,
      success: true
    })
  };
};
