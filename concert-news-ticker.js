/* HELLXBONE RADIO : uniquement des dates de concerts attestées, jamais des titres de news. */
(function(){
'use strict';
const ID='hx-concert-news';
const MONTHS={'janvier':0,'février':1,'fevrier':1,'mars':2,'avril':3,'mai':4,'juin':5,'juillet':6,'août':7,'aout':7,'septembre':8,'octobre':9,'novembre':10,'décembre':11,'decembre':11};
const entries=[
 {match:/shining.*ckraft|gagne ta place pour shining/i, shows:[['2026-11-06','SHINING + CKRAFT','PARIS','BACKSTAGE BY THE MILL']]},
 {match:/bruce dickinson.*live|bruce dickinson.*concert/i,shows:[['2027-12-07','BRUCE DICKINSON + EVERGREY','LYON',''],['2027-12-08','BRUCE DICKINSON + EVERGREY','TOULOUSE',''],['2027-12-10','BRUCE DICKINSON + EVERGREY','PARIS','']]},
 {match:/muse.*main square festival/i,shows:[['2027-07-04','MUSE · MAIN SQUARE FESTIVAL','ARRAS','CITADELLE']]}
];
function displayDate(iso){const [year,month,day]=iso.split('-');return day+'/'+month+'/'+year;}
function draw(host,events){
 const track=host.querySelector('.hx-concert-track');if(!track)return;
 track.replaceChildren();
 if(!events.length){host.classList.add('hx-concert-idle');const span=document.createElement('span');span.className='hx-concert-empty';span.textContent='AUCUNE DATE DE CONCERT CONFIRMÉE DANS LE FLUX ACTUEL';track.append(span);return;}
 host.classList.remove('hx-concert-idle');
 function group(){const row=document.createElement('span');row.className='hx-concert-group';
   for(const e of events){const a=document.createElement('a');a.href=e.url;a.target='_blank';a.rel='noopener noreferrer';
     a.textContent=displayDate(e.date)+' · '+e.artist+' · '+e.city+(e.venue?' · '+e.venue:'');
     a.title='Voir la source de cette date de concert';row.append(a);
     const sep=document.createElement('span');sep.textContent=' ◆ ';sep.setAttribute('aria-hidden','true');row.append(sep);}
   return row;}
 track.append(group(),group());track.lastElementChild.setAttribute('aria-hidden','true');
 track.style.setProperty('--hx-concert-duration',Math.max(45,events.length*11)+'s');
}
async function refresh(host){
 try{
  const res=await fetch('./metal-news.json?v='+Math.floor(Date.now()/3600000),{cache:'no-store'});
  if(!res.ok)throw new Error('Flux absent');
  const feed=await res.json();const now=new Date();now.setHours(0,0,0,0);
  const events=[],keys=new Set();
  for(const item of (Array.isArray(feed.items)?feed.items:[])){
   if(!/^https:\/\/(?:www\.)?(?:metalorgie\.com|metalzone\.fr|info-lux\.com)\//i.test(item.url||''))continue;
   const text=String(item.title||'')+' '+String(item.summary||'');
   if(/(?:annul|report[ée]|concert annulé)/i.test(text))continue;
   for(const entry of entries){
    if(!entry.match.test(text))continue;
    for(const [date,artist,city,venue] of entry.shows){
     if(new Date(date+'T23:59:59')<now)continue;
     const key=date+'|'+artist+'|'+city;
     if(keys.has(key))continue;keys.add(key);
     events.push({date,artist,city,venue,url:item.url});
    }
   }
   /* Accepte aussi les annonces futures qui donnent clairement groupe, date et ville
      dans leur titre : 'GROUPE à VILLE le 6 novembre 2026'. */
   const m=String(item.title||'').match(/^(.{3,65}?)\s+(?:en concert\s+)?à\s+([\p{L}][\p{L}\s'-]{1,35}?)\s+le\s+(\d{1,2})\s+(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\s+(20\d{2})/iu);
   if(m){const month=MONTHS[m[4].toLowerCase()];const iso=m[5]+'-'+String(month+1).padStart(2,'0')+'-'+m[3].padStart(2,'0');
    const date=new Date(iso+'T12:00:00');const key=iso+'|'+m[1]+'|'+m[2];
    if(date>=now&&!keys.has(key)){keys.add(key);events.push({date:iso,artist:m[1].toUpperCase(),city:m[2].toUpperCase(),venue:'',url:item.url});}}
  }
  events.sort((a,b)=>a.date.localeCompare(b.date));draw(host,events.slice(0,12));
 }catch(e){draw(host,[]);}
}
function mount(){const host=document.getElementById(ID);if(!host||host.dataset.ready)return;host.dataset.ready='1';refresh(host);}
function boot(){const app=document.getElementById('app');if(!app)return;mount();
 new MutationObserver(mount).observe(app,{childList:true});
 setInterval(()=>{const host=document.getElementById(ID);if(host)refresh(host)},3600000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
