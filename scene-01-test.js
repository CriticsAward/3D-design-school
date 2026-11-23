const stage=document.querySelector('.stage');
const toggle=document.querySelector('.motion-toggle');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function setMotion(on){
  const enabled=Boolean(on&&!reduceMotion.matches);
  stage.dataset.motion=enabled?'on':'off';
  toggle.setAttribute('aria-pressed',String(enabled));
  toggle.textContent=enabled?'Движение: включено':'Кадр: статичный';
  toggle.disabled=reduceMotion.matches;
}
setMotion(true);
toggle.addEventListener('click',()=>setMotion(stage.dataset.motion!=='on'));
reduceMotion.addEventListener?.('change',()=>setMotion(stage.dataset.motion==='on'));
