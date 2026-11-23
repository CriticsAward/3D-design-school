import {heroScenes} from './hero-scenes.js?v=1';

export function mountScene(host,sceneIndex,{transition=false}={}){
  const scene=heroScenes[sceneIndex],video=host?.querySelector('.hero-motion');
  let disposed=false;
  const release=()=>{
    if(disposed)return;
    disposed=true;
    video?.removeEventListener('playing',onPlaying);
    video?.removeEventListener('error',onError);
    video?.pause();
    if(video){video.removeAttribute('src');video.load()}
    host?.classList.remove('scene-live','scene-transition');
  };
  const onPlaying=()=>{if(!disposed)host.classList.add('scene-live')};
  const onError=()=>{host?.classList.remove('scene-live')};
  if(!host||!scene||!scene.video||!video||matchMedia('(max-width: 800px)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=2)||!video.canPlayType('video/mp4'))return release;

  video.addEventListener('playing',onPlaying);
  video.addEventListener('error',onError);
  if(transition)host.classList.add('scene-transition');
  video.src=scene.video;
  video.load();
  const playback=video.play();
  playback?.catch(()=>host.classList.remove('scene-live'));
  return release;
}
