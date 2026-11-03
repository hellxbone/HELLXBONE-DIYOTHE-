/* HELLXBONE CLUB — agenda concerts, préférences locales et passerelle rencontres.
   Aucune localisation n'est envoyée sans action volontaire de l'utilisateur. */
(()=>{'use strict';
if(window.HELLX_CONCERTS)return;
const PREF='hx-concert-prefs-v1',EVENTS='./concerts.json';
const API='https://ldibykpitjutratyqqax.supabase.co',KEY='sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv';
const read=()=>{try{return JSON.parse(localStorage.getItem(PREF)||'{}')}catch{return {}}};
const save=x=>{try{localStorage.setItem(PREF,JSON.stringify(x))}catch{}};
const css=document.createElement('style');
css.textContent=`#hx-concerts{max-width:680px;margin:14px auto 22px;padding:15px;background:#080d0a;color:#ecfff0;border:1px solid #338a48;border-radius:12px;font:14px system-ui}#hx-concerts h2{color:#7dff92;font:900 22px system-ui;margin:0 0 12px}#hx-concerts label{display:block;font-size:13px;margin:8px 0}#hx-concerts input,#hx-concerts select{box-sizing:border-box;min-height:42px;width:100%;background:#101b13;color:#fff;border:1px solid #4b8656;border-radius:7px;padding:7px}#hx-concerts button{background:#52e87e;border:0;border-radius:7px;min-height:42px;padding:8px 12px;color:#07160a;font-weight:800;cursor:pointer}#hx-concerts .hx-concert-filters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#hx-concerts .hx-concert-card{border-top:1px solid #234a2d;padding:13px 0}#hx-concerts .hx-concert-card strong{display:block;color:#aaffae;font-size:17px}#hx-concerts .hx-concert-card p{margin:5px 0 9px}#hx-concerts .hx-concert-card a{color:#baffc5;display:inline-block;margin-right:12px}#hx-concerts .hx-concert-card button{margin:5px 8px 5px 0}#hx-concerts details{margin:12px 0}#hx-concerts summary{cursor:pointer;color:#baffc5;font-weight:700}#hx-concerts .hx-small{color:#b7caba;font-size:12px}#hx-concerts[hidden]{display:none!important}@media(max-width:390px){#hx-concerts .hx-concert-filters{grid-template-columns:1fr}}`;
document.head.append(css);
let records=[],shown=false,loading=false,host=null,position=null,radiusKm=50;
const safeDate=x=>/^20\d\d-\d\d-\d\d$/.test(x||'')?x:'';
function valid(e){return e&&safeDate(e.date)&&e.artist&&e.city&&(/https:\/\//i.test(e.source||'')||e.verified===true)&&new Date(e.date+'T23:59:59')>=new Date()}
function unique(events){const s=new Set();return events.filter(valid).filter(e=>{const k=[e.date,e.artist,e.city].join('|').toLowerCase();if(s.has(k))return false;s.add(k);return true}).sort((a,b)=>a.date.localeCompare(b.date))}
async function load(){if(loading)return;loading=true;
 const results=await Promise.allSettled([
 fetch(EVENTS+'?v='+Math.floor(Date.now()/3600000),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('feed');return r.json()}).then(j=>j.events||[]),
 fetch(API+'/rest/v1/hellx_concerts?select=id,title,venue,city,department,event_date,genre,latitude,longitude,ticket_url,source_url&published=eq.true&event_date=gte.'+encodeURIComponent(new Date().toISOString())+'&order=event_date.asc&limit=500',
 {headers:{apikey:KEY},cache:'no-store'}).then(r=>{if(!r.ok)throw Error('server concerts '+r.status);return r.json()}).then(rows=>rows.map(e=>({id:e.id,date:new Date(e.event_date).toLocaleDateString('sv-SE',{timeZone:'Europe/Paris'}),artist:e.title,city:e.city,venue:e.venue,department:e.department,genre:e.genre||'',source:e.source_url||'',tickets:e.ticket_url||'',verified:true,lat:e.latitude,lon:e.longitude})))
 ]);
 const all=results.flatMap(x=>x.status==='fulfilled'?x.value:[]);
 records=unique(all);loading=false;draw();
}
const element=(name,content)=>{const n=document.createElement(name);if(content!==undefined)n.textContent=content;return n};
function prefs(){const p=read();return {city:String(p.city||''),department:String(p.department||''),style:String(p.style||''),alerts:!!p.alerts}}
function distanceKm(a,b,c,d){const rad=Math.PI/180,dl=(d-b)*rad,dp=(c-a)*rad,h=Math.sin(dp/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(dl/2)**2;return 12742*Math.asin(Math.min(1,Math.sqrt(h)))}
function draw(){if(!host||!host.isConnected)return;const p=prefs();const slot=host.querySelector('#hx-concert-list');slot.replaceChildren();
 const filtered=records.filter(e=>(!position||!e.lat||!e.lon||distanceKm(position.lat,position.lon,e.lat,e.lon)<=radiusKm)&&(!p.city||e.city.toLocaleLowerCase('fr').includes(p.city.toLocaleLowerCase('fr')))&&(!p.department||String(e.department||'')===p.department)&&(!p.style||String(e.genre||'').toLocaleLowerCase('fr').includes(p.style.toLocaleLowerCase('fr'))));
 const count=host.querySelector('#hx-concert-count');count.textContent=filtered.length+' concert(s) à venir dans le catalogue';
 if(!filtered.length){slot.append(element('p','Aucune date correspondante pour le moment. Essaie sans filtre.'));return}
 filtered.slice(0,80).forEach(e=>{const card=element('article');card.className='hx-concert-card';card.append(element('strong',e.artist),element('p',new Date(e.date+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+' · '+e.city+(e.venue?' · '+e.venue:'')));
 if(/^https:\/\//i.test(e.source||'')){const src=element('a','Voir l’annonce');src.href=e.source;src.target='_blank';src.rel='noopener noreferrer';card.append(src)}
 else if(e.verified){card.append(element('span','Concert publié dans le catalogue HELLXBONE · '))}
 if(/^https:\/\//.test(e.tickets||'')){const a=element('a','Billetterie');a.href=e.tickets;a.rel='noopener noreferrer';a.target='_blank';card.append(a)}
 const meet=element('button','RASSEMBLER LA HORDE');meet.type='button';meet.addEventListener('click',()=>{document.querySelector('#hx-home-actions [data-hx-section="horde"]')?.click();setTimeout(()=>{const open=document.getElementById('hellx-meet-open');open?.click();const place=document.getElementById('hx-meet-place');if(place){place.value=[e.venue,e.city].filter(Boolean).join(' — ');place.dispatchEvent(new Event('input',{bubbles:true}))}const when=document.getElementById('hx-meet-when');if(when)when.value=e.date+'T19:00';document.getElementById('hellx-meet')?.scrollIntoView({behavior:'smooth',block:'start'})},150)});card.append(meet);slot.append(card)});
}
function mount(){const app=document.getElementById('app');if(!app)return;const anchor=document.getElementById('hx-concert-news');if(!anchor)return;
 if(host?.isConnected)return;host=element('section');host.id='hx-concerts';const p=prefs();host.innerHTML='<h2>CONCERTS · RASSEMBLE TA HORDE</h2><p class="hx-small">Dates à venir, lieux et annonces vérifiables. Filtres facultatifs, sans GPS obligatoire.</p><div class="hx-concert-filters"><label>Ville<input id="hx-filter-city" maxlength="60" placeholder="Ex. Nantes"></label><label>Département<input id="hx-filter-department" maxlength="3" placeholder="Ex. 44"></label><label>Style<input id="hx-filter-style" maxlength="40" placeholder="Ex. metal"></label><label>Alertes souhaitées<select id="hx-filter-alerts"><option value="no">Non</option><option value="yes">Oui, mémoriser mon choix</option></select></label></div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px"><button type="button" id="hx-concert-gps">CONCERTS AUTOUR DE MOI</button><label style="flex:1;min-width:120px">Rayon<select id="hx-filter-radius"><option value="25">25 km</option><option value="50">50 km</option><option value="100">100 km</option></select></label></div><p id="hx-concert-gps-status" class="hx-small">Le GPS reste désactivé tant que tu ne le demandes pas.</p><button type="button" id="hx-save-concert-alerts" style="margin-top:10px">ENREGISTRER MES ALERTES CONCERTS</button><p class="hx-small" id="hx-alert-note" role="status">Les alertes nécessitent ton autorisation de notification. Tu peux les désactiver à tout moment.</p><p class="hx-small" id="hx-concert-count">Chargement…</p><div id="hx-concert-list"></div>';
 anchor.insertAdjacentElement('afterend',host);
 for(const [id,key] of [['hx-filter-city','city'],['hx-filter-department','department'],['hx-filter-style','style']]){const input=host.querySelector('#'+id);input.value=p[key];input.addEventListener('input',()=>{const next=prefs();next[key]=input.value.trim();save(next);draw()})}
 host.querySelector('#hx-filter-radius').addEventListener('change',e=>{radiusKm=Number(e.target.value)||50;draw()});
 host.querySelector('#hx-concert-gps').addEventListener('click',()=>{
  const status=host.querySelector('#hx-concert-gps-status');
  if(position){position=null;status.textContent='Filtre GPS désactivé.';host.querySelector('#hx-concert-gps').textContent='CONCERTS AUTOUR DE MOI';draw();return}
  if(!navigator.geolocation){status.textContent='GPS indisponible.';return}
  status.textContent='Demande de position…';
  navigator.geolocation.getCurrentPosition(p=>{position={lat:p.coords.latitude,lon:p.coords.longitude};status.textContent='Filtre géographique actif · rayon de '+radiusKm+' km. Position non enregistrée.';host.querySelector('#hx-concert-gps').textContent='DÉSACTIVER LE GPS';draw()},()=>{status.textContent='Position refusée ou indisponible. Utilise les filtres ville/département.'},{enableHighAccuracy:false,timeout:15000,maximumAge:600000});
 });
 const alerts=host.querySelector('#hx-filter-alerts');alerts.value=p.alerts?'yes':'no';alerts.addEventListener('change',()=>{const next=prefs();next.alerts=alerts.value==='yes';save(next)});
 host.querySelector('#hx-save-concert-alerts').addEventListener('click',saveAlertPrefs);
 draw();load();
}
async function saveAlertPrefs(){
 const status=host?.querySelector('#hx-alert-note'),btn=host?.querySelector('#hx-save-concert-alerts');if(!status||!btn)return;
 btn.disabled=true;
 const p=prefs();
 try{
  if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))throw Error('Notifications non compatibles avec ce navigateur.');
  if(p.alerts&&Notification.permission!=='granted'){const allowed=await Notification.requestPermission();if(allowed!=='granted')throw Error('Autorisation de notification refusée.')}
  const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
  let sub=await reg.pushManager.getSubscription();
  if(!sub&&p.alerts){
   const cfg=await fetch(API+'/functions/v1/hellx-push?action=config');if(!cfg.ok)throw Error('Configuration push indisponible.');
   const settings=await cfg.json();const str=atob(settings.publicKey.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(settings.publicKey.length/4)*4,'='));
   sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(str,c=>c.charCodeAt(0))});
  }
  if(!sub){status.textContent='Alertes désactivées. Aucun abonnement actif.';return}
  const subscription=sub.toJSON();
  const subscribe=await fetch(API+'/functions/v1/hellx-push?action=subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription})});
  if(!subscribe.ok)throw Error('Abonnement aux notifications indisponible.');
  const genres=p.style.trim()?[p.style.trim()]:[],departments=p.department.trim()?[p.department.trim()]:[];
  const result=await fetch(API+'/functions/v1/hellx-concert-alerts?action=save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription,enabled:p.alerts,genres,departments})});
  if(!result.ok)throw Error('Impossible de sauvegarder les préférences ('+result.status+').');
  status.textContent=p.alerts?'Alertes concerts activées pour tes filtres.':'Alertes concerts désactivées.';
 }catch(e){status.textContent=e.message||'Erreur de connexion.'}
 finally{btn.disabled=false}
}
let pending=false;function schedule(){if(pending)return;pending=true;setTimeout(()=>{pending=false;mount()},70)}
function init(){schedule();const app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true});document.addEventListener('click',e=>{if(e.target.closest('nav [data-page="accueil"]'))schedule()})}
window.HELLX_CONCERTS={refresh:load,preferences:prefs};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();