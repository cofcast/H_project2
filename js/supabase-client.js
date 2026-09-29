// 브라우저 공개용 Publishable Key만 사용합니다.
// CDN의 window.supabase는 SDK이며, 생성한 클라이언트는 별도로 보관합니다.
(() => {
  const projectUrl = 'https://efxaadxcuniqdzruxhro.supabase.co';
  const publishableKey = 'sb_publishable_o3QFaLRqfWaFYDAxmPfVQA_SLPTgXpJ';

  window.supabaseClient = null;

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.warn('Supabase SDK를 불러오지 못했습니다. 기존 로컬 기능은 계속 사용할 수 있습니다.');
    return;
  }

  try {
    window.supabaseClient = window.supabase.createClient(projectUrl, publishableKey, {
      // 로그인 도입 전에는 세션 저장, 토큰 갱신, 인증 콜백 처리를 비활성화합니다.
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  } catch (error) {
    console.warn('Supabase 클라이언트를 초기화하지 못했습니다.', error);
  }
})();
