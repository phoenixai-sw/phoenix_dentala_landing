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
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('🤖 Gemini AI 챗봇 요청:', {
      hasApiKey: !!apiKey,
      model: body.model,
      promptLength: body.prompt?.length || 0
    });

    if (!apiKey) {
      console.error('❌ Gemini API 키가 설정되지 않음');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Gemini API key not configured',
          message: '관리자에게 문의하세요.'
        })
      };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${body.model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: body.prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: body.maxOutputTokens || 800,
          temperature: body.temperature || 0.7
        }
      })
    });

    const data = await response.json();

    console.log('🤖 Gemini AI 챗봇 응답:', {
      status: response.status,
      hasData: !!data,
      hasCandidates: !!data.candidates,
      candidateCount: data.candidates?.length || 0
    });

    if (!response.ok) {
      console.error('❌ Gemini API 오류:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: data.error?.message || 'Gemini API 오류',
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
    console.error('❌ Gemini AI 챗봇 함수 오류:', error);
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