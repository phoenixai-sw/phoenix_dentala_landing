const fetch = require('node-fetch');

exports.handler = async (event) => {
  // CORS 헤더 설정 (브라우저 호환성 강화)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Credentials': 'true',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
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
    const apiKey = process.env.CLAUDE_API_KEY;

    console.log('🤖 Claude AI 챗봇 요청:', {
      hasApiKey: !!apiKey,
      model: body.model,
      messageLength: body.messages?.length || 0
    });

    if (!apiKey) {
      console.error('❌ Claude API 키가 설정되지 않음');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Claude API key not configured',
          message: '관리자에게 문의하세요.'
        })
      };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: body.model,
        messages: body.messages,
        max_tokens: body.max_tokens || 800
      })
    });

    const data = await response.json();

    console.log('🤖 Claude AI 챗봇 응답:', {
      status: response.status,
      hasData: !!data,
      hasContent: !!data.content,
      contentLength: data.content?.length || 0
    });

    if (!response.ok) {
      console.error('❌ Claude API 오류:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: data.error?.message || 'Claude API 오류',
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
    console.error('❌ Claude AI 챗봇 함수 오류:', error);
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