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
export function homeView({n,w,m,status,avatarMarkup}){
  const first=n===1;
  const lessonTitle=first?'Знакомство с Blender и трёхмерным пространством':w.topic;
  const reactions=[['Алина','🙂','reaction-one'],['Макс','🔥','reaction-two'],['Катя','👀','reaction-three'],['Игорь','++','reaction-four']];
  return `<div class="home-head"><div class="eyebrow">FORMA / LAB · ЛИЧНАЯ АКАДЕМИЯ</div><p>Спокойный старт. Один шаг за раз.</p></div>
  <section class="hero" aria-label="Текущее занятие">
    <div class="hero-copy">
      <div class="hero-meta"><span class="eyebrow">${first?'ПЕРВОЕ ЗАНЯТИЕ':'ТЕКУЩЕЕ ЗАНЯТИЕ'} · ${String(n).padStart(2,'0')} / 28</span><span class="eyebrow">МОДУЛЬ ${String(m.number).padStart(2,'0')} / 07</span></div>
      <div class="home-welcome"><h1>${first?'Сначала научись смотреть':escape(m.name)}</h1><p>${first?'Ты на первом занятии. Начнём с простого и разберёмся вместе — у тебя всё получится.':escape(m.goal)}</p></div>
      <div class="home-lesson"><div><span class="eyebrow">СЕЙЧАС</span><h2>${escape(lessonTitle)}</h2></div><span class="tag">${escape(status)}</span></div>
      <a class="btn home-continue" href="#/week/${n}">Продолжить обучение <span aria-hidden="true">↗</span></a>
      <div class="home-encouragement"><span>ТВОЙ ТЕМП — НОРМАЛЬНЫЙ</span><span>У тебя всё получится.</span></div>
    </div>
    <div class="hero-media"><span class="eyebrow">ОБЪЕКТ ИССЛЕДОВАНИЯ / ${String(m.number).padStart(2,'0')}</span>${objectArt(m.number)}<div class="hero-media-foot"><span>FORMA / LAB</span><span>3D · DESIGN STUDIES</span></div>
      <div class="peer-reactions" aria-label="Примеры реакций группы">${reactions.map(([name,reaction,klass])=>`<span class="peer-reaction ${klass}" aria-hidden="true">${avatarMarkup(name)}<span class="peer-bubble">${reaction}</span></span>`).join('')}</div>
    </div>
  </section>`;
}
