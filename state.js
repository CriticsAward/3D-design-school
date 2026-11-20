export const statuses=['Не начато','В работе','На проверке','Требует доработки','Зачтено'];
export const initial=()=>({version:1,start:'',current:1,statuses:{},dates:{},notes:{},works:[],chat:{seen:5,auto:true},lessonSection:'theory'});
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const isoDate=x=>typeof x==='string'&&(x===''||(/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(new Date(x+'T12:00:00').getTime())&&localDate(x)===x));
export function normalize(raw){
  if(!record(raw)||raw.version!==1||!Number.isInteger(raw.current)||raw.current<1||raw.current>28||!isoDate(raw.start)||!record(raw.statuses)||!record(raw.dates)||!record(raw.notes)||!Array.isArray(raw.works)||!record(raw.chat))throw Error('Неверный формат сохранения');
  for(const [key,value] of Object.entries(raw.statuses))if(!/^(?:[1-9]|1\d|2[0-8])$/.test(key)||!statuses.includes(value))throw Error('Неверный статус');
  for(const [key,value] of Object.entries(raw.dates))if(!/^(?:[1-9]|1\d|2[0-8])$/.test(key)||!record(value)||!isoDate(value.planned??'')||!isoDate(value.final??''))throw Error('Неверная дата');
  for(const [key,value] of Object.entries(raw.notes))if(!/^(?:[1-9]|1\d|2[0-8])$/.test(key)||typeof value!=='string')throw Error('Неверная заметка');
  if(raw.works.some(w=>!record(w)||typeof w.id!=='string'||typeof w.title!=='string'||!Number.isInteger(+w.week)||+w.week<1||+w.week>28||!['description','note','url'].every(k=>w[k]===undefined||typeof w[k]==='string')||!isoDate(w.date??'')||!statuses.includes(w.status)))throw Error('Неверная работа');
  if(!Number.isInteger(raw.chat.seen)||raw.chat.seen<0||typeof raw.chat.auto!=='boolean')throw Error('Неверный чат');
  return {...initial(),...raw,chat:{...initial().chat,...raw.chat}};
}
export function localDate(value,days=0){
  if(!value)return '';
  const [year,month,day]=value.split('-').map(Number);
  const date=new Date(year,month-1,day+days,12);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function datesFor(state,week){
  const calculated={planned:localDate(state.start,week*7-2),final:localDate(state.start,week*7)};
  return {...calculated,...state.dates[week]};
}
