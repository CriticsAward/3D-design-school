import modules from './curriculum.json' with {type:'json'};
import {availableMessages,avatarMarkup} from './chat.js?v=5';
import {statuses,initial,normalize,datesFor,localDate} from './state.js?v=2';
import {lessonOne} from './lesson-one.js?v=2';
import {homeView} from './home-view.js?v=8';
import {mountScene} from './scene.js';

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
const nav=[['/','Главная','home'],['/study','Обучение','study'],['/works','Мои работы','works'],['/more','Ещё','more']];
const iconPaths={
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  study:'<path d="M12 7v14M3 18V4a1 1 0 0 1 1-1h5a3 3 0 0 1 3 3 3 3 0 0 1 3-3h5a1 1 0 0 1 1 1v14h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  works:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.4"/><path d="m3 17 5-5 4 4 3-3 6 5"/>',
  more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};
const navIcon=name=>'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+iconPaths[name]+'</svg>';
function toast(message){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.role='status';el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),3500)}
function layout(content){const r=route();app.innerHTML=`<div class="shell"><main class="main"><header class="top"><a class="brand" href="#/" aria-label="FORMA / LAB — главная">FORMA <span>/ LAB</span></a><div class="top-actions"><button class="chat-toggle" id="chat-toggle" aria-label="Открыть чат курса"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v12H10l-5 3v-3H4zM8 10h8M8 13.5h5"/></svg><span>Чат</span></button><a class="link" href="#/settings" aria-label="Настройки">Настройки</a></div></header>${content}</main><nav class="nav" aria-label="Основная навигация">${nav.map(([url,label,icon])=>`<a href="#${url}" class="${(r===url||((r==='/program'||r.startsWith('/week/'))&&url==='/study'))?'active':''}" ${(r===url||((r==='/program'||r.startsWith('/week/'))&&url==='/study'))?'aria-current="page"':''}>${navIcon(icon)}<span>${label}</span></a>`).join('')}</nav><div id="chat-host"></div></div>`;document.querySelector('#chat-toggle').onclick=()=>openChat(false)}
function home(){layout(homeView({avatarMarkup}));mountScene(document.querySelector('[data-scene]'))}
function study(){
  const n=state.current,w=week(n),m=mod(n),done=complete();
  layout(`<div class="study-page">
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
    <section class="study-outline" aria-label="Учебный план">
      <div class="study-outline-head"><h2>Все занятия</h2><span>7 модулей · 28 недель</span></div>
      <p class="study-note">Полный материал пока доступен для первой недели. Для остальных занятий показан план практики.</p>
      ${modules.map(module=>`<details class="module" ${module.number===m.number?'open':''}>
        <summary><span class="module-number">${String(module.number).padStart(2,'0')}</span><div><h2>${escape(module.name)}</h2><p>Недели ${module.start}–${module.end} · ${escape(module.goal)}</p></div></summary>
        <div class="module-weeks">${module.weeks.map(item=>`<div class="week"><a href="#/week/${item.number}"><b>Неделя ${item.number}. ${escape(item.topic)}</b><small>${escape(item.practice)}</small><span class="tag">${item.number===n?'Текущая · ':''}${escape(status(item.number))}</span></a></div>`).join('')}</div>
      </details>`).join('')}
    </section>
  </div>`);
}
function weekPage(n){const w=week(n);if(!w){location.hash='/study';return}const m=mod(n),d=date(n);layout(`<div class="lesson"><a class="link" href="#/study">← Обучение</a><div class="eyebrow">Модуль ${m.number} / 07 · Неделя ${n} / 28</div><h1>${n===1?'Знакомство с Blender и трёхмерным пространством':escape(w.topic)}</h1><p class="muted">${escape(w.topic)}</p>${n===1?lessonOne():`<section><h2>Предварительный план</h2><p>${escape(w.practice)}</p><h3>Ожидаемый результат</h3><p>${escape(w.result)}</p><p class="muted">Подробный урок ещё готовится. Этот план показывает маршрут, но не заменяет учебные инструкции.</p></section>`}<section><h2>Отчёт и состояние</h2><div class="fields"><label class="field">Статус<select id="lesson-status">${statuses.map(s=>`<option ${status(n)===s?'selected':''}>${s}</option>`).join('')}</select></label><label class="field">Что сделал и что стоит проверить<textarea id="lesson-note" placeholder="Сохрани наблюдения, сложности и замечания проверяющего">${escape(state.notes[n]||'')}</textarea></label></div><div class="actions"><button class="btn" id="save-lesson">Сохранить</button><button class="btn secondary" id="copy-report">Скопировать отчёт</button></div><p class="muted">Проверка проходит отдельно в ChatGPT. Статус «Зачтено» устанавливается вручную после обратной связи.</p></section></div>`);document.querySelector('#save-lesson').onclick=()=>{state.statuses[n]=document.querySelector('#lesson-status').value;state.notes[n]=document.querySelector('#lesson-note').value;save();toast('Занятие сохранено')};document.querySelector('#copy-report').onclick=async()=>{const report=`FORMA / LAB · Неделя ${n}\n${w.topic}\nСтатус: ${document.querySelector('#lesson-status').value}\nОтчёт: ${document.querySelector('#lesson-note').value}`;try{await navigator.clipboard.writeText(report);toast('Отчёт скопирован')}catch{toast('Копирование недоступно в этом браузере')}}}
function calendar(){
  const all=modules.flatMap(m=>m.weeks);
  const late=w=>{const d=date(w.number);return Boolean(d.final&&new Date(d.final+'T23:59:59')<new Date()&&status(w.number)!=='Зачтено')};
  const upcoming=all.filter(w=>{const d=date(w.number);return (d.planned||d.final)&&status(w.number)!=='Зачтено'&&(late(w)||new Date((d.planned||d.final)+'T23:59:59')>=new Date())}).sort((a,b)=>(date(a.number).planned||date(a.number).final).localeCompare(date(b.number).planned||date(b.number).final)).slice(0,3);
  const item=w=>{const d=date(w.number);return `<div class="panel"><div class="section-head"><h3>Неделя ${w.number}</h3><span class="tag">${late(w)?'Срок прошёл · ':''}${escape(status(w.number))}</span></div><p class="muted">${escape(w.topic)}</p><div class="split"><label class="field">Плановая дата<input type="date" data-week="${w.number}" data-date="planned" value="${d.planned||''}"></label><label class="field">Окончательная дата<input type="date" data-week="${w.number}" data-date="final" value="${d.final||''}"></label></div></div>`};
  layout(`<div class="page-head"><div class="eyebrow">Планирование</div><h1>Календарь</h1><p class="muted">Сроки можно изменить. Просрочка не меняет статус работы.</p></div><section class="calendar-upcoming"><h2>Ближайшие сроки</h2>${upcoming.length?upcoming.map(w=>`<p>Неделя ${w.number} · ${escape(date(w.number).planned||date(w.number).final)}${late(w)?' · срок прошёл':''}</p>`).join(''):'<p>Пока нет назначенных сроков. Выбери дату начала или задай даты вручную.</p>'}</section><h2>Все недели</h2>${modules.map(m=>`<details class="calendar-group" ${m.number===mod(state.current).number?'open':''}><summary>Модуль ${m.number} · недели ${m.start}–${m.end}</summary>${m.weeks.map(item).join('')}</details>`).join('')}`);
  document.querySelectorAll('[data-date]').forEach(el=>el.onchange=()=>{const n=el.dataset.week;state.dates[n]={...date(+n),[el.dataset.date]:el.value};save();toast('Дата сохранена')});
}
function works(){layout(`<div class="page-head"><div class="eyebrow">Личный архив</div><h1>Мои работы</h1><p class="muted">Здесь хранятся описания и ссылки. Файлы Blender остаются у тебя на устройстве.</p><button class="btn" id="add-work">Добавить работу</button></div><div id="work-form"></div><div id="work-list">${state.works.length?state.works.map(x=>`<article class="panel"><div class="eyebrow">Неделя ${x.week} · ${escape(x.date)}</div><h2>${escape(x.title)}</h2><p>${escape(x.description)}</p><p class="muted">${escape(x.note)} · ${escape(x.status)}</p>${safeUrl(x.url)?`<a href="${safeUrl(x.url)}" target="_blank" rel="noopener noreferrer">Открыть материал</a>`:''}<div class="actions"><button class="btn secondary" data-edit="${escape(x.id)}">Редактировать</button><button class="btn danger" data-delete="${escape(x.id)}">Удалить</button></div></article>`).join(''):'<div class="empty">Пока нет работ. Добавь первую запись после практики в Blender.</div>'}</div>`);document.querySelector('#add-work').onclick=()=>workForm();document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>workForm(state.works.find(x=>x.id===b.dataset.edit)));document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('Удалить эту запись?')){state.works=state.works.filter(x=>x.id!==b.dataset.delete);save();works()}})}
function workForm(x={}){document.querySelector('#work-form').innerHTML=`<form class="panel fields" id="work-editor"><h2>${x.id?'Редактировать':'Новая работа'}</h2><label class="field">Название<input name="title" required maxlength="100" value="${escape(x.title||'')}"></label><label class="field">Неделя<select name="week">${Array.from({length:28},(_,i)=>`<option value="${i+1}" ${+(x.week||state.current)===i+1?'selected':''}>Неделя ${i+1}</option>`).join('')}</select></label><label class="field">Дата<input name="date" type="date" value="${escape(x.date||localDate(new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0')+'-'+String(new Date().getDate()).padStart(2,'0')))}"></label><label class="field">Статус<select name="status">${statuses.map(s=>`<option ${x.status===s?'selected':''}>${s}</option>`).join('')}</select></label><label class="field">Описание<textarea name="description">${escape(x.description||'')}</textarea></label><label class="field">Личная заметка<textarea name="note">${escape(x.note||'')}</textarea></label><label class="field">Ссылка на материал<input name="url" type="url" value="${escape(x.url||'')}" placeholder="https://"></label><div class="actions"><button class="btn">Сохранить работу</button><button type="button" class="btn secondary" id="cancel-work">Отмена</button></div></form>`;document.querySelector('#cancel-work').onclick=()=>document.querySelector('#work-form').replaceChildren();document.querySelector('#work-editor').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));if(data.url&&!/^https?:\/\//i.test(data.url)){toast('Ссылка должна начинаться с http или https');return}const entry={...data,id:x.id||crypto.randomUUID()};state.works=x.id?state.works.map(w=>w.id===x.id?entry:w):[entry,...state.works];save();works();toast('Работа сохранена')}}
function progress(){const done=complete();layout(`<div class="page-head"><h1>Прогресс</h1><p class="muted">Зачёт отмечается вручную после проверки. Календарная дата сама ничего не засчитывает.</p></div><div class="stats"><div class="stat"><strong>${done}/28</strong><span>Зачтено недель</span></div><div class="stat"><strong>${[4,8,12,16,20,24,28].filter(n=>status(n)==='Зачтено').length}/7</strong><span>Контрольных работ</span></div><div class="stat"><strong>${state.works.length}</strong><span>Работ в архиве</span></div></div><div class="bars" aria-label="Зачтено ${done} из 28 недель">${Array.from({length:28},(_,i)=>`<i class="${status(i+1)==='Зачтено'?'done':''}"></i>`).join('')}</div><h2>Маршрут</h2>${modules.map(m=>`<div class="panel"><div class="eyebrow">Модуль ${m.number} · ${m.weeks.filter(w=>status(w.number)==='Зачтено').length}/4 недель</div><h3>${escape(m.name)}</h3><p class="muted">${m.weeks.filter(w=>status(w.number)!=='Зачтено'&&status(w.number)!=='Не начато').map(w=>`Неделя ${w.number}: ${escape(status(w.number))}`).join(' · ')||'Нет занятий в работе'}</p></div>`).join('')}`)}
function more(){layout(`<div class="page-head"><h1>Ещё</h1></div>${[['/calendar','Календарь и сроки'],['/progress','Мой прогресс'],['/settings','Настройки и резервная копия']].map(([url,label])=>`<div class="panel"><a class="link" href="#${url}">${label}</a></div>`).join('')}`)}
function settings(){layout(`<div class="page-head"><div class="eyebrow">Личные данные остаются в браузере</div><h1>Настройки</h1><p class="muted">На разных устройствах данные не синхронизируются. Для переноса используй экспорт и импорт.</p></div><div class="panel fields"><label class="field">Дата начала обучения<input id="start" type="date" value="${state.start}"></label><label class="field">Текущая неделя<select id="current">${Array.from({length:28},(_,i)=>`<option value="${i+1}" ${state.current===i+1?'selected':''}>Неделя ${i+1}</option>`).join('')}</select></label><button class="btn" id="settings-save">Сохранить настройки</button></div><div class="panel"><h2>Виртуальная группа</h2><label><input type="checkbox" id="chat-auto" ${state.chat.auto?'checked':''}> Появление новых сообщений</label></div><div class="panel"><h2>Резервная копия</h2><p class="muted">JSON содержит заметки и личные записи. Храни его в безопасном месте.</p><div class="actions"><button class="btn secondary" id="export">Экспорт JSON</button><label class="btn secondary" for="import">Импорт JSON</label><input id="import" type="file" accept="application/json,.json" hidden><button class="btn danger" id="reset">Сбросить данные</button></div></div>`);document.querySelector('#settings-save').onclick=()=>{state.start=document.querySelector('#start').value;state.current=+document.querySelector('#current').value;save();toast('Настройки сохранены')};document.querySelector('#chat-auto').onchange=e=>{state.chat.auto=e.target.checked;save()};document.querySelector('#export').onclick=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.href=url;a.download='forma-lab-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};document.querySelector('#import').onchange=async e=>{try{const raw=normalize(JSON.parse(await e.target.files[0].text()));if(!confirm('Заменить все текущие данные содержимым файла?'))return;state=raw;save();settings();toast('Данные импортированы')}catch{toast('Файл не соответствует формату FORMA / LAB')}};document.querySelector('#reset').onclick=()=>{if(confirm('Удалить весь прогресс, заметки и работы на этом устройстве?')){state=initial();save();settings();toast('Данные сброшены')}}}
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
function render(){const r=route();if(r==='/')home();else if(r==='/study'||r==='/program')study();else if(r.startsWith('/week/'))weekPage(+r.split('/')[2]);else if(r==='/calendar')calendar();else if(r==='/works')works();else if(r==='/progress')progress();else if(r==='/settings')settings();else more();chatOpen=false;window.scrollTo(0,0)}
addEventListener('hashchange',render);render();
