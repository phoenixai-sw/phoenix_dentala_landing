const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const body = JSON.parse(event.body || '{}');
  const { user, message, role, session_id } = body;
  if (!message || !role) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields' })
    };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data, error } = await supabase.from('chat_logs').insert([
    { user, message, role, session_id }
  ]);

  if (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, data })
  };
};
