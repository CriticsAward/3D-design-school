export function homeView({avatarMarkup}){
  const reactions=[['Алина','🙂','reaction-one'],['Макс','🔥','reaction-two'],['Катя','Ого','reaction-three'],['Игорь','👏','reaction-four']];
  return `<div class="home-page">
    <section class="hero" aria-label="Добро пожаловать в FORMA / LAB">
      <div class="hero-media" data-scene>
        <img class="hero-art" src="./assets/hero-first-lesson.webp" width="1586" height="992" alt="Предметная композиция из куба, металлического шара и стеклянного цилиндра" fetchpriority="high">
      </div>
      <div class="hero-shade" aria-hidden="true"></div>
      <div class="hero-copy">
        <h1>Учись видеть<br>форму.</h1>
        <p>Blender, предметный дизайн и практика с первого дня.</p>
        <a class="btn home-continue" href="#/study">Перейти к обучению <span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></span></a>
      </div>
      <div class="peer-reactions" aria-hidden="true">${reactions.map(([name,reaction,klass])=>`<span class="peer-reaction ${klass}">${avatarMarkup(name)}<span class="peer-bubble">${reaction}</span></span>`).join('')}</div>
    </section>
  </div>`;
}
