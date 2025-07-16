const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 브라우저별 호환성을 위한 포괄적 CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
    // 브라우저 캐싱 방지
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  // OPTIONS 요청 처리 (preflight) - 모든 브라우저 지원
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

  try {
    const body = JSON.parse(event.body || '{}');
    const apiKey = process.env.OPENAI_API_KEY;

    // 브라우저별 디버깅 정보 추가
    const userAgent = event.headers['user-agent'] || 'Unknown';
    const origin = event.headers.origin || 'Unknown';
    
    console.log('🤖 AI 챗봇 요청:', {
      hasApiKey: !!apiKey,
      messageLength: body.messages?.length || 0,
      model: body.model,
      userAgent: userAgent.substring(0, 100),
      origin: origin,
      method: event.httpMethod,
      path: event.path
    });

    if (!apiKey) {
      console.error('❌ OpenAI API 키가 설정되지 않음');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'OpenAI API key not configured',
          message: '관리자에게 문의하세요.',
          browser: userAgent.substring(0, 50)
        })
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'PhoenixDental-Chatbot/1.0'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    console.log('🤖 AI 챗봇 응답:', {
      status: response.status,
      hasData: !!data,
      hasChoices: !!data.choices,
      choiceCount: data.choices?.length || 0,
      userAgent: userAgent.substring(0, 50)
    });

    if (!response.ok) {
      console.error('❌ OpenAI API 오류:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: data.error?.message || 'OpenAI API 오류',
          message: '잠시 후 다시 시도해주세요.',
          browser: userAgent.substring(0, 50)
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('❌ AI 챗봇 함수 오류:', error);
    const userAgent = event.headers['user-agent'] || 'Unknown';
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        browser: userAgent.substring(0, 50)
      })
    };
  }
};
