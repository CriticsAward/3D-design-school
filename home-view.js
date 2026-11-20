const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function objectArt(module){
  const art=[
    ['01-foundations','Куб, сфера и цилиндр с разными материалами'],
    ['02-light-form','Предметный рендер настольной лампы'],
    ['03-advertising','Рекламный рендер бутылки'],
    ['04-product','Концепт портативной акустической системы'],
    ['05-campaign','Рекламная визуализация флакона и упаковки'],
    ['06-industrial','Промышленный концепт электроинструмента'],
    ['07-final','Концепт городского трамвая']
  ];
  const [file,description]=art[module-1];
  return `<img class="hero-art" src="./assets/modules/${file}.webp" width="800" height="800" alt="${description}" decoding="async" fetchpriority="high">`;
}
export function homeView({n,w,m,d,status,complete,checks}){
  const due=d.planned?`Плановый срок ${escape(d.planned)}${d.final?' · окончательный '+escape(d.final):''}`:'Дата старта не назначена';
  return `<div class="home-head"><div class="eyebrow">FORMA / LAB · ЛИЧНАЯ АКАДЕМИЯ</div><p>Пространство, предмет и визуализация. Учёба через практику.</p></div>
  <section class="hero" aria-label="Текущий модуль">
    <div class="hero-copy">
      <div class="hero-meta"><span class="eyebrow">МОДУЛЬ ${String(m.number).padStart(2,'0')} / 07</span><span class="eyebrow">НЕДЕЛЯ ${String(n).padStart(2,'0')} / 28</span></div>
      <h1>${escape(m.name)}</h1>
      <div class="hero-tail"><p>${escape(m.goal)}</p><span class="hero-index">${String(m.number).padStart(2,'0')} <small>/ 07</small></span></div>
    </div>
    <div class="hero-media"><span class="eyebrow">ОБЪЕКТ ИССЛЕДОВАНИЯ / ${String(m.number).padStart(2,'0')}</span>${objectArt(m.number)}<div class="hero-media-foot"><span>FORMA / LAB</span><span>3D · DESIGN STUDIES</span></div></div>
  </section>
  <section class="current-task" aria-label="Текущее занятие">
    <div class="task-top"><span class="eyebrow">СЛЕДУЮЩЕЕ ЗАНЯТИЕ / ${String(n).padStart(2,'0')}</span><span class="tag">${escape(status)}</span></div>
    <div class="task-body">
      <div><h2>${n===1?'Знакомство с Blender и трёхмерным пространством':escape(w.topic)}</h2><p>${escape(w.practice)}</p></div>
      <div class="task-cta"><a class="btn" href="#/week/${n}">Открыть занятие <span aria-hidden="true">↗</span></a><span>${due}</span></div>
    </div>
  </section>
  <div class="home-bottom">
    <section><h2>УЧЕБНЫЙ МАРШРУТ / 01</h2><p><strong>${complete}</strong> из 28 недель зачтено · <strong>${checks}</strong> контрольных работ.</p><a class="text-link" href="#/progress">Посмотреть прогресс ↗</a></section>
    <section><h2>ПЛАНИРОВАНИЕ / 02</h2><p>${d.planned?'Ближайший плановый срок: '+escape(d.planned):'Дата начала не выбрана. Сроки можно установить вручную.'}</p><a class="text-link" href="#/calendar">Открыть календарь ↗</a></section>
  </div>`;
}
