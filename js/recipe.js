(() => {
  const coffee = CoffeeStore.find(Brew.params.get('coffee'));
  if (!coffee) return Brew.missing();
  let mode = Brew.params.get('mode') === 'ice' ? 'ice' : 'hot';
  document.title = `${coffee.name} 레시피 · COFFEEFINDER`;
  document.querySelector('#recipe-content').innerHTML = `
    <div class="recipe-layout"><section>
      <img class="bean-image" data-coffee src="${Brew.escape(coffee.image)}" alt="${Brew.escape(coffee.name)} 원두카드" width="640" height="440">
      <h1 class="recipe-title">${Brew.escape(coffee.name)}</h1>
    </section><section aria-label="추출 레시피">
      <div class="tabs" role="group" aria-label="추출 방식"><button type="button" data-mode="hot" aria-pressed="false">HOT</button><button type="button" data-mode="ice" aria-pressed="false">ICE</button></div>
      <div id="recipe-values" aria-live="polite"></div>
      <details><summary>분쇄도 더 보기</summary><dl class="grind"><div><dt>C40</dt><dd id="c40"></dd></div><div><dt>EK43</dt><dd id="ek43"></dd></div></dl></details>
      <a id="start-brew" class="button primary full">추출 시작 <span aria-hidden="true">→</span></a>
      <p class="helper">누르면 타이머가 바로 시작됩니다.</p>
    </section></div>`;
  function render() {
    const recipe = coffee[mode];
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    document.querySelector('#recipe-values').innerHTML = `<dl class="metrics"><div><dt>원두량</dt><dd>${recipe.dose}<small> g</small></dd></div><div><dt>물 온도</dt><dd>${recipe.temperature}<small> °C</small></dd></div><div><dt>총 물양</dt><dd>${recipe.water}<small> g</small></dd></div></dl><p class="recipe-note">${mode === 'ice' ? '총 물양은 추출에 사용하는 물 기준이며, 얼음은 별도로 준비해 주세요.' : '원두와 물, 추출 도구를 준비한 후 시작해 주세요.'}</p>`;
    document.querySelector('#c40').textContent = recipe.c40;
    document.querySelector('#ek43').textContent = recipe.ek43;
    document.querySelector('#start-brew').href = Brew.url('timer', coffee.id, mode) + '&start=1';
  }
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.mode;
    render();
  }));
  render();
  Brew.images();
})();
