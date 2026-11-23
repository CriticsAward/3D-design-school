export function homeView({avatarMarkup,lessonMarkup='',heroScene}){
  const reactions=[['Алина','🙂','reaction-one'],['Макс','🔥','reaction-two'],['Катя','Ого','reaction-three'],['Игорь','👏','reaction-four'],['Марина','✨','reaction-five'],['Денис','Да!','reaction-six'],['Лера','💡','reaction-seven'],['Алина','Класс','reaction-eight'],['Катя','💚','reaction-nine'],['Макс','👍','reaction-ten'],['Игорь','Точно','reaction-eleven'],['Лера','🔥','reaction-twelve'],['Марина','Ого','reaction-thirteen'],['Денис','👏','reaction-fourteen']];
  return `<div class="home-page">
    <section class="hero" aria-label="Добро пожаловать в FORMA / LAB">
      <div class="hero-media" data-scene>
        <img class="hero-art" src="${heroScene.poster}" width="1280" height="800" alt="${heroScene.alt}" fetchpriority="high">
        <video class="hero-motion" muted playsinline loop preload="none" poster="${heroScene.poster}" aria-hidden="true"></video>
      </div>
      <div class="hero-shade" aria-hidden="true"></div>
      <div class="hero-copy">
        <h1>Учись видеть<br>форму.</h1>
        <p>Blender, предметный дизайн и практика с первого дня.</p>
        ${lessonMarkup}
        <a class="btn home-continue" href="#/study">Перейти к обучению <span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></span></a>
      </div>
      <div class="peer-reactions" aria-hidden="true">${reactions.map(([name,reaction,klass])=>`<span class="peer-reaction ${klass}">${avatarMarkup(name)}<span class="peer-bubble">${reaction}</span></span>`).join('')}</div>
    </section>
  </div>`;
}
