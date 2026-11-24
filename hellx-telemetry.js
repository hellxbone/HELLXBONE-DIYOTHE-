/* HELLXBONE — statistiques anonymisées par rubrique, jeu et radio */
(()=>{'use strict';
if(window.HellxTelemetry||!window.crypto?.randomUUID||!window.fetch)return;
const ENDPOINT='https://ldibykpitjutratyqqax.supabase.co/rest/v1/hellx_activity_events';
const KEY='sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv';
const VISITOR_KEY='hellx-analytics-visitor-v1';
const VISIT=crypto.randomUUID();
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let visitor=crypto.randomUUID();
try{if(localStorage.getItem('hellx-member-stats-consent-v1')==='yes'){
 const saved=localStorage.getItem(VISITOR_KEY);if(uuid.test(saved||''))visitor=saved;
}}catch{}
const safe=s=>String(s??'').replace(/[<>\r\n\t]/g,' ').trim().slice(0,100);
function track(category,eventName,detail='',seconds=0){
 if(!['page','game','radio','action'].includes(category))return;
 const name=safe(eventName).slice(0,80), subject=safe(detail);
 if(!name)return;
 const payload={visit_id:VISIT,visitor_id:visitor,category,event_name:name,detail:subject,duration_seconds:Math.max(0,Math.min(86400,Math.floor(Number(seconds)||0)))};
 fetch(ENDPOINT,{method:'POST',keepalive:true,headers:{apikey:KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(payload)}).catch(()=>{});
}
let page='',pageStarted=0,radio='',radioStarted=0;
const games=new Map();
function elapsed(start){return Math.max(0,Math.floor((Date.now()-start)/1000));}
function flushPage(){if(page&&pageStarted){const n=elapsed(pageStarted);if(n>=1)track('page','duration',page,n);pageStarted=Date.now()}}
function openPage(name){
 name=safe(name);if(!name||page===name)return;
 flushPage();page=name;pageStarted=Date.now();track('page','view',name);
}
function openGame(name){name=safe(name);if(!name)return;if(games.has(name))closeGame(name);games.set(name,Date.now());track('game','open',name);}
function closeGame(name){name=safe(name);const at=games.get(name);if(!at)return;const n=elapsed(at);if(n>=1)track('game','duration',name,n);games.delete(name);}
function resultGame(name,outcome){track('game',safe(outcome),name);}
function radioState(playing,station){station=safe(station);if(!playing){if(radio&&radioStarted){const n=elapsed(radioStarted);if(n>=1)track('radio','listen',radio,n);}radio='';radioStarted=0;return;}
 if(!station)return;if(radio===station)return;
 radioState(false,'');radio=station;radioStarted=Date.now();track('radio','play',station);
}
function flush(){flushPage();if(radio&&radioStarted){const n=elapsed(radioStarted);if(n>=1)track('radio','listen',radio,n);radioStarted=Date.now();}
 for(const [name,at] of games){const n=elapsed(at);if(n>=1)track('game','duration',name,n);games.set(name,Date.now())}}
window.HellxTelemetry={track,page:openPage,gameStart:openGame,gameEnd:closeGame,gameResult:resultGame,radioState};
document.addEventListener('click',e=>{
 const target=e.target?.closest?.('[data-sumup-click],[data-share],#hellx-invite-button,#hx-home-actions button,#hellx-club button');
 if(!target)return;
 if(target.matches('[data-sumup-click]'))track('action','click','Boutique SumUp');
 else if(target.matches('[data-share]'))track('action','click','Partager un article');
 else if(target.id==='hellx-invite-button')track('action','click','Inviter des amis');
 else {const label=(target.getAttribute('aria-label')||target.textContent||'').toLowerCase();if(/\bsos\b|signal/.test(label))track('action','click','SOS — ouverture du mode');else if(/live|radio/.test(label))track('action','click','Accès Radio LIVE 666');else if(/carte|membre/.test(label))track('action','click','Carte de membre');else if(/tirage|tee-shirt/.test(label))track('action','click','Tirage tee-shirt');else if(/invite|potes|amis/.test(label))track('action','click','Inviter des amis');}
},true);
let radioSelected=false;
function detectRadio(){
 const selected=document.documentElement.classList.contains('hx-radio-selected');
 if(selected===radioSelected)return;radioSelected=selected;
 if(selected)openPage('Radio LIVE 666');
 else{const name=document.querySelector('nav [data-page][aria-current="page"]')?.dataset.page||'accueil';openPage(name);}
}
function init(){
 const nav=document.querySelector('nav [data-page][aria-current="page"]');
 openPage(location.search.includes('article=')?'Article':nav?.dataset.page||'accueil');
 radioSelected=false;detectRadio();
 new MutationObserver(detectRadio).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
setInterval(()=>{if(document.visibilityState==='visible')flush()},60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
window.addEventListener('pagehide',flush);
})();