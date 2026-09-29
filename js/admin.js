(() => {
  let coffees = CoffeeStore.load();
  let activeId = coffees[0].id;
  let draft;
  let dirty = false;
  let isNew = false;
  const form = document.querySelector('#coffee-form');
  const escape = Brew.escape;
  const clone = value => JSON.parse(JSON.stringify(value));
  function status(message, error = false) {
    const element = document.querySelector('#form-status');
    element.textContent = message;
    element.classList.toggle('error', error);
  }
  function input(label, name, value, type = 'text', extra = '') {
    return `<label>${label}<input name="${name}" value="${escape(value)}" type="${type}" ${extra} required></label>`;
  }
  function list() {
    document.querySelector('#admin-list').innerHTML = coffees.map(coffee => `<button type="button" data-id="${escape(coffee.id)}" aria-pressed="${coffee.id === activeId && !isNew}">${escape(coffee.name)}<small>${coffee.published ? '공개' : '비공개'}</small></button>`).join('');
    document.querySelectorAll('[data-id]').forEach(button => button.addEventListener('click', () => {
      if (!canLeave()) return;
      open(button.dataset.id);
    }));
  }
  function canLeave() { return !dirty || confirm('저장하지 않은 변경사항이 있습니다. 변경사항을 버리고 이동할까요?'); }
  function read() {
    const data = new FormData(form);
    draft.id = String(data.get('id')).trim(); draft.name = String(data.get('name')).trim();
    draft.image = String(data.get('image')).trim(); draft.published = data.get('published') === 'true';
    for (const mode of ['hot', 'ice']) {
      for (const field of ['dose', 'temperature', 'water']) draft[mode][field] = Number(data.get(`${mode}-${field}`));
      for (const field of ['c40', 'ek43']) draft[mode][field] = String(data.get(`${mode}-${field}`)).trim();
      draft[mode].steps = draft[mode].steps.map((step, index) => ({
        title: String(data.get(`${mode}-${index}-title`)).trim(),
        instruction: String(data.get(`${mode}-${index}-instruction`)).trim(),
        duration: Number(data.get(`${mode}-${index}-duration`)), water: Number(data.get(`${mode}-${index}-water`))
      }));
    }
  }
  function render() {
    list();
    document.querySelector('#editor').innerHTML = `<fieldset><legend>${isNew ? '새 원두' : '원두 정보'}</legend><div class="form-grid">
      ${input('원두명', 'name', draft.name)}
      ${input('고유 ID (링크에 사용)', 'id', draft.id, 'text', `pattern="[a-z0-9]+(-[a-z0-9]+)*" ${isNew ? '' : 'readonly'}`)}
      <label class="span-all">원두카드 이미지 경로<input name="image" value="${escape(draft.image)}" placeholder="images/coffee/placeholder.svg" required></label>
      <label>공개 여부<select name="published"><option value="true" ${draft.published ? 'selected' : ''}>공개</option><option value="false" ${!draft.published ? 'selected' : ''}>비공개</option></select></label>
      </div><p class="recipe-note">images/coffee/ 폴더에 넣은 파일의 경로를 입력하세요. 고유 ID는 저장 후 변경하지 않습니다.</p><img class="image-preview" data-coffee src="${escape(draft.image)}" alt="원두카드 미리보기"></fieldset>
      ${['hot', 'ice'].map(mode => `<fieldset><legend>${mode.toUpperCase()} 레시피</legend><div class="form-grid">
        ${input('원두량 (g)', `${mode}-dose`, draft[mode].dose, 'number', 'min="0.1" max="200" step="0.1"')}
        ${input('물 온도 (°C)', `${mode}-temperature`, draft[mode].temperature, 'number', 'min="0.1" max="100" step="0.1"')}
        ${input('총 물양 (g)', `${mode}-water`, draft[mode].water, 'number', 'min="0.1" max="5000" step="0.1"')}
        ${input('C40 분쇄도', `${mode}-c40`, draft[mode].c40)}
        ${input('EK43 분쇄도', `${mode}-ek43`, draft[mode].ek43)}
      </div><h3 style="margin-top:24px">타이머 단계</h3><p class="recipe-note">시간은 각 단계의 소요 시간, 물양은 처음부터 부은 누적 물양입니다.</p>
      ${draft[mode].steps.map((step, index) => `<div class="step-editor"><div class="section-heading"><h3>단계 ${index + 1}</h3><button type="button" class="small-button" data-remove="${mode}" data-index="${index}" aria-label="${mode.toUpperCase()} 단계 ${index + 1} 삭제" ${draft[mode].steps.length === 1 ? 'disabled' : ''}>삭제</button></div><div class="form-grid">
        ${input('단계 이름', `${mode}-${index}-title`, step.title)}
        ${input('소요 시간 (초)', `${mode}-${index}-duration`, step.duration, 'number', 'min="1" max="3600" step="1"')}
        ${input('누적 목표 물양 (g)', `${mode}-${index}-water`, step.water, 'number', 'min="0" max="5000" step="0.1"')}
        <label class="span-all">안내 문구<textarea name="${mode}-${index}-instruction" required>${escape(step.instruction)}</textarea></label>
      </div></div>`).join('')}<button type="button" class="small-button" data-add-step="${mode}">+ 단계 추가</button></fieldset>`).join('')}`;
    const preview = document.querySelector('#preview-link');
    const saved = coffees.find(coffee => coffee.id === activeId);
    preview.hidden = isNew || !saved?.published;
    preview.href = Brew.url('recipe', activeId);
    document.querySelectorAll('[data-add-step]').forEach(button => button.addEventListener('click', () => {
      read(); const mode = button.dataset.addStep;
      draft[mode].steps.push({ title: '새 단계', instruction: '', duration: 30, water: draft[mode].steps.at(-1).water });
      dirty = true; render();
    }));
    document.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
      read(); draft[button.dataset.remove].steps.splice(Number(button.dataset.index), 1); dirty = true; render();
    }));
    Brew.images();
  }
  function open(id) { activeId = id; draft = clone(coffees.find(coffee => coffee.id === id)); isNew = false; dirty = false; status(''); render(); }
  form.addEventListener('input', () => { dirty = true; status('변경사항을 저장해 주세요.'); });
  form.addEventListener('change', () => { dirty = true; });
  form.addEventListener('submit', event => {
    event.preventDefault(); read();
    const error = CoffeeStore.validate(draft);
    if (error) return status(error, true);
    if (isNew && coffees.some(coffee => coffee.id === draft.id)) return status('이미 사용 중인 고유 ID입니다. 다른 ID를 입력해 주세요.', true);
    // 다른 탭에서 저장한 원두를 불필요하게 덮어쓰지 않도록 최신 목록을 읽습니다.
    const latest = CoffeeStore.load();
    if (isNew && latest.some(coffee => coffee.id === draft.id)) return status('이미 사용 중인 고유 ID입니다.', true);
    const next = isNew ? [...latest, clone(draft)] : latest.map(coffee => coffee.id === activeId ? clone(draft) : coffee);
    try { CoffeeStore.save(next); } catch (error) { return status('브라우저가 저장을 허용하지 않거나 저장 공간이 부족합니다. 저장 설정을 확인해 주세요.', true); }
    coffees = next; open(draft.id); status('이 브라우저에 임시 저장했습니다.');
  });
  document.querySelector('#add-coffee').addEventListener('click', () => {
    if (!canLeave()) return;
    draft = clone(MOCK_COFFEES[0]); draft.id = ''; draft.name = ''; draft.image = 'images/coffee/placeholder.svg'; draft.published = false;
    isNew = true; dirty = true; activeId = ''; status('새 원두의 정보를 입력하고 저장해 주세요.'); render();
    form.elements.name.focus();
  });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  open(activeId);
})();
