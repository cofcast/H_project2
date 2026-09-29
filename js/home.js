const coffees = CoffeeStore.load().filter(coffee => coffee.published);
document.querySelector('#coffee-count').textContent = `${coffees.length}개의 원두`;
document.querySelector('#coffee-list').innerHTML = coffees.length ? coffees.map((coffee, index) => `
  <a class="coffee-card" href="${Brew.url('recipe', coffee.id)}">
    <img data-coffee src="${Brew.escape(coffee.image)}" alt="${Brew.escape(coffee.name)} 원두카드" width="640" height="440">
    <div class="card-caption"><div><span class="eyebrow">COFFEE ${String(index + 1).padStart(2, '0')}</span><h2>${Brew.escape(coffee.name)}</h2><span class="muted">HOT / ICE 레시피</span></div><span class="arrow" aria-hidden="true">↗</span></div>
  </a>`).join('') : '<p class="empty">아직 공개된 원두가 없습니다.</p>';
Brew.images();
