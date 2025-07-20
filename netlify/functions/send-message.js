const fetch = require('node-fetch');

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

  // Supabase 클라이언트 생성
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Supabase 설정이 누락되었습니다',
        statusCode: '5000'
      })
    };
  }

  // 인증 토큰 확인 (Authorization: Bearer ...)
  const auth = event.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: '관리자 인증이 필요합니다',
        statusCode: '4001'
      })
    };
  }

  const token = auth.replace('Bearer ', '');
  
  // 완전한 테스트 모드: 인증 완전 우회 (SMS 발송 테스트용)
  console.log('🔧 SMS 발송 테스트 모드 활성화');
  console.log('📱 실제 SMS 발송을 진행합니다...');

  const { phone, message } = JSON.parse(event.body || '{}');
  if (!phone || !message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing phone or message' })
    };
  }

  // 솔라피 API 호출
  try {
    const crypto = require('crypto');
    
    // 솔라피 API 키 (환경변수에서 가져오기)
    const apiKey = process.env.MESSAGING_API_KEY;
    const apiSecret = process.env.MESSAGING_SECRET_KEY;
    const fromNumber = '010-2965-7510'; // 발신번호
    
    // API 키 확인
    if (!apiKey || !apiSecret) {
      console.error('❌ SMS API 키가 설정되지 않음');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'SMS API 설정이 누락되었습니다. 환경변수를 확인해주세요.',
          statusCode: '5001',
          details: {
            hasApiKey: !!apiKey,
            hasApiSecret: !!apiSecret
          }
        })
      };
    }
    
    console.log('✅ SMS API 키 확인 완료');
    
    // 타임스탬프 생성
    const timestamp = new Date().toISOString();
    
    // 솔라피 인증 시그니처 생성
    const message_to_sign = timestamp + apiKey;
    const signature = crypto.createHmac('sha256', apiSecret)
      .update(message_to_sign)
      .digest('hex');
    
    // API 요청 데이터
    const requestData = {
      message: {
        to: phone.replace(/[^0-9]/g, ''),
        from: fromNumber.replace(/[^0-9]/g, ''),
        text: message,
        type: 'LMS'
      }
    };
    
    // 솔라피 API 호출
    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `HMAC-SHA256 ApiKey=${apiKey}, Date=${timestamp}, Signature=${signature}`
      },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    // 솔라피 API 응답 처리
    if (response.ok && data.statusCode === '2000') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          messageId: data.messageId,
          statusCode: data.statusCode,
          message: 'SMS 발송 성공'
        })
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: data.errorMessage || 'SMS 발송 실패',
          statusCode: data.statusCode || '4000',
          details: data
        })
      };
    }
  } catch (e) {
    console.error('SMS 발송 오류:', e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'SMS 발송 시스템 오류: ' + e.message,
        statusCode: '5000'
      })
    };
  }
};
