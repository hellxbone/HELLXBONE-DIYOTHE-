/* HELLXBONE — sessions actives. Liaison au membre uniquement avec son accord. */
(function(){
'use strict';
if(!window.crypto || !crypto.randomUUID || !window.fetch)return;
const VISITOR='hellx-analytics-visitor-v1';
const CONSENT='hellx-member-stats-consent-v1';
const DEVICE='hellx-club-device-v1';
const MEMBER='hellxbone-member-v1';
const endpoint='https://ldibykpitjutratyqqax.supabase.co/rest/v1/hellx_visit_events';
const apikey='sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv';
const validUUID=s=>typeof s==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
let visitor=get(VISITOR);
if(!validUUID(visitor)){visitor=crypto.randomUUID();set(VISITOR,visitor);}
const visit=crypto.randomUUID();
let activeMs=0,since=document.visibilityState==='visible'?Date.now():null,lastSent=-1,lastMember='';
function seconds(){return Math.min(86400,Math.floor((activeMs+(since===null?0:Date.now()-since))/1000));}
function member(){
 if(get(CONSENT)!=='yes')return null;
 let record;try{record=JSON.parse(get(MEMBER)||'null')}catch(e){}
 const id=get(DEVICE);
 return record && record.synced && validUUID(id)?id:null;
}
function send(){
 const s=seconds(),id=member();
 if(s===lastSent && (id||'')===lastMember)return;
 lastSent=s;lastMember=id||'';
 const payload={visit_id:visit,visitor_id:visitor,active_seconds:s};
 if(id)payload.member_id=id;
 fetch(endpoint,{method:'POST',keepalive:true,headers:{apikey,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(payload)}).then(r=>{if(!r.ok)lastSent=-1}).catch(()=>{lastSent=-1});
}
function consentBanner(){
 if(get(CONSENT)!==null || !get(DEVICE))return;
 let record;try{record=JSON.parse(get(MEMBER)||'null')}catch(e){}
 if(!record || !record.synced)return;
 if(document.getElementById('hellx-stats-consent'))return;
 const wrap=document.createElement('aside');
 wrap.id='hellx-stats-consent';
 wrap.setAttribute('role','group');
 wrap.setAttribute('aria-label','Mes statistiques de fréquentation');
 wrap.style.cssText='position:fixed;bottom:12px;left:12px;right:12px;max-width:540px;margin:auto;z-index:2147483600;background:#121612;color:white;border:2px solid #91ff52;border-radius:14px;padding:16px;box-shadow:0 2px 30px #000;font:15px/1.5 system-ui';
 const label=document.createElement('p');
 label.textContent='HELLXBONE : acceptes-tu que ton temps de visite soit associé à ton pseudo pour les statistiques privées du club ? C’est facultatif. Sans accord, les visites restent anonymes.';
 label.style.margin='0 0 12px';
 const yes=document.createElement('button'),no=document.createElement('button');
 yes.textContent='J’accepte';no.textContent='Non merci';
 for(const b of [yes,no])b.style.cssText='padding:10px 16px;margin:3px;border-radius:8px;border:1px solid #91ff52;font-weight:bold;cursor:pointer';
 yes.style.background='#91ff52';no.style.background='#292929';no.style.color='#fff';
 yes.addEventListener('click',()=>{set(CONSENT,'yes');wrap.remove();send();});
 no.addEventListener('click',()=>{set(CONSENT,'no');wrap.remove();send();});
 wrap.append(label,yes,no);document.body.append(wrap);
}
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='hidden'){if(since!==null){activeMs+=Date.now()-since;since=null;}send();}
 else if(since===null){since=Date.now();consentBanner();}
});
window.addEventListener('pagehide',()=>{if(since!==null){activeMs+=Date.now()-since;since=null;}send();});
window.addEventListener('hellx-member-synced',()=>{consentBanner();send();});
document.addEventListener('DOMContentLoaded',()=>{consentBanner();});
send();
setInterval(()=>{if(document.visibilityState==='visible')send();},30000);
})();
