(() => {
  const coffee = CoffeeStore.find(Brew.params.get('coffee'));
  if (!coffee) return Brew.missing();
  const mode = Brew.params.get('mode') === 'ice' ? 'ice' : 'hot';
  const recipe = coffee[mode];
  const total = recipe.steps.reduce((sum, step) => sum + step.duration, 0);
  const autoStart = Brew.params.get('start') === '1';
  let elapsed = 0;
  let startedAt = 0;
  let running = false;
  let started = false;
  let lastStep = -1;
  let audioContext;
  let soundReady = false;
  let interval;
  document.title = `${coffee.name} 추출 타이머 · COFFEEFINDER`;
  let boundary = 0;
  document.querySelector('#timer-content').innerHTML = `
    <a class="back" href="${Brew.url('recipe', coffee.id, mode)}">← 레시피로 돌아가기</a>
    <div class="timer-heading"><h1>${Brew.escape(coffee.name)}</h1><span class="badge">${mode.toUpperCase()} · ${recipe.dose}g</span></div>
    <section class="timer-panel" aria-label="추출 타이머">
      <p class="eyebrow" id="timer-status">추출 준비</p><div class="clock" id="elapsed" role="timer" aria-label="현재 경과 시간">00:00</div>
      <p class="helper">전체 ${Brew.time(total)}</p><progress id="progress" max="${total}" value="0" aria-label="전체 추출 진행률"></progress>
      <div aria-live="polite" aria-atomic="true"><p class="eyebrow" id="step-label"></p><h2 id="step-title"></h2><p id="instruction" class="muted"></p></div>
      <p class="target" id="target"></p><p class="remaining" id="remaining"></p>
    </section>
    <div class="controls"><button id="pause" class="primary" type="button">추출 시작</button><button id="restart" type="button">처음부터 다시 시작</button></div>
    <a id="done-link" class="button full" style="margin-top:12px" href="${Brew.url('recipe', coffee.id, mode)}" hidden>레시피로 돌아가기</a>
    <div id="sound-note" class="sound-note" hidden><span id="sound-message">단계 알림음을 사용하려면 아래 버튼을 눌러 주세요. 브라우저에서 자동 재생을 제한할 수 있습니다.</span><br><button id="enable-sound" type="button">알림음 켜기</button></div>
    <ol class="step-list" aria-label="전체 추출 단계">${recipe.steps.map((step, index) => {
      const begin = boundary; boundary += step.duration;
      return `<li data-step="${index}"><span class="step-number">${index + 1}</span><span>${Brew.escape(step.title)}<br><span class="muted">누적 ${step.water}g</span></span><span class="step-time">${Brew.time(begin)}–${Brew.time(boundary)}</span></li>`;
    }).join('')}</ol>`;

  function prepareSound() {
    if (!started) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('unsupported');
      if (!audioContext) audioContext = new Audio();
      const updateSound = () => {
        soundReady = audioContext.state === 'running';
        document.querySelector('#sound-note').hidden = soundReady;
      };
      audioContext.onstatechange = updateSound;
      updateSound();
      audioContext.resume().then(updateSound).catch(() => { document.querySelector('#sound-note').hidden = false; });
    } catch (error) {
      document.querySelector('#sound-note').hidden = false;
      document.querySelector('#sound-message').textContent = '이 브라우저는 알림음을 지원하지 않습니다. 화면의 단계 안내를 확인해 주세요.';
      document.querySelector('#enable-sound').hidden = true;
    }
  }
  // 외부 파일/API 없이 짧은 알림음을 생성합니다. 사용자 추출 시작 후에만 재생합니다.
  function beep() {
    if (!started || !soundReady || audioContext.state !== 'running') return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);
    oscillator.start(); oscillator.stop(audioContext.currentTime + 0.2);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  // 반복 횟수 대신 실제 시각 차이로 계산해 백그라운드 복귀 시에도 시간을 반영합니다.
  function currentElapsed() { return Math.min(total, elapsed + (running ? (performance.now() - startedAt) / 1000 : 0)); }
  function render() {
    const seconds = currentElapsed();
    const finished = seconds >= total;
    let end = 0;
    let index = recipe.steps.findIndex(step => { end += step.duration; return seconds < end; });
    if (finished) index = recipe.steps.length;
    if (index !== lastStep) {
      if (lastStep !== -1) beep();
      lastStep = index;
      document.querySelector('#step-label').textContent = finished ? 'BREW COMPLETE' : `STEP ${String(index + 1).padStart(2, '0')} / ${String(recipe.steps.length).padStart(2, '0')}`;
      document.querySelector('#step-title').textContent = finished ? '추출이 완료되었어요' : recipe.steps[index].title;
      document.querySelector('#instruction').textContent = finished ? '완성된 커피를 즐겨보세요.' : recipe.steps[index].instruction;
      document.querySelector('#target').innerHTML = finished ? `${recipe.water}<small> g · 총 물양</small>` : `${recipe.steps[index].water}<small> g · 누적 목표 물양</small>`;
      document.querySelectorAll('[data-step]').forEach((item, itemIndex) => {
        item.classList.toggle('current', itemIndex === index);
        if (itemIndex === index) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
        item.querySelector('.step-number').textContent = itemIndex < index ? '✓' : itemIndex + 1;
      });
    }
    if (finished) { running = false; elapsed = total; clearInterval(interval); }
    document.querySelector('#elapsed').textContent = Brew.time(seconds);
    document.querySelector('#progress').value = seconds;
    document.querySelector('#timer-status').textContent = finished ? '추출 완료' : running ? '추출 중' : started ? '일시정지' : '추출 준비';
    document.querySelector('#remaining').textContent = finished ? '모든 단계가 끝났습니다.' : `${index === recipe.steps.length - 1 ? '추출 완료' : '다음 단계'}까지 ${Brew.time(Math.ceil(end - seconds))}`;
    const pause = document.querySelector('#pause');
    pause.disabled = finished;
    pause.textContent = finished ? '추출 완료' : running ? '일시정지' : started ? '재개' : '추출 시작';
    document.querySelector('#done-link').hidden = !finished;
  }
  function start() {
    started = true; running = true; startedAt = performance.now();
    prepareSound();
    clearInterval(interval); interval = setInterval(render, 100); render();
  }
  document.querySelector('#pause').addEventListener('click', () => {
    if (running) { elapsed = currentElapsed(); running = false; clearInterval(interval); render(); }
    else start();
  });
  document.querySelector('#restart').addEventListener('click', () => {
    elapsed = 0; lastStep = -1; start();
  });
  document.querySelector('#enable-sound').addEventListener('click', prepareSound);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  window.addEventListener('pagehide', () => { clearInterval(interval); if (audioContext) audioContext.close().catch(() => {}); });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  render();
  if (autoStart) start();
})();
