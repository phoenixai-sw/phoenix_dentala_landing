const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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

  try {
    // Supabase 클라이언트 초기화
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase 환경변수가 설정되지 않음');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Database configuration error',
          message: '서버 설정 오류가 발생했습니다.'
        })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (event.httpMethod === 'GET') {
      // 모델 설정 조회
      console.log('🤖 모델 설정 조회 요청');
      
      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .eq('setting_type', 'ai_model')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116는 데이터가 없는 경우
        console.error('❌ 모델 설정 조회 실패:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Failed to fetch model settings',
            message: '모델 설정 조회에 실패했습니다.'
          })
        };
      }

      // 기본 설정 (데이터가 없는 경우)
      const defaultSettings = {
        chatgpt: {
          enabled: true,
          model: 'gpt-4o',
          apiKey: '' // 환경변수에서 관리
        },
        gemini: {
          enabled: false,
          model: '',
          apiKey: ''
        },
        claude: {
          enabled: false,
          model: '',
          apiKey: ''
        }
      };

      const settings = data ? data.setting_value : defaultSettings;

      console.log('✅ 모델 설정 조회 성공:', settings);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(settings)
      };

    } else if (event.httpMethod === 'POST') {
      // 모델 설정 저장
      const body = JSON.parse(event.body || '{}');
      console.log('🤖 모델 설정 저장 요청:', body);

      // 기존 설정 확인
      const { data: existingData } = await supabase
        .from('chatbot_settings')
        .select('*')
        .eq('setting_type', 'ai_model')
        .single();

      if (existingData) {
        // 기존 설정 업데이트
        const { error } = await supabase
          .from('chatbot_settings')
          .update({ 
            setting_value: body,
            updated_at: new Date().toISOString()
          })
          .eq('setting_type', 'ai_model');

        if (error) {
          console.error('❌ 모델 설정 업데이트 실패:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Failed to update model settings',
              message: '모델 설정 업데이트에 실패했습니다.'
            })
          };
        }
      } else {
        // 새 설정 생성
        const { error } = await supabase
          .from('chatbot_settings')
          .insert({
            setting_type: 'ai_model',
            setting_value: body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('❌ 모델 설정 생성 실패:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Failed to create model settings',
              message: '모델 설정 생성에 실패했습니다.'
            })
          };
        }
      }

      console.log('✅ 모델 설정 저장 성공');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: '모델 설정이 성공적으로 저장되었습니다.'
        })
      };

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }

  } catch (error) {
    console.error('❌ 모델 설정 함수 오류:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: '서버 오류가 발생했습니다.'
      })
    };
  }
}; 