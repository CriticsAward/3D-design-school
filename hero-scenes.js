import {projectComplete} from './state.js?v=4';

export const heroScenes=Object.freeze({
  1:Object.freeze({poster:'./assets/hero-scenes/01.webp',video:'./assets/hero-scenes/01.mp4',alt:'Куб с мягкими фасками, металлическая сфера и стеклянный цилиндр на студийной платформе'}),
  2:Object.freeze({poster:'./assets/hero-scenes/02.webp',video:'./assets/hero-scenes/02.mp4',alt:'Настольный светильник с керамическим основанием, металлической дугой и отражателем'}),
  3:Object.freeze({poster:'./assets/hero-scenes/03.webp',video:'./assets/hero-scenes/03.mp4',alt:'Флакон с тёмно-зелёным стеклом, латунной крышкой и фирменной этикеткой'}),
  4:Object.freeze({poster:'./assets/hero-scenes/04.webp',video:'./assets/hero-scenes/04.mp4',alt:'Портативная акустическая колонка с тканевой решёткой, ручкой и металлическим регулятором'}),
  5:Object.freeze({poster:'./assets/hero-scenes/05.webp',video:'./assets/hero-scenes/05.mp4',alt:'Наручные часы с эмалевым безелем, циферблатом, кожаным ремешком и точной фурнитурой'}),
  6:Object.freeze({poster:'./assets/hero-scenes/06.webp',video:'./assets/hero-scenes/06.mp4',alt:'Компактный проектор с оптическим объективом, охлаждающими рёбрами и регулируемой опорой'}),
  7:Object.freeze({poster:'./assets/hero-scenes/07.webp',video:'./assets/hero-scenes/07.mp4',alt:'Полноразмерные наушники с формованным оголовьем, металлическими чашками и мягкими амбушюрами'})
});

export function getHeroSceneIndex(statuses={}){
  let scene=1;
  while(scene<7&&projectComplete(scene,statuses))scene++;
  return scene;
}
