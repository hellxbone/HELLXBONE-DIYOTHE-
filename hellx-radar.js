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

#hellx-radar h2{text-align:center!important;letter-spacing:1px!important}
#hellx-radar .hx-radar-screen{position:relative;width:min(80vw,360px);aspect-ratio:1;margin:14px auto 18px;border:3px solid #69ff95;border-radius:50%;overflow:hidden;background:repeating-radial-gradient(circle at center,transparent 0 19%,#50ee7847 19.25% 19.65%,transparent 19.9% 20%),linear-gradient(90deg,transparent calc(50% - .5px),#51fa655c 50%,transparent calc(50% + .5px)),linear-gradient(0deg,transparent calc(50% - .5px),#51fa655c 50%,transparent calc(50% + .5px)),radial-gradient(circle,#11321c 0%,#06140b 75%,#020704 100%);box-shadow:inset 0 0 40px #30ff573b,0 0 25px #31ff4c4d;isolation:isolate}
#hellx-radar .hx-radar-sweep{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,transparent 0deg,transparent 310deg,#30ff5220 333deg,#61ff695c 353deg,#b3ffb8 359deg,transparent 360deg);animation:hellx-radar-rotate 3s linear infinite;pointer-events:none;z-index:2}
#hellx-radar .hx-radar-sweep::after{content:"";position:absolute;top:50%;left:50%;width:49%;height:2px;background:linear-gradient(90deg,#bcffc2,#5cff72);box-shadow:0 0 10px #60ff87;transform-origin:left center;transform:rotate(-90deg)}
#hellx-radar .hx-radar-center{position:absolute;left:50%;top:50%;width:11px;height:11px;transform:translate(-50%,-50%);border-radius:50%;background:#d2ffda;box-shadow:0 0 12px #78ff8a;z-index:4}
#hellx-radar .hx-radar-dots{position:absolute;inset:0;z-index:3;pointer-events:none}
#hellx-radar .hx-radar-dot{position:absolute;width:12px;height:12px;transform:translate(-50%,-50%);border-radius:50%;background:#b2ffc1;border:1px solid white;box-shadow:0 0 12px 4px #47ff73;animation:hellx-radar-pulse 1.7s infinite;pointer-events:auto}
#hellx-radar .hx-radar-label{position:absolute;top:8%;left:50%;transform:translateX(-50%);font:700 12px system-ui;color:#91ff9f;letter-spacing:2px}
#hellx-radar .hx-radar-range{position:absolute;bottom:8%;left:50%;transform:translateX(-50%);font:700 11px system-ui;color:#91ff9f}
#hellx-radar #hellx-radar-toggle{display:block;margin:12px auto!important}
#hellx-radar #hellx-radar-status{text-align:center!important}
@keyframes hellx-radar-rotate{to{transform:rotate(360deg)}}
@keyframes hellx-radar-pulse{50%{opacity:.35;box-shadow:0 0 18px 7px #47ff73}}
@media(prefers-reduced-motion:reduce){#hellx-radar .hx-radar-sweep,#hellx-radar .hx-radar-dot{animation:none!important}}
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
 node.innerHTML='<h2>☠ RADAR À MÉTALLEUX</h2><p>Repère les membres HELLXBONE volontaires à moins de 5 km. Seuls les pseudos et des distances approximatives apparaissent.</p><div class="hx-radar-screen" role="img" aria-label="Radar circulaire animé, points représentant les membres détectés, position indicative uniquement"><div class="hx-radar-sweep"></div><div class="hx-radar-label">HELLXBONE</div><div class="hx-radar-dots" id="hellx-radar-dots"></div><div class="hx-radar-center"></div><div class="hx-radar-range">PORTÉE 5 KM</div></div><button id="hellx-radar-toggle" type="button">ACTIVER MON RADAR</button><p id="hellx-radar-status" role="status">Radar désactivé. Ta position n’est pas partagée.</p><ul id="hellx-radar-list" aria-live="polite"></ul><p style="font-size:12px!important">GPS sur accord. La position est arrondie à environ 1 km, masquée aux autres et expire après 2 minutes. Fonctionne uniquement pendant l’ouverture de l’application. Coupe le radar quand tu veux.</p>';
 main.prepend(node);node.querySelector('#hellx-radar-toggle').addEventListener('click',()=>active?stop():start());
 return node;
}
function status(s){const el=document.getElementById('hellx-radar-status');if(el)el.textContent=s}
function display(rows){
 const list=document.getElementById('hellx-radar-list');if(!list)return;list.replaceChildren();
 const valid=Array.isArray(rows)?rows:[];
 const dots=document.getElementById('hellx-radar-dots');
 if(dots){dots.replaceChildren();}
 // Le serveur renvoie une tranche de distance, pas un azimut : les points sont schématiques.
 if(dots)valid.slice(0,12).forEach((m,i)=>{
  const near=String(m.distance||'').includes('moins de 2');
  const angle=(i*137.508+32)*Math.PI/180;
  const radius=(near?17:33)+(i%3)*2;
  const dot=document.createElement('span');
  dot.className='hx-radar-dot';
  dot.style.left=(50+radius*Math.cos(angle))+'%';
  dot.style.top=(50+radius*Math.sin(angle))+'%';
  dot.title=String(m.pseudo||'Métalleux').slice(0,20)+' — '+String(m.distance||'à proximité');
  dots.appendChild(dot);
 });
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
 document.getElementById('hellx-radar-dots')?.replaceChildren();
 status('Radar désactivé. Ta position n’est pas partagée.');
 const member=id();if(member)rpc('hellx_radar_off',{p_member_id:member}).catch(()=>{});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)stop()});
document.addEventListener('DOMContentLoaded',ui);
})();