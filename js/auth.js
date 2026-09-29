(() => {
  const client = window.supabaseClient;
  const form = document.querySelector('#auth-form');
  const fields = document.querySelector('#auth-fields');
  const status = document.querySelector('#auth-status');
  const modeButtons = document.querySelectorAll('[data-auth-mode]');
  const header = document.querySelector('.site-header');
  const nav = document.createElement('nav');
  nav.className = 'auth-nav';
  nav.setAttribute('aria-label', '계정');
  nav.innerHTML = '<span class="auth-check" role="status">로그인 확인 중…</span><a class="button small-button" href="login.html" hidden>로그인 / 회원가입</a><span class="auth-email" hidden></span><button class="small-button" type="button" hidden>로그아웃</button><p class="auth-nav-status" role="status" aria-live="polite" hidden></p>';
  header.append(nav);
  const checking = nav.querySelector('.auth-check');
  const loginLink = nav.querySelector('a');
  const emailLabel = nav.querySelector('.auth-email');
  const logoutButton = nav.querySelector('button');
  const navStatus = nav.querySelector('.auth-nav-status');
  let mode = 'login';
  let busy = false;
  let ready = false;
  let revision = 0;
  let navigating = false;

  function message(text, isError = false) {
    const target = status || navStatus;
    target.textContent = text;
    target.classList.toggle('error', isError);
    target.hidden = !text;
  }

  function errorMessage(error) {
    const messages = {
      invalid_credentials: '이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.',
      email_not_confirmed: '이메일 인증이 필요합니다. 받은 메일의 확인 링크를 눌러 주세요.',
      user_already_exists: '이미 가입된 이메일입니다. 로그인해 주세요.',
      email_exists: '이미 가입된 이메일입니다. 로그인해 주세요.',
      weak_password: '비밀번호가 보안 조건에 맞지 않습니다. 더 길고 다양한 문자로 설정해 주세요.',
      email_address_invalid: '올바른 이메일 주소를 입력해 주세요.',
      email_address_not_authorized: '현재 이 이메일로 가입 메일을 보낼 수 없습니다. 운영자에게 문의해 주세요.',
      signup_disabled: '현재 회원가입이 잠시 중단되어 있습니다. 나중에 다시 시도해 주세요.',
      email_provider_disabled: '현재 이메일 로그인을 사용할 수 없습니다. 운영자에게 문의해 주세요.',
      over_email_send_rate_limit: '메일 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      over_request_rate_limit: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      otp_expired: '이메일 확인 링크가 만료되었거나 올바르지 않습니다. 다시 가입을 시도하거나 운영자에게 문의해 주세요.',
      session_not_found: '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.',
      refresh_token_not_found: '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.'
    };
    if (messages[error?.code]) return messages[error.code];
    if (error?.status === 429) return messages.over_request_rate_limit;
    if (error?.name === 'AuthRetryableFetchError' || /fetch|network|load failed/i.test(error?.message || '')) {
      return '서버에 연결하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.';
    }
    return '인증 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
  }

  function navigate(page) {
    if (navigating) return;
    navigating = true;
    window.location.replace(page);
  }

  function setBusy(value) {
    busy = value;
    if (fields) fields.disabled = value || !ready;
    modeButtons.forEach(button => { button.disabled = value; });
    if (form) form.setAttribute('aria-busy', String(value));
    logoutButton.disabled = value;
  }

  function renderSession(session) {
    const signedIn = Boolean(session?.user);
    checking.hidden = true;
    loginLink.hidden = signedIn;
    logoutButton.hidden = !signedIn;
    emailLabel.hidden = !signedIn;
    emailLabel.textContent = session?.user?.email || '';
    emailLabel.title = emailLabel.textContent;
    ready = true;
    if (fields) fields.disabled = busy;
    if (signedIn && form) navigate('index.html');
  }

  function selectMode(nextMode) {
    mode = nextMode;
    const signup = mode === 'signup';
    modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.authMode === mode)));
    document.querySelector('#auth-title').textContent = signup ? '회원가입' : '로그인';
    document.title = `${signup ? '회원가입' : '로그인'} · COFFEEFINDER`;
    document.querySelector('#auth-description').textContent = signup ? '이메일과 비밀번호로 계정을 만들어 주세요.' : '이메일과 비밀번호로 로그인하세요.';
    document.querySelector('#auth-submit').textContent = signup ? '회원가입' : '로그인';
    const password = form.elements.password;
    password.value = '';
    password.autocomplete = signup ? 'new-password' : 'current-password';
    document.querySelector('#password-help').textContent = signup ? '비밀번호는 6자 이상 입력하세요.' : '가입할 때 사용한 비밀번호를 입력하세요.';
    message(client ? '' : '로그인 서비스를 불러오지 못했습니다. 인터넷 연결을 확인하고 새로고침해 주세요.', !client);
  }

  modeButtons.forEach(button => button.addEventListener('click', () => {
    if (!busy) selectMode(button.dataset.authMode);
  }));

  if (!client) {
    checking.hidden = true;
    loginLink.hidden = false;
    message('로그인 서비스를 불러오지 못했습니다. 인터넷 연결을 확인하고 새로고침해 주세요.', true);
    return;
  }

  // 이 콜백 안에서는 다른 Auth API를 호출하거나 await하지 않습니다.
  client.auth.onAuthStateChange((event, session) => {
    revision += 1;
    renderSession(session);
    if (event === 'SIGNED_OUT' && !form) navigate('login.html');
  });

  async function restoreSession() {
    const currentRevision = revision;
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      // 조회 중 더 최신 인증 이벤트가 도착했으면 이전 결과로 덮어쓰지 않습니다.
      if (revision === currentRevision) renderSession(data.session);
      if (status && status.textContent === '로그인 상태를 확인하고 있습니다.') message('');
    } catch (error) {
      if (revision === currentRevision) renderSession(null);
      message(errorMessage(error), true);
    }
  }

  logoutButton.addEventListener('click', async () => {
    if (busy) return;
    setBusy(true);
    message('로그아웃 중입니다.');
    try {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
      navigate('login.html');
    } catch (error) {
      message(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  });

  if (form) form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !ready) return;
    const email = form.elements.email;
    const password = form.elements.password;
    email.value = email.value.trim();
    if (!email.value || !email.validity.valid) {
      message('올바른 이메일 주소를 입력해 주세요.', true);
      email.focus();
      return;
    }
    if (!password.value || (mode === 'signup' && password.value.length < 6)) {
      message(mode === 'signup' ? '비밀번호는 6자 이상 입력해 주세요.' : '비밀번호를 입력해 주세요.', true);
      password.focus();
      return;
    }
    setBusy(true);
    message(mode === 'signup' ? '회원가입을 요청하고 있습니다.' : '로그인 중입니다.');
    try {
      const credentials = { email: email.value, password: password.value };
      const result = mode === 'signup'
        ? await client.auth.signUp({ ...credentials, options: { emailRedirectTo: new URL('login.html', window.location.href).href } })
        : await client.auth.signInWithPassword(credentials);
      if (result.error) throw result.error;
      password.value = '';
      if (result.data.session) {
        renderSession(result.data.session);
      } else if (mode === 'signup') {
        selectMode('login');
        message('가입 확인 메일을 확인해 주세요. 이메일 인증 후 로그인할 수 있습니다. 이미 가입한 이메일이라면 기존 비밀번호로 로그인해 주세요.');
      } else {
        message('로그인 세션을 확인하지 못했습니다. 다시 로그인해 주세요.', true);
      }
    } catch (error) {
      message(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  });

  // 만료된 이메일 확인 링크의 오류도 사용자에게 안내합니다.
  const callbackParams = new URLSearchParams(window.location.hash.slice(1));
  const queryParams = new URLSearchParams(window.location.search);
  const callbackError = callbackParams.get('error_code') || queryParams.get('error_code');
  if (callbackError || callbackParams.has('error') || queryParams.has('error')) {
    message(errorMessage({ code: callbackError }), true);
    window.history.replaceState(null, '', window.location.pathname);
  }
  restoreSession();
  // 브라우저의 뒤로 가기 캐시에서 돌아왔을 때에도 최신 세션을 반영합니다.
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      navigating = false;
      restoreSession();
    }
  });
})();
