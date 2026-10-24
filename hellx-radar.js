/* HELLXBONE — radar de membres volontaires, actif seulement quand la page est visible. */
(() => {
'use strict';
const BASE='https://ldibykpitjutratyqqax.supabase.co/rest/v1/rpc/';
const KEY='sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv';
const DEVICE='hellx-club-device-v1';
let active=false,timer=null,busy=false;
const css=document.createElement('style');
css.textContent=`
#hellx-radar{max-width:650px;margin:12px auto 24px;background:linear-gradient(135deg,#041006,#0b1710)!important;color:#dbffe2!important;border:2px solid #39f76c!important;border-radius:17px!important;padding:17px!important;box-shadow:0 0 18px #18ff5944;font:15px system-ui,sans-serif!important}
#hellx-radar *{box-sizing:border-box}
#hellx-radar h2{color:#86ff9d!important;font:bold 23px system-ui!important;margin:0 0 9px!important}
#hellx-radar p{color:#b9e7c3!important;line-height:1.45!important;margin:8px 0!important}
#hellx-radar button{background:#27db60!important;color:#001a08!important;border:0!important;border-radius:9px!important;padding:11px 16px!important;font:bold 15px system-ui!important;cursor:pointer}
#hellx-radar button:disabled{opacity:.55}
#hellx-radar button.hx-off{background:#283a2c!important;color:#e9fff0!important;border:1px solid #87b995!important}
#hellx-radar-status{font-size:13px!important;min-height:20px}
#hellx-radar-list{list-style:none;padding:0;margin:8px 0}
#hellx-radar-list li{padding:10px;margin:6px 0;background:#102816;border-radius:9px;border:1px solid #245b33}
#hellx-radar-list strong{color:#acffba}
`;
document.head.appendChild(css);
function id(){try{return localStorage.getItem(DEVICE)}catch{return null}}
async function rpc(method,body){
 const response=await fetch(BASE+method,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!response.ok)throw new Error('Service radar indisponible ('+response.status+').');
 return response.status===204?null:response.json().catch(()=>null);
}
function ui(){
 let node=document.getElementById('hellx-radar');if(node)return node;
 const main=document.querySelector('main');
 if(!main)return null;
 node=document.createElement('section');node.id='hellx-radar';node.setAttribute('aria-label','Radar à métalleux');
 node.innerHTML='<h2>☠ RADAR À MÉTALLEUX</h2><p>Repère les membres HELLXBONE volontaires à moins de 5 km. Seuls les pseudos et des distances approximatives apparaissent.</p><button id="hellx-radar-toggle" type="button">ACTIVER MON RADAR</button><p id="hellx-radar-status" role="status">Radar désactivé. Ta position n’est pas partagée.</p><ul id="hellx-radar-list" aria-live="polite"></ul><p style="font-size:12px!important">GPS sur accord. La position est arrondie à environ 1 km, masquée aux autres et expire après 2 minutes. Fonctionne uniquement pendant l’ouverture de l’application. Coupe le radar quand tu veux.</p>';
 main.prepend(node);node.querySelector('#hellx-radar-toggle').addEventListener('click',()=>active?stop():start());
 return node;
}
function status(s){const el=document.getElementById('hellx-radar-status');if(el)el.textContent=s}
function display(rows){
 const list=document.getElementById('hellx-radar-list');if(!list)return;list.replaceChildren();
 const valid=Array.isArray(rows)?rows:[];
 if(!valid.length){status('Radar actif — aucun membre volontaire détecté dans les 5 km.');return;}
 status('Radar actif — '+valid.length+' métalleux détecté(s) à proximité.');
 valid.forEach(m=>{
  const li=document.createElement('li'),name=document.createElement('strong');
  name.textContent=String(m.pseudo||'Métalleux').slice(0,20);
  li.append(name,document.createTextNode(' · '+String(m.distance||'à proximité')));
  list.appendChild(li);
 });
}
async function pulse(){
 if(!active||busy||document.hidden)return;
 const member=id();if(!member){status('Inscris ton pseudo avant d’activer le radar.');stop();return}
 if(!navigator.geolocation){status('GPS non disponible sur ce téléphone.');stop();return}
 busy=true;
 try{
 const location=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,timeout:13000,maximumAge:20000}));
 if(!active)return;
 const rows=await rpc('hellx_radar_ping',{p_member_id:member,p_latitude:location.coords.latitude,p_longitude:location.coords.longitude});
 if(active)display(rows);
 }catch(e){if(active)status(e.code===1?'Localisation refusée : autorise le GPS pour utiliser le radar.':'Radar inaccessible : '+(e.message||'Réessaie.'))}
 finally{busy=false}
}
function start(){
 if(active)return;
 if(!id()){status('Choisis d’abord ton pseudo de membre HELLXBONE.');return}
 active=true;const b=document.getElementById('hellx-radar-toggle');b.textContent='COUPER MON RADAR';b.classList.add('hx-off');
 status('Recherche des métalleux et demande de localisation…');
 pulse();timer=setInterval(pulse,35000);
}
function stop(){
 active=false;clearInterval(timer);timer=null;
 const b=document.getElementById('hellx-radar-toggle');if(b){b.textContent='ACTIVER MON RADAR';b.classList.remove('hx-off')}
 document.getElementById('hellx-radar-list')?.replaceChildren();
 status('Radar désactivé. Ta position n’est pas partagée.');
 const member=id();if(member)rpc('hellx_radar_off',{p_member_id:member}).catch(()=>{});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)stop()});
document.addEventListener('DOMContentLoaded',ui);
})();