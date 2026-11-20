const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function objectArt(module){
  const forms=[
    '<path d="M82 154V76l71-38 71 38v78l-71 39z M82 76l71 39 71-39 M153 115v78"/>',
    '<path d="M72 177h171V69H72zM72 69l38-31h171l-38 31M243 69l38-31v108l-38 31M100 109h110v37H100z"/>',
    '<path d="M95 185V60q0-18 59-18t59 18v125q0 20-59 20t-59-20zM95 60q0 18 59 18t59-18M95 183q0-18 59-18t59 18"/>',
    '<path d="M65 178V75l96-46 96 46v103l-96 44zM65 75l96 45 96-45M161 120v102M112 95v-32l49-23 49 23v32"/>',
    '<path d="M75 191l28-125 51-28 56 28 27 125zM103 66l51 30 56-30M154 96v95M75 191h162"/>',
    '<path d="M59 192V75l48-39h96l48 39v117zM59 75h192M107 36v156M203 36v156M107 118h96"/>',
    '<path d="M55 183l34-115 70-37 79 37 32 115-111 38zM89 68l70 35 79-35M159 103v118M55 183l104-80 111 80"/>'
  ];
  return `<svg class="hero-art" viewBox="0 0 320 240" role="img" aria-label="Схематичная объёмная форма модуля ${module}"><path d="M158 202L287 202M158 202L39 202M158 202V18" stroke="#686c68" stroke-width="1.5" fill="none"/><g fill="#292e2e" stroke="#cbb798" stroke-width="2" stroke-linejoin="round">${forms[module-1]}</g><circle cx="158" cy="202" r="4" fill="#d3bd9c"/></svg>`;
}
export function homeView({n,w,m,d,status,complete,checks}){
  const due=d.planned?`Плановый срок ${escape(d.planned)}${d.final?' · окончательный '+escape(d.final):''}`:'Дата старта не назначена';
  return `<div class="home-head"><div class="eyebrow">Персональная академия / учебный маршрут</div><p>Практика формы, визуализации и предметного дизайна.</p></div>
  <section class="hero"><div class="hero-copy"><div class="eyebrow">Модуль ${String(m.number).padStart(2,'0')} / 07 · Неделя ${String(n).padStart(2,'0')} / 28</div><h1>${escape(m.name)}</h1><p>${escape(m.goal)}</p></div>${objectArt(m.number)}</section>
  <section class="current-task" aria-label="Текущее задание"><div class="task-top"><span class="eyebrow">Сейчас в работе / неделя ${n}</span><span class="tag">${escape(status)}</span></div><h2>${n===1?'Знакомство с Blender и трёхмерным пространством':escape(w.topic)}</h2><p>${escape(w.practice)}</p><div class="task-footer"><a class="btn" href="#/week/${n}">Открыть занятие</a><span>${due}</span></div></section>
  <div class="home-bottom"><section><h2>Твой путь</h2><p><strong>${complete}</strong> из 28 недель зачтено · <strong>${checks}</strong> контрольных работ.</p><a class="text-link" href="#/progress">Посмотреть прогресс</a></section><section><h2>Планирование</h2><p>${d.planned?'Ближайший плановый срок: '+escape(d.planned):'Выбери дату начала или установи сроки вручную.'}</p><a class="text-link" href="#/calendar">Открыть календарь</a></section></div>`;
}
