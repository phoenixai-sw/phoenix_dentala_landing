const fetch = require('node-fetch');

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

  try {
    const body = JSON.parse(event.body || '{}');
    const apiKey = process.env.PHOENIXAI_API_KEY;

    console.log('🤖 PhoenixAI 챗봇 요청:', {
      hasApiKey: !!apiKey,
      messageLength: body.messages?.length || 0,
      model: body.model
    });

    if (!apiKey) {
      console.error('❌ PhoenixAI API 키가 설정되지 않음');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'PhoenixAI API key not configured',
          message: '관리자에게 문의하세요.'
        })
      };
    }

    // PhoenixAI API 호출 (실제 엔드포인트는 PhoenixAI 문서에 따라 수정 필요)
    const response = await fetch('https://api.phoenixai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: body.model,
        messages: body.messages,
        max_tokens: body.max_tokens || 800,
        temperature: body.temperature || 0.7
      })
    });

    const data = await response.json();

    console.log('🤖 PhoenixAI 챗봇 응답:', {
      status: response.status,
      hasData: !!data,
      hasChoices: !!data.choices,
      choiceCount: data.choices?.length || 0
    });

    if (!response.ok) {
      console.error('❌ PhoenixAI API 오류:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: data.error?.message || 'PhoenixAI API 오류',
          message: '잠시 후 다시 시도해주세요.'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('❌ PhoenixAI 챗봇 함수 오류:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      })
    };
  }
}; 