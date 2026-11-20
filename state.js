export const statuses=['Не начато','В работе','На проверке','Требует доработки','Зачтено'];
export const projectDurationsWeeks=Object.freeze([3,3,3,3,3,3,4]);
export const initial=()=>({version:1,start:'',current:1,statuses:{},dates:{},notes:{},works:[],chat:{seen:5,auto:true},lessonSection:'theory',training:null});
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const isoDate=x=>typeof x==='string'&&(x===''||(/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(new Date(x+'T12:00:00').getTime())&&localDate(x)===x));
function validTraining(raw){
  if(!record(raw)||raw.version!==1||typeof raw.startedAt!=='string'||Number.isNaN(Date.parse(raw.startedAt))||!isoDate(raw.startDate)||!raw.startDate||!Array.isArray(raw.durationsWeeks)||raw.durationsWeeks.length!==7||raw.durationsWeeks.some(n=>!Number.isInteger(n)||n<2||n>12))return null;
  const earlyStarts={};
  if(record(raw.earlyStarts)){
    let previous=raw.startDate;
    for(let number=2;number<=7;number++){
      const planned=localDate(previous,raw.durationsWeeks[number-2]*7),candidate=raw.earlyStarts[number];
      if(isoDate(candidate)&&candidate&&candidate>=previous&&candidate<planned)earlyStarts[number]=candidate;
      previous=earlyStarts[number]||planned;
    }
  }
  return {version:1,startedAt:raw.startedAt,startDate:raw.startDate,durationsWeeks:[...raw.durationsWeeks],earlyStarts};
}
export function normalize(raw){
  if(!record(raw)||raw.version!==1||!Number.isInteger(raw.current)||raw.current<1||raw.current>28||!isoDate(raw.start)||!record(raw.statuses)||!record(raw.dates)||!record(raw.notes)||!Array.isArray(raw.works)||!record(raw.chat))throw Error('Неверный формат сохранения');
  for(const [key,value] of Object.entries(raw.statuses))if(!/^(?:[1-9]|1\d|2[0-8])$/.test(key)||!statuses.includes(value))throw Error('Неверный статус');
  for(const [key,value] of Object.entries(raw.dates))if(!/^(?:[1-9]|1\d|2[0-8])$/.test(key)||!record(value)||!isoDate(value.planned??'')||!isoDate(value.final??''))throw Error('Неверная дата');
  for(const [key,value] of Object.entries(raw.notes))if(!/^(?:[1-9]|1\d|2[0-8])$/.test(key)||typeof value!=='string')throw Error('Неверная заметка');
  if(raw.works.some(w=>!record(w)||typeof w.id!=='string'||typeof w.title!=='string'||!Number.isInteger(+w.week)||+w.week<1||+w.week>28||!['description','note','url'].every(k=>w[k]===undefined||typeof w[k]==='string')||!isoDate(w.date??'')||!statuses.includes(w.status)))throw Error('Неверная работа');
  if(!Number.isInteger(raw.chat.seen)||raw.chat.seen<0||typeof raw.chat.auto!=='boolean')throw Error('Неверный чат');
  const training=validTraining(raw.training);
  return {...initial(),...raw,start:training?.startDate||raw.start,training,chat:{...initial().chat,...raw.chat}};
}
export function localDate(value,days=0){
  if(!value)return '';
  const [year,month,day]=value.split('-').map(Number);
  const date=new Date(year,month-1,day+days,12);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function localToday(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function projectSchedule(training){
  if(!training)return [];
  let previous=training.startDate;
  return training.durationsWeeks.map((weeks,index)=>{
    const number=index+1,start=training.earlyStarts?.[number]||previous;
    const soft=localDate(start,weeks*7),hard=localDate(soft,14);
    previous=soft;
    return {number,start,soft,hard};
  });
}
export function projectComplete(number,statusMap={}){
  return [1,2,3,4].every((_,i)=>statusMap[(number-1)*4+i+1]==='Зачтено');
}
export function projectStatus(project,today,statusMap={}){
  if(today<project.start)return 'Ожидает';
  if(projectComplete(project.number,statusMap))return 'Завершён';
  if(today<=project.soft)return 'В работе';
  if(today<=project.hard)return 'Доработка';
  return 'Срок превышен';
}
export function projectUnlocked(number,training,statusMap={},today=localToday()){
  if(number===1)return true;
  if(!training)return false;
  const previous=projectSchedule(training)[number-2];
  return number>1&&projectUnlocked(number-1,training,statusMap,today)&&(projectComplete(number-1,statusMap)||today>=previous.soft);
}
export function canStartEarly(number,training,statusMap={},today=localToday()){
  if(!training||number<2||number>7||!projectComplete(number-1,statusMap)||training.earlyStarts?.[number])return false;
  return today<projectSchedule(training)[number-2].soft;
}
export function datesFor(state,week){
  const calculated={planned:localDate(state.start,week*7-2),final:localDate(state.start,week*7)};
  return {...calculated,...state.dates[week]};
}
