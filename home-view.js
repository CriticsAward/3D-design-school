export function homeView({avatarMarkup,lessonMarkup='',heroScene,sceneTest=false}){
  const reactions=[['Алина','🙂','reaction-one'],['Макс','🔥','reaction-two'],['Катя','Ого','reaction-three'],['Игорь','👏','reaction-four'],['Марина','✨','reaction-five'],['Денис','Да!','reaction-six'],['Лера','💡','reaction-seven'],['Алина','Класс','reaction-eight'],['Катя','💚','reaction-nine'],['Макс','👍','reaction-ten'],['Игорь','Точно','reaction-eleven'],['Лера','🔥','reaction-twelve'],['Марина','Ого','reaction-thirteen'],['Денис','👏','reaction-fourteen']];
  return `<div class="home-page">
    <section class="hero" aria-label="Добро пожаловать в FORMA / LAB">
      <div class="hero-media" data-scene>
        <picture class="hero-picture">${heroScene.mobilePoster?`<source media="(max-width: 800px)" srcset="${heroScene.mobilePoster}">`:''}<img class="hero-art" src="${heroScene.poster}" width="1280" height="800" alt="${heroScene.alt}" fetchpriority="high"></picture>
        <video class="hero-motion" muted playsinline loop preload="none" poster="${heroScene.poster}" aria-hidden="true"></video>
      </div>
      <div class="hero-shade" aria-hidden="true"></div>
      ${sceneTest?`<div class="scene-test" role="group" aria-label="Тест изображений главной"><button class="scene-test-toggle" type="button" aria-label="Открыть тест изображений" title="Тест изображений"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM4 15l4-4 3 3 3-4 6 6M8 8h.01"/></svg></button><div class="scene-test-panel" hidden><span class="scene-test-label">Кадр главной</span><select class="scene-test-select" aria-label="Выбрать сцену">${Array.from({length:7},(_,i)=>`<option value="${i+1}" ${i+1===sceneTest?'selected':''}>${String(i+1).padStart(2,'0')} · ${['Куб и сфера','Светильник','Флакон','Колонка','Часы','Проектор','Наушники'][i]}</option>`).join('')}</select></div></div>`:''}
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
