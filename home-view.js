const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function homeView({n,w,m,status,avatarMarkup}){
  const first=n===1;
  const lessonTitle=first?'Знакомство с Blender и трёхмерным пространством':w.topic;
  const reactions=[['Алина','🙂','reaction-one'],['Макс','🔥','reaction-two'],['Катя','Ого','reaction-three'],['Игорь','++','reaction-four']];
  return `<div class="home-page">
    <section class="hero" aria-label="Текущее занятие">
      <img class="hero-art" src="./assets/hero-first-lesson.webp" width="1586" height="992" alt="Куб, металлическая сфера и стеклянный цилиндр в тёмной предметной студии" fetchpriority="high">
      <div class="hero-shade" aria-hidden="true"></div>
      <div class="hero-copy">
        <div class="hero-meta"><span class="hero-kicker">ЛИЧНАЯ АКАДЕМИЯ · ЗАНЯТИЕ ${String(n).padStart(2,'0')} / 28</span><span class="hero-kicker">МОДУЛЬ ${String(m.number).padStart(2,'0')}</span></div>
        <div class="home-welcome"><div class="hero-brand">FORMA <span>/ LAB</span></div><h1>${first?'Давай начнём<br>с простого.':escape(m.name)}</h1><p>${first?'Ты на первом занятии. Сегодня просто познакомимся с Blender и сделаем первый шаг — спокойно, в своём темпе.':escape(m.goal)}</p></div>
        <div class="hero-lesson"><span>${escape(lessonTitle)}</span><span class="hero-status">${escape(status)}</span></div>
        <a class="btn home-continue" href="#/week/${n}">Продолжить обучение <span aria-hidden="true">↗</span></a>
        <div class="home-encouragement"><span>Ты на ${first?'первом':'текущем'} занятии</span><span>У тебя всё получится.</span></div>
      </div>
      <div class="hero-caption"><span>ОСНОВЫ ФОРМЫ</span><span>01 / НАБЛЮДАТЬ · 02 / ПРОБОВАТЬ</span></div>
      <div class="peer-reactions" aria-hidden="true">${reactions.map(([name,reaction,klass])=>`<span class="peer-reaction ${klass}">${avatarMarkup(name)}<span class="peer-bubble">${reaction}</span></span>`).join('')}</div>
    </section>
  </div>`;
}
