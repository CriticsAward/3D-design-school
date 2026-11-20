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
  return `<div class="home-head"><div class="eyebrow">Персональная академия / учебный маршрут</div><p>Практика формы, визуализации и предметного дизайна.</p></div>
  <section class="hero"><div class="hero-copy"><div class="eyebrow">Модуль ${String(m.number).padStart(2,'0')} / 07 · Неделя ${String(n).padStart(2,'0')} / 28</div><h1>${escape(m.name)}</h1><p>${escape(m.goal)}</p></div>${objectArt(m.number)}</section>
  <section class="current-task" aria-label="Текущее задание"><div class="task-top"><span class="eyebrow">Сейчас в работе / неделя ${n}</span><span class="tag">${escape(status)}</span></div><h2>${n===1?'Знакомство с Blender и трёхмерным пространством':escape(w.topic)}</h2><p>${escape(w.practice)}</p><div class="task-footer"><a class="btn" href="#/week/${n}">Открыть занятие</a><span>${due}</span></div></section>
  <div class="home-bottom"><section><h2>Твой путь</h2><p><strong>${complete}</strong> из 28 недель зачтено · <strong>${checks}</strong> контрольных работ.</p><a class="text-link" href="#/progress">Посмотреть прогресс</a></section><section><h2>Планирование</h2><p>${d.planned?'Ближайший плановый срок: '+escape(d.planned):'Выбери дату начала или установи сроки вручную.'}</p><a class="text-link" href="#/calendar">Открыть календарь</a></section></div>`;
}
