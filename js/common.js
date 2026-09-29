// 데이터 접근은 이 객체에서만 처리합니다. 향후 DB 연결 시 이 부분을 교체하세요.
const CoffeeStore = {
  key: 'coffeefinder-coffees-v1',
  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key));
      if (Array.isArray(saved) && saved.length && saved.every(coffee => !this.validate(coffee)) &&
          new Set(saved.map(coffee => coffee.id)).size === saved.length) return saved;
    } catch (error) { /* 저장이 차단되거나 잘못된 데이터이면 Mock Data를 표시합니다. */ }
    return JSON.parse(JSON.stringify(MOCK_COFFEES));
  },
  save(coffees) {
    // MVP용 임시 저장: 이 브라우저에만 저장되며 다른 기기와 동기화되지 않습니다.
    localStorage.setItem(this.key, JSON.stringify(coffees));
  },
  find(id) { return this.load().find(coffee => coffee.id === id && coffee.published); },
  validate(coffee) {
    if (!coffee || typeof coffee.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(coffee.id)) return '고유 ID는 영문 소문자, 숫자, 하이픈으로 입력해 주세요.';
    if (typeof coffee.name !== 'string' || !coffee.name.trim()) return '원두명을 입력해 주세요.';
    if (typeof coffee.published !== 'boolean') return '공개 여부를 확인해 주세요.';
    if (typeof coffee.image !== 'string' || !/^images\/coffee\/[a-zA-Z0-9._/-]+\.(svg|png|jpe?g|webp)$/i.test(coffee.image) || coffee.image.includes('..')) return '이미지는 images/coffee/ 폴더 안의 파일 경로를 입력해 주세요.';
    for (const mode of ['hot', 'ice']) {
      const recipe = coffee[mode];
      const label = mode.toUpperCase();
      if (!recipe || !Number.isFinite(recipe.dose) || recipe.dose <= 0 || recipe.dose > 200 ||
          !Number.isFinite(recipe.temperature) || recipe.temperature <= 0 || recipe.temperature > 100 ||
          !Number.isFinite(recipe.water) || recipe.water <= 0 || recipe.water > 5000) return `${label}: 원두량(0 초과~200g), 온도(0 초과~100°C), 물양(0 초과~5000g)을 확인해 주세요.`;
      if (typeof recipe.c40 !== 'string' || !recipe.c40.trim() || typeof recipe.ek43 !== 'string' || !recipe.ek43.trim()) return `${label}: C40과 EK43 값을 입력해 주세요.`;
      if (!Array.isArray(recipe.steps) || !recipe.steps.length) return `${label}: 추출 단계를 하나 이상 등록해 주세요.`;
      let previousWater = 0;
      for (const step of recipe.steps) {
        if (!step || typeof step.title !== 'string' || !step.title.trim() || typeof step.instruction !== 'string' || !step.instruction.trim() ||
            !Number.isInteger(step.duration) || step.duration < 1 || step.duration > 3600 ||
            !Number.isFinite(step.water) || step.water < previousWater || step.water > recipe.water) return `${label}: 단계 이름·안내, 시간(1~3600초), 누적 물양(이전 단계 이상, 총 물양 이하)을 확인해 주세요.`;
        previousWater = step.water;
      }
      if (previousWater !== recipe.water) return `${label}: 마지막 단계의 누적 물양은 총 물양과 같아야 합니다.`;
    }
    return '';
  }
};

const Brew = {
  params: new URLSearchParams(location.search),
  escape(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); },
  time(seconds) { const value = Math.max(0, Math.floor(seconds)); return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; },
  url(page, id, mode) { return `${page}.html?coffee=${encodeURIComponent(id)}${mode ? `&mode=${mode}` : ''}`; },
  missing() {
    document.querySelector('main').innerHTML = '<section class="empty"><p class="eyebrow">BREW GUIDE</p><h1>원두를 찾을 수 없어요</h1><p>주소가 올바르지 않거나 비공개 상태인 원두입니다.</p><a class="button primary" href="index.html">원두 목록으로</a></section>';
  },
  images() {
    document.querySelectorAll('img[data-coffee]').forEach(img => {
      img.addEventListener('error', () => { img.src = 'images/coffee/placeholder.svg'; }, { once: true });
    });
  }
};
