const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 환경변수 확인
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    console.log('Supabase Test - Environment Variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlLength: supabaseUrl?.length,
      keyLength: supabaseKey?.length,
      urlStart: supabaseUrl?.substring(0, 30) + '...',
      keyStart: supabaseKey?.substring(0, 20) + '...'
    });

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Missing environment variables',
          details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }
        })
      };
    }

    // Supabase 클라이언트 생성 테스트
    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created successfully');

    // 간단한 쿼리 테스트 (인증 없이)
    console.log('Testing basic query...');
    const { data, error } = await supabase
      .from('_dummy_table_that_does_not_exist')
      .select('*')
      .limit(1);

    // 이 쿼리는 실패해야 하지만, 연결은 성공해야 함
    console.log('Query result:', { hasData: !!data, hasError: !!error });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Supabase connection test completed',
        environment: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          urlLength: supabaseUrl?.length,
          keyLength: supabaseKey?.length
        },
        connection: {
          clientCreated: true,
          queryTested: true
        }
      })
    };

  } catch (error) {
    console.error('Supabase test error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Supabase connection failed',
        details: {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 3)
        }
      })
    };
  }
}; 