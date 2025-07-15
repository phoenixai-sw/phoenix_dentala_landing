const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // 인증 토큰 확인 (Authorization: Bearer ...)
  const auth = event.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  const { phone, message } = JSON.parse(event.body || '{}');
  if (!phone || !message) {
    return {
      statusCode: 400,
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
    return {
      statusCode: response.status,
      body: JSON.stringify(data)
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
