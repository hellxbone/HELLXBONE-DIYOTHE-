/* HELLXBONE : fréquentation anonyme, durée active des sessions (sans pseudo ni IP stockée). */
(function(){
'use strict';
if(!window.crypto || !crypto.randomUUID || !window.fetch) return;
const KEY='hellx-analytics-visitor-v1';
let visitor;
try {
 visitor=localStorage.getItem(KEY);
 if(!visitor || !/^[0-9a-f-]{36}$/i.test(visitor)){visitor=crypto.randomUUID();localStorage.setItem(KEY,visitor);}
} catch(e){visitor=crypto.randomUUID();}
const visit=crypto.randomUUID();
const endpoint='https://ldibykpitjutratyqqax.supabase.co/rest/v1/hellx_visit_events';
const apikey='sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv';
let activeMs=0, since=document.visibilityState==='visible'?Date.now():null, lastSent=-1;
function seconds(){return Math.min(86400,Math.floor((activeMs+(since===null?0:Date.now()-since))/1000));}
function send(){
 const s=seconds(); if(s===lastSent)return;
 lastSent=s;
 fetch(endpoint,{method:'POST',keepalive:true,headers:{'apikey':apikey,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({visit_id:visit,visitor_id:visitor,active_seconds:s})}).catch(()=>{lastSent=-1;});
}
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='hidden'){
  if(since!==null){activeMs+=Date.now()-since;since=null;}
  send();
 } else if(since===null){since=Date.now();}
});
window.addEventListener('pagehide',()=>{if(since!==null){activeMs+=Date.now()-since;since=null;}send();});
send();
setInterval(()=>{if(document.visibilityState==='visible')send();},30000);
})();