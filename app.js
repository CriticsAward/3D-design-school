import modules from './curriculum.json' with {type:'json'};
import {availableMessages,avatarMarkup} from './chat.js?v=5';
import {statuses,initial,normalize,datesFor,localDate,localToday,projectSchedule,projectStatus,projectUnlocked,canStartEarly,projectDurationsDays} from './state.js?v=4';
import {lessonOne} from './lesson-one.js?v=2';
import {homeView} from './home-view.js?v=10';
import {mountScene} from './scene.js?v=4';
import {getHeroSceneIndex,heroScenes} from './hero-scenes.js?v=2';

const KEY='forma-lab-v1';
let state;
try{const saved=JSON.parse(localStorage.getItem(KEY));state=saved?normalize(saved):initial()}catch{state=initial()}
const app=document.querySelector('#app');
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{toast('Не удалось сохранить данные. Проверьте свободное место браузера.')}};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=s=>/^https?:\/\//i.test(String(s||''))?escape(s):'';
const week=n=>modules.flatMap(m=>m.weeks).find(w=>w.number===n);
const mod=n=>modules.find(m=>m.weeks.some(w=>w.number===n));
const route=()=>decodeURIComponent(location.hash.slice(1)||'/');
const status=n=>state.statuses[n]||statuses[0];
const date=n=>datesFor(state,n);
const complete=()=>Object.values(state.statuses).filter(x=>x==='Зачтено').length;
const moduleUnlocked=number=>projectUnlocked(number,state.training,state.statuses,localToday());
const weekUnlocked=n=>{const m=mod(n);return Boolean(m&&moduleUnlocked(m.number))};
const nearestAvailableWeek=target=>modules.filter(m=>moduleUnlocked(m.number)).flatMap(m=>m.weeks.map(w=>w.number)).reduce((best,n)=>Math.abs(n-target)<Math.abs(best-target)?n:best,1);
const nav=[['/','Главная','home'],['/study','Обучение','study'],['/works','Мои работы','works'],['/more','Ещё','more']];
const iconPaths={
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  study:'<path d="M12 7v14M3 18V4a1 1 0 0 1 1-1h5a3 3 0 0 1 3 3 3 3 0 0 1 3-3h5a1 1 0 0 1 1 1v14h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  works:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.4"/><path d="m3 17 5-5 4 4 3-3 6 5"/>',
  more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01"/>'
};
const navIcon=name=>'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+iconPaths[name]+'</svg>';
function toast(message){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.role='status';el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),3500)}
let stopScene=()=>{};
let lastHeroSceneIndex=0;
function layout(content){stopScene();stopScene=()=>{};const r=route();app.innerHTML=`<div class="shell"><main class="main"><header class="top"><a class="brand" href="#/" aria-label="FORMA / LAB — главная">FORMA <span>/ LAB</span></a><div class="top-actions"><a class="calendar-toggle" href="#/calendar" aria-label="Календарь" title="Календарь">${navIcon('calendar')}<span>Календарь</span></a><button class="chat-toggle" id="chat-toggle" aria-label="Открыть чат курса"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v12H10l-5 3v-3H4zM8 10h8M8 13.5h5"/></svg><span>Чат</span></button><a class="link settings-toggle" href="#/settings" aria-label="Настройки"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg><span>Настройки</span></a></div></header>${content}</main><nav class="nav" aria-label="Основная навигация">${nav.map(([url,label,icon])=>`<a href="#${url}" class="${(r===url||((r==='/program'||r.startsWith('/week/'))&&url==='/study'))?'active':''}" ${(r===url||((r==='/program'||r.startsWith('/week/'))&&url==='/study'))?'aria-current="page"':''}>${navIcon(icon)}<span>${label}</span></a>`).join('')}</nav><div id="chat-host"></div><div id="calendar-host"></div></div>`;document.querySelector('#chat-toggle').onclick=()=>openChat(false);document.querySelector('.calendar-toggle').onclick=e=>{e.preventDefault();openCalendarPopup()}}
function activeLesson(){
  for(let n=1;n<=28;n++)if(status(n)!=='Зачтено'&&weekUnlocked(n))return n;
  return 28;
}
function deadlineLabel(number){
  const project=projectSchedule(state.training)[mod(number).number-1],today=localToday();
  if(projectCompleteCompat(mod(number).number))return '';
  const delta=date=>Math.round((new Date(`${date}T12:00:00`)-new Date(`${today}T12:00:00`))/86400000);
  const days=delta(today<=project.soft?project.soft:project.hard);
  if(today<=project.soft)return days===0?'Мягкий дедлайн сегодня':`До мягкого дедлайна · ${days} ${pluralDays(days)}`;
  if(today<=project.hard)return days===0?'Жёсткий дедлайн сегодня':`До жёсткого дедлайна · ${days} ${pluralDays(days)}`;
  return `Срок превышен на ${Math.max(0,-delta(project.hard))} ${pluralDays(Math.max(0,-delta(project.hard)))}`;
}
function pluralDays(n){return n%10===1&&n%100!==11?'день':n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?'дня':'дней'}
function projectCompleteCompat(number){return [1,2,3,4].every((_,i)=>status((number-1)*4+i+1)==='Зачтено')}
function home(){const allDone=Boolean(state.training)&&Array.from({length:28},(_,i)=>status(i+1)==='Зачтено').every(Boolean),n=activeLesson(),w=week(n),m=mod(n),deadline=state.training&&!allDone?deadlineLabel(n):'',heroSceneIndex=getHeroSceneIndex(state.statuses);const lessonMarkup=state.training?`<div class="home-lesson"><span>${allDone?'Обучение завершено':`Занятие ${String(n).padStart(2,'0')} · ${escape(m.name)}`}</span>${allDone?'<b>Все семь модулей пройдены.</b>':`<b>${escape(w.topic)}</b>${deadline?`<small>${escape(deadline)}</small>`:''}`}</div>`:'';layout(homeView({avatarMarkup,lessonMarkup,heroScene:heroScenes[heroSceneIndex]}));stopScene=mountScene(document.querySelector('[data-scene]'),heroSceneIndex,{transition:lastHeroSceneIndex!==0&&lastHeroSceneIndex!==heroSceneIndex});lastHeroSceneIndex=heroSceneIndex;const c=document.querySelector('.home-continue');if(c){if(state.training){c.textContent=allDone?'Открыть программу':'Продолжить обучение';c.href=allDone?'#/study':`#/week/${n}`}else{c.textContent='Начать обучение';c.href='#/study';c.onclick=e=>{e.preventDefault();if(state.training)return;const today=localToday();state.training={version:1,startedAt:new Date().toISOString(),startDate:today,durationsDays:[...projectDurationsDays],earlyStarts:{}};state.start=today;state.current=1;save();home()}}}}
function study(notice='',target=state.current){
  if(!state.training){
    layout(`<div class="study-page"><section class="study-feature launch-feature"><div class="eyebrow">Твоя программа · 7 проектов</div><h1>Начни, когда будешь готов.</h1><p class="study-description">После запуска появятся даты проектов и календарь обучения. Переход по страницам ничего не запускает.</p><button class="btn" id="start-training">Начать обучение</button></section><section class="study-outline"><div class="study-outline-head"><h2>Твой маршрут</h2><span>7 проектов · 28 занятий</span></div>${modules.map((m,i)=>`<div class="project-preview"><span>${String(i+1).padStart(2,'0')}</span><h3>${escape(m.name)}</h3></div>`).join('')}</section></div>`);
    document.querySelector('#start-training').onclick=()=>{if(state.training)return;const today=localToday();state.training={version:1,startedAt:new Date().toISOString(),startDate:today,durationsDays:[...projectDurationsDays],earlyStarts:{}};state.start=today;state.current=1;save();study()};return;
  }
  const n=nearestAvailableWeek(target),w=week(n),m=mod(n),done=complete();
  const nextNumber=m.number+1,early=canStartEarly(nextNumber,state.training,state.statuses,localToday());
  if(!notice&&n!==state.current)notice=`Неделя ${state.current} пока недоступна. Показана ближайшая доступная — неделя ${n}.`;
  layout(`<div class="study-page">
    ${notice?`<p class="access-notice" role="status">${escape(notice)}</p>`:''}
    <section class="study-feature">
      <div class="study-feature-meta"><span>Неделя ${n} из 28</span><span class="study-status">${escape(status(n))}</span></div>
      <p class="study-module">Модуль ${m.number}. ${escape(m.name)}</p>
      <h1>${n===1?'Знакомство с Blender':escape(w.topic)}</h1>
      <p class="study-description">${escape(w.practice)}</p>
      <div class="study-feature-bottom">
        <a class="btn study-continue" href="#/week/${n}">Продолжить обучение <span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></span></a>
        <div class="study-progress"><span>Пройдено ${done} из 28 занятий</span><div class="study-progress-track" role="progressbar" aria-label="Пройденные занятия" aria-valuemin="0" aria-valuemax="28" aria-valuenow="${done}"><i style="width:${done/28*100}%"></i></div></div>
      </div>
    </section>
    ${early?`<div class="early-start"><div><b>Проект завершён раньше срока</b><p>Можно открыть следующий проект уже сегодня.</p></div><button class="btn secondary" id="early-start">Начать следующий проект</button></div>`:''}
    <section class="study-outline" aria-label="Учебный план">
      <div class="study-outline-head"><h2>Все занятия</h2><span>7 модулей · 28 недель</span></div>
      <p class="study-note">Полный материал пока доступен для первой недели. Для остальных занятий показан план практики.</p>
      ${modules.map(module=>{
        const number=String(module.number).padStart(2,'0');
        if(!moduleUnlocked(module.number))return `<div class="module module-locked"><div class="module-locked-label"><span class="module-number">${number}</span><h2>${escape(module.name)}</h2><svg class="module-lock" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></div></div>`;
        return `<details class="module" ${module.number===m.number?'open':''}>
          <summary><span class="module-number">${number}</span><div><h2>${escape(module.name)}</h2><p>Недели ${module.start}–${module.end} · ${escape(module.goal)}</p></div></summary>
          <div class="module-weeks">${module.weeks.map(item=>`<div class="week"><a href="#/week/${item.number}"><b>Неделя ${item.number}. ${escape(item.topic)}</b><small>${escape(item.practice)}</small><span class="tag">${item.number===n?'Текущая · ':''}${escape(status(item.number))}</span></a></div>`).join('')}</div>
        </details>`;
      }).join('')}
    </section>
  </div>`);
  const earlyButton=document.querySelector('#early-start');if(earlyButton)earlyButton.onclick=()=>startEarly(nextNumber);
}
function startEarly(number){if(!canStartEarly(number,state.training,state.statuses,localToday()))return;state.training.earlyStarts[number]=localToday();state.current=(number-1)*4+1;save();study('',state.current);toast('Следующий проект открыт')}
function lessonNextAction(n){
  if(status(n)!=='Зачтено')return '';
  if(n===28)return '<div class="lesson-next" role="status"><p>Все занятия зачтены. Программа завершена.</p><a class="btn" href="#/progress">Мой прогресс →</a></div>';
  const next=n+1;
  if(!weekUnlocked(next))return '';
  return `<div class="lesson-next"><a class="btn" href="#/week/${next}" data-next-lesson="${next}">Следующее занятие →</a></div>`;
}
function weekPage(n){
  const w=week(n);if(!w){location.hash='/study';return}
  const m=mod(n);
  layout(`<div class="lesson"><a class="link" href="#/study">← Обучение</a><div class="eyebrow">Модуль ${m.number} / 07 · Неделя ${n} / 28</div><h1>${n===1?'Знакомство с Blender и трёхмерным пространством':escape(w.topic)}</h1><p class="muted">${escape(w.topic)}</p>${n===1?lessonOne():`<section><h2>Предварительный план</h2><p>${escape(w.practice)}</p><h3>Ожидаемый результат</h3><p>${escape(w.result)}</p><p class="muted">Подробный урок ещё готовится. Этот план показывает маршрут, но не заменяет учебные инструкции.</p></section>`}<section><h2>Отчёт и состояние</h2><div class="fields"><label class="field">Статус<select id="lesson-status">${statuses.map(s=>`<option ${status(n)===s?'selected':''}>${s}</option>`).join('')}</select></label><label class="field">Что сделал и что стоит проверить<textarea id="lesson-note" placeholder="Сохрани наблюдения, сложности и замечания проверяющего">${escape(state.notes[n]||'')}</textarea></label></div><div class="actions"><button class="btn" id="save-lesson">Сохранить</button><button class="btn secondary" id="copy-report">Скопировать отчёт</button></div><p class="muted">Проверка проходит отдельно в ChatGPT. Статус «Зачтено» устанавливается вручную после обратной связи.</p><div id="lesson-next-slot" aria-live="polite">${lessonNextAction(n)}</div></section></div>`);
  document.querySelector('#save-lesson').onclick=()=>{
    state.statuses[n]=document.querySelector('#lesson-status').value;
    state.notes[n]=document.querySelector('#lesson-note').value;
    save();
    document.querySelector('#lesson-next-slot').innerHTML=lessonNextAction(n);
    toast('Занятие сохранено');
  };
  document.querySelector('#lesson-next-slot').addEventListener('click',e=>{
    const link=e.target.closest('[data-next-lesson]');if(!link)return;
    const next=Number(link.dataset.nextLesson);
    if(next!==n+1||status(n)!=='Зачтено'||!weekUnlocked(next)){e.preventDefault();toast('Следующее занятие пока недоступно');return}
    state.current=next;save();
  });
  document.querySelector('#copy-report').onclick=async()=>{const report=`FORMA / LAB · Неделя ${n}\n${w.topic}\nСтатус: ${document.querySelector('#lesson-status').value}\nОтчёт: ${document.querySelector('#lesson-note').value}`;try{await navigator.clipboard.writeText(report);toast('Отчёт скопирован')}catch{toast('Копирование недоступно в этом браузере')}};
}
function calendar(){
  const all=modules.flatMap(m=>m.weeks);
  const datesForCalendar=n=>state.dates[n]||{planned:'',final:''};
  const late=w=>{const d=datesForCalendar(w.number);return Boolean(d.final&&new Date(d.final+'T23:59:59')<new Date()&&status(w.number)!=='Зачтено')};
  const upcoming=all.filter(w=>{const d=datesForCalendar(w.number);return (d.planned||d.final)&&status(w.number)!=='Зачтено'&&(late(w)||new Date((d.planned||d.final)+'T23:59:59')>=new Date())}).sort((a,b)=>(datesForCalendar(a.number).planned||datesForCalendar(a.number).final).localeCompare(datesForCalendar(b.number).planned||datesForCalendar(b.number).final)).slice(0,3);
  const item=w=>{const d=datesForCalendar(w.number);return `<div class="panel"><div class="section-head"><h3>Неделя ${w.number}</h3><span class="tag">${late(w)?'Срок прошёл · ':''}${escape(status(w.number))}</span></div><p class="muted">${escape(w.topic)}</p><div class="split"><label class="field">Плановая дата<input type="date" data-week="${w.number}" data-date="planned" value="${d.planned||''}"></label><label class="field">Окончательная дата<input type="date" data-week="${w.number}" data-date="final" value="${d.final||''}"></label></div></div>`};
  layout(`<div class="page-head"><div class="eyebrow">Планирование</div><h1>Календарь</h1><p class="muted">Новый график проектов ещё проектируется. Показаны только даты, сохранённые вручную; они не меняют доступ к модулям или статус работы.</p></div><section class="calendar-upcoming"><h2>Ближайшие сроки · черновое планирование</h2>${upcoming.length?upcoming.map(w=>`<p>Неделя ${w.number} · ${escape(date(w.number).planned||date(w.number).final)}${late(w)?' · срок прошёл':''}</p>`).join(''):'<p>Пока нет вручную назначенных сроков. Добавь дату в блоке недели ниже.</p>'}</section><h2>Все недели</h2>${modules.map(m=>`<details class="calendar-group" ><summary>Модуль ${m.number} · недели ${m.start}–${m.end}</summary>${m.weeks.map(item).join('')}</details>`).join('')}`);
  document.querySelectorAll('[data-date]').forEach(el=>el.onchange=()=>{const n=el.dataset.week;state.dates[n]={...datesForCalendar(+n),[el.dataset.date]:el.value};save();toast('Дата сохранена')});
}
const calendarView={month:'',selected:''};
let calendarPopupKeyHandler=null;
function openCalendarPopup(){
  const host=document.querySelector('#calendar-host');if(!host)return;
  if(calendarPopupKeyHandler)removeEventListener('keydown',calendarPopupKeyHandler);
  const today=localToday();
  calendarView.month ||= today.slice(0,7);calendarView.selected ||= today;
  const [year,month]=calendarView.month.split('-').map(Number);
  const first=new Date(year,month-1,1,12),offset=(first.getDay()+6)%7,start=new Date(year,month-1,1-offset,12);
  const days=Array.from({length:42},(_,i)=>{const d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i,12);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`});
  const eventsFor=d=>{
    const events=[];
    if(state.training)projectSchedule(state.training).forEach(p=>{if(p.start===d)events.push({project:p.number,label:'Старт проекта',type:'start'});if(p.soft===d)events.push({project:p.number,label:'Мягкий срок',type:'soft'});if(p.hard===d)events.push({project:p.number,label:'Жёсткий срок',type:'hard'})});
    return events;
  };
  const selectedEvents=eventsFor(calendarView.selected);
  host.innerHTML=`<div class="calendar-backdrop" data-calendar-close><section class="calendar-popup" role="dialog" aria-modal="true" aria-labelledby="calendar-popup-title"><header class="calendar-popup-head"><div><div class="eyebrow">Планирование</div><h2 id="calendar-popup-title">Календарь</h2></div><button class="calendar-close" type="button" aria-label="Закрыть календарь" data-calendar-close>×</button></header><div class="calendar-month-head"><h3>${new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'}).format(first)}</h3><div><button class="month-nav" type="button" id="popup-month-prev" aria-label="Предыдущий месяц">‹</button><button class="month-nav" type="button" id="popup-month-next" aria-label="Следующий месяц">›</button></div></div><div class="month-grid">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=>`<b class="weekday">${d}</b>`).join('')}${days.map(d=>{const ev=eventsFor(d);return `<button type="button" class="month-day ${d.slice(0,7)!==calendarView.month?'outside':''} ${d===today?'today':''} ${d===calendarView.selected?'selected':''}" data-popup-day="${d}" aria-label="${d}${ev.length?`, событий: ${ev.length}`:''}"><span>${+d.slice(-2)}</span>${ev.length?`<i class="event-dots">${ev.slice(0,3).map(e=>`<em class="dot ${e.type}" title="${escape(e.label)}"></em>`).join('')}</i>`:''}</button>`}).join('')}</div><div class="calendar-legend"><span><i class="dot soft"></i> Мягкий срок</span><span><i class="dot hard"></i> Жёсткий срок</span></div><div class="calendar-selected"><b>${calendarView.selected}</b>${selectedEvents.length?selectedEvents.map(e=>`<p><span class="dot ${e.type}"></span> Проект ${e.project}${e.week?` · занятие ${e.week}`:''} · ${e.label}</p>`).join(''):'<p>На эту дату дедлайнов нет.</p>'}</div></section></div>`;
  const move=delta=>{const d=new Date(year,month-1+delta,1,12);calendarView.month=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;openCalendarPopup()};
  document.querySelector('#popup-month-prev').onclick=()=>move(-1);document.querySelector('#popup-month-next').onclick=()=>move(1);
  host.querySelectorAll('[data-popup-day]').forEach(el=>el.onclick=()=>{calendarView.selected=el.dataset.popupDay;openCalendarPopup()});
  const onKey=e=>{if(e.key==='Escape')close()};
  const close=()=>{host.replaceChildren();removeEventListener('keydown',onKey);calendarPopupKeyHandler=null};
  calendarPopupKeyHandler=onKey;host.querySelectorAll('[data-calendar-close]').forEach(el=>el.onclick=e=>{if(e.target===el||el.matches('button'))close()});addEventListener('keydown',onKey);
}
function works(){layout(`<div class="page-head"><div class="eyebrow">Личный архив</div><h1>Мои работы</h1><p class="muted">Здесь хранятся описания и ссылки. Файлы Blender остаются у тебя на устройстве.</p><button class="btn" id="add-work">Добавить работу</button></div><div id="work-form"></div><div id="work-list">${state.works.length?state.works.map(x=>`<article class="panel"><div class="eyebrow">Неделя ${x.week} · ${escape(x.date)}</div><h2>${escape(x.title)}</h2><p>${escape(x.description)}</p><p class="muted">${escape(x.note)} · ${escape(x.status)}</p>${safeUrl(x.url)?`<a href="${safeUrl(x.url)}" target="_blank" rel="noopener noreferrer">Открыть материал</a>`:''}<div class="actions"><button class="btn secondary" data-edit="${escape(x.id)}">Редактировать</button><button class="btn danger" data-delete="${escape(x.id)}">Удалить</button></div></article>`).join(''):'<div class="empty">Пока нет работ. Добавь первую запись после практики в Blender.</div>'}</div>`);document.querySelector('#add-work').onclick=()=>workForm();document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>workForm(state.works.find(x=>x.id===b.dataset.edit)));document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('Удалить эту запись?')){state.works=state.works.filter(x=>x.id!==b.dataset.delete);save();works()}})}
function workForm(x={}){document.querySelector('#work-form').innerHTML=`<form class="panel fields" id="work-editor"><h2>${x.id?'Редактировать':'Новая работа'}</h2><label class="field">Название<input name="title" required maxlength="100" value="${escape(x.title||'')}"></label><label class="field">Неделя<select name="week">${Array.from({length:28},(_,i)=>`<option value="${i+1}" ${+(x.week||state.current)===i+1?'selected':''}>Неделя ${i+1}</option>`).join('')}</select></label><label class="field">Дата<input name="date" type="date" value="${escape(x.date||localDate(new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0')+'-'+String(new Date().getDate()).padStart(2,'0')))}"></label><label class="field">Статус<select name="status">${statuses.map(s=>`<option ${x.status===s?'selected':''}>${s}</option>`).join('')}</select></label><label class="field">Описание<textarea name="description">${escape(x.description||'')}</textarea></label><label class="field">Личная заметка<textarea name="note">${escape(x.note||'')}</textarea></label><label class="field">Ссылка на материал<input name="url" type="url" value="${escape(x.url||'')}" placeholder="https://"></label><div class="actions"><button class="btn">Сохранить работу</button><button type="button" class="btn secondary" id="cancel-work">Отмена</button></div></form>`;document.querySelector('#cancel-work').onclick=()=>document.querySelector('#work-form').replaceChildren();document.querySelector('#work-editor').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));if(data.url&&!/^https?:\/\//i.test(data.url)){toast('Ссылка должна начинаться с http или https');return}const entry={...data,id:x.id||crypto.randomUUID()};state.works=x.id?state.works.map(w=>w.id===x.id?entry:w):[entry,...state.works];save();works();toast('Работа сохранена')}}
function progress(){const done=complete();layout(`<div class="page-head"><h1>Прогресс</h1><p class="muted">Зачёт отмечается вручную после проверки. Календарная дата сама ничего не засчитывает.</p></div><div class="stats"><div class="stat"><strong>${done}/28</strong><span>Зачтено недель</span></div><div class="stat"><strong>${[4,8,12,16,20,24,28].filter(n=>status(n)==='Зачтено').length}/7</strong><span>Контрольных работ</span></div><div class="stat"><strong>${state.works.length}</strong><span>Работ в архиве</span></div></div><div class="bars" aria-label="Зачтено ${done} из 28 недель">${Array.from({length:28},(_,i)=>`<i class="${status(i+1)==='Зачтено'?'done':''}"></i>`).join('')}</div><h2>Маршрут</h2>${modules.map(m=>`<div class="panel"><div class="eyebrow">Модуль ${m.number} · ${m.weeks.filter(w=>status(w.number)==='Зачтено').length}/4 недель</div><h3>${escape(m.name)}</h3><p class="muted">${m.weeks.filter(w=>status(w.number)!=='Зачтено'&&status(w.number)!=='Не начато').map(w=>`Неделя ${w.number}: ${escape(status(w.number))}`).join(' · ')||'Нет занятий в работе'}</p></div>`).join('')}`)}
function more(){layout(`<div class="page-head"><h1>Ещё</h1></div>${[['/study','Обучение'],['/progress','Мой прогресс'],['/settings','Настройки и резервная копия']].map(([url,label])=>`<div class="panel"><a class="link" href="#${url}">${label}</a></div>`).join('')}`)}
function settings(){const startControl=state.training?`<p>Обучение начато ${state.training.startDate}. Даты проектов рассчитываются от этой даты.</p>`:`<label class="field">Справочная дата<input id="start" type="date" value="${state.start}"><small>Это поле не запускает обучение и не создаёт сроки.</small></label>`;layout(`<div class="page-head"><div class="eyebrow">Личные данные остаются в браузере</div><h1>Настройки</h1><p class="muted">На разных устройствах данные не синхронизируются. Для переноса используй экспорт и импорт.</p></div><div class="panel fields">${startControl}<label class="field">Текущая неделя<select id="current">${Array.from({length:28},(_,i)=>`<option value="${i+1}" ${state.current===i+1?'selected':''}>Неделя ${i+1}</option>`).join('')}</select></label><button class="btn" id="settings-save">Сохранить настройки</button></div><div class="panel"><h2>Виртуальная группа</h2><label><input type="checkbox" id="chat-auto" ${state.chat.auto?'checked':''}> Появление новых сообщений</label></div><div class="panel"><h2>Резервная копия</h2><p class="muted">JSON содержит заметки и личные записи. Храни его в безопасном месте.</p><div class="actions"><button class="btn secondary" id="export">Экспорт JSON</button><label class="btn secondary" for="import">Импорт JSON</label><input id="import" type="file" accept="application/json,.json" hidden><button class="btn danger" id="reset">Сбросить данные</button></div></div>`);document.querySelector('#settings-save').onclick=()=>{if(!state.training)state.start=document.querySelector('#start').value;state.current=+document.querySelector('#current').value;save();toast('Настройки сохранены')};document.querySelector('#chat-auto').onchange=e=>{state.chat.auto=e.target.checked;save()};document.querySelector('#export').onclick=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.href=url;a.download='forma-lab-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};document.querySelector('#import').onchange=async e=>{try{const raw=normalize(JSON.parse(await e.target.files[0].text()));if(!confirm('Заменить все текущие данные содержимым файла?'))return;state=raw;save();settings();toast('Данные импортированы')}catch{toast('Файл не соответствует формату FORMA / LAB')}};document.querySelector('#reset').onclick=()=>{if(confirm('Удалить весь прогресс, заметки и работы на этом устройстве?')){state=initial();save();settings();toast('Данные сброшены')}}}
let chatOpen=false;
function chatItem(x,previous){
  const grouped=previous&&previous.person===x.person;
  return `<div class="message${x.role?' mentor-message':''}${grouped?' grouped':''}">${grouped?'<span class="avatar-spacer"></span>':avatarMarkup(x.person)}
    <div class="message-content">${grouped?'':`<div class="message-meta"><b>${escape(x.person)}</b>${x.role?`<span class="message-role">${escape(x.role)}</span>`:''}<time>${escape(x.time)}</time></div>`}<p>${escape(x.body)}</p></div>
  </div>`;
}
function closeChat(){chatOpen=false;document.querySelector('#chat-host').replaceChildren();document.querySelector('#chat-toggle')?.focus({preventScroll:true})}
function openChat(scrollBottom=true){
  chatOpen=true;
  const available=availableMessages(state.current),shown=available.slice(0,Math.max(1,Math.min(state.chat.seen,available.length)));
  document.querySelector('#chat-host').innerHTML=`<section class="chat" role="dialog" aria-modal="false" aria-label="Чат курса">
    <header><div><b>Чат курса</b><div class="muted chat-subtitle">Виртуальная группа · 7 участников</div></div><button id="close-chat" aria-label="Закрыть чат">×</button></header>
    <div class="messages" role="log" aria-label="Сообщения">${shown.map((x,i)=>chatItem(x,shown[i-1])).join('')}</div>
  </section>`;
  document.querySelector('#close-chat').onclick=closeChat;
  document.querySelector('#close-chat').focus({preventScroll:true});
  if(scrollBottom)document.querySelector('.messages').scrollTop=document.querySelector('.messages').scrollHeight;
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&chatOpen)closeChat()});
setInterval(()=>{
  if(!state.chat.auto)return;
  const available=availableMessages(state.current),max=available.length;
  if(state.chat.seen>=max)return;
  state.chat.seen++;save();
  if(!chatOpen)return;
  const box=document.querySelector('.messages');if(!box)return;
  const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<80;
  const shown=available.slice(0,Math.max(1,Math.min(state.chat.seen,max)));
  const count=box.querySelectorAll('.message').length;
  if(shown.length>count)box.insertAdjacentHTML('beforeend',shown.slice(count).map((x,i)=>chatItem(x,shown[count+i-1])).join(''));
  if(nearBottom)box.scrollTop=box.scrollHeight;
},90000);
function render(){const r=route();if(r==='/')home();else if(r==='/study'||r==='/program')study();else if(r.startsWith('/week/')){const n=+r.split('/')[2];if(!week(n))weekPage(n);else if(!state.training){history.replaceState(null,'','#/study');study()}else if(!weekUnlocked(n)){const locked=mod(n),available=nearestAvailableWeek(n);history.replaceState(null,'','#/study');study(`Проект ${String(locked.number).padStart(2,'0')} пока закрыт. Он откроется после завершения предыдущего проекта или в дату его мягкого срока. Показано занятие ${available}.`,n)}else weekPage(n)}else if(r==='/calendar'){history.replaceState(null,'','#/');home();openCalendarPopup()}else if(r==='/works')works();else if(r==='/progress')progress();else if(r==='/settings')settings();else more();chatOpen=false;window.scrollTo(0,0)}
addEventListener('hashchange',render);render();
