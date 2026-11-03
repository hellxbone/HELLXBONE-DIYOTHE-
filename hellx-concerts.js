/* HELLXBONE CLUB — agenda concerts, préférences locales et passerelle rencontres.
   Aucune localisation n'est envoyée sans action volontaire de l'utilisateur. */
(()=>{'use strict';
if(window.HELLX_CONCERTS)return;
const PREF='hx-concert-prefs-v1',EVENTS='./concerts.json';
const read=()=>{try{return JSON.parse(localStorage.getItem(PREF)||'{}')}catch{return {}}};
const save=x=>{try{localStorage.setItem(PREF,JSON.stringify(x))}catch{}};
const css=document.createElement('style');
css.textContent=`#hx-concerts{max-width:680px;margin:14px auto 22px;padding:15px;background:#080d0a;color:#ecfff0;border:1px solid #338a48;border-radius:12px;font:14px system-ui}#hx-concerts h2{color:#7dff92;font:900 22px system-ui;margin:0 0 12px}#hx-concerts label{display:block;font-size:13px;margin:8px 0}#hx-concerts input,#hx-concerts select{box-sizing:border-box;min-height:42px;width:100%;background:#101b13;color:#fff;border:1px solid #4b8656;border-radius:7px;padding:7px}#hx-concerts button{background:#52e87e;border:0;border-radius:7px;min-height:42px;padding:8px 12px;color:#07160a;font-weight:800;cursor:pointer}#hx-concerts .hx-concert-filters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#hx-concerts .hx-concert-card{border-top:1px solid #234a2d;padding:13px 0}#hx-concerts .hx-concert-card strong{display:block;color:#aaffae;font-size:17px}#hx-concerts .hx-concert-card p{margin:5px 0 9px}#hx-concerts .hx-concert-card a{color:#baffc5;display:inline-block;margin-right:12px}#hx-concerts .hx-concert-card button{margin:5px 8px 5px 0}#hx-concerts details{margin:12px 0}#hx-concerts summary{cursor:pointer;color:#baffc5;font-weight:700}#hx-concerts .hx-small{color:#b7caba;font-size:12px}#hx-concerts[hidden]{display:none!important}@media(max-width:390px){#hx-concerts .hx-concert-filters{grid-template-columns:1fr}}`;
document.head.append(css);
let records=[],shown=false,loading=false,host=null;
const safeDate=x=>/^20\d\d-\d\d-\d\d$/.test(x||'')?x:'';
function valid(e){return e&&safeDate(e.date)&&e.artist&&e.city&&/^https:\/\//i.test(e.source||'')&&new Date(e.date+'T23:59:59')>=new Date()}
function unique(events){const s=new Set();return events.filter(valid).filter(e=>{const k=[e.date,e.artist,e.city].join('|').toLowerCase();if(s.has(k))return false;s.add(k);return true}).sort((a,b)=>a.date.localeCompare(b.date))}
async function load(){if(loading)return;loading=true;try{const r=await fetch(EVENTS+'?v='+Math.floor(Date.now()/3600000),{cache:'no-store'});if(!r.ok)throw Error('agenda');const j=await r.json();records=unique(j.events||[])}catch(e){records=[]}finally{loading=false;draw()}}
const element=(name,content)=>{const n=document.createElement(name);if(content!==undefined)n.textContent=content;return n};
function prefs(){const p=read();return {city:String(p.city||''),department:String(p.department||''),style:String(p.style||''),alerts:!!p.alerts}}
function draw(){if(!host||!host.isConnected)return;const p=prefs();const slot=host.querySelector('#hx-concert-list');slot.replaceChildren();
 const filtered=records.filter(e=>(!p.city||e.city.toLocaleLowerCase('fr').includes(p.city.toLocaleLowerCase('fr')))&&(!p.department||String(e.department||'')===p.department)&&(!p.style||String(e.genre||'').toLocaleLowerCase('fr').includes(p.style.toLocaleLowerCase('fr'))));
 const count=host.querySelector('#hx-concert-count');count.textContent=filtered.length+' concert(s) à venir dans le catalogue';
 if(!filtered.length){slot.append(element('p','Aucune date correspondante pour le moment. Essaie sans filtre.'));return}
 filtered.slice(0,80).forEach(e=>{const card=element('article');card.className='hx-concert-card';card.append(element('strong',e.artist),element('p',new Date(e.date+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+' · '+e.city+(e.venue?' · '+e.venue:'')));
 const src=element('a','Voir l’annonce');src.href=e.source;src.target='_blank';src.rel='noopener noreferrer';card.append(src);
 if(/^https:\/\//.test(e.tickets||'')){const a=element('a','Billetterie');a.href=e.tickets;a.rel='noopener noreferrer';a.target='_blank';card.append(a)}
 const meet=element('button','RASSEMBLER LA HORDE');meet.type='button';meet.addEventListener('click',()=>{document.querySelector('#hx-home-actions [data-hx-section="horde"]')?.click();setTimeout(()=>{const open=document.getElementById('hellx-meet-open');open?.click();const place=document.getElementById('hx-meet-place');if(place){place.value=[e.venue,e.city].filter(Boolean).join(' — ');place.dispatchEvent(new Event('input',{bubbles:true}))}const when=document.getElementById('hx-meet-when');if(when)when.value=e.date+'T19:00';document.getElementById('hellx-meet')?.scrollIntoView({behavior:'smooth',block:'start'})},150)});card.append(meet);slot.append(card)});
}
function mount(){const app=document.getElementById('app');if(!app)return;const anchor=document.getElementById('hx-concert-news');if(!anchor)return;
 if(host?.isConnected)return;host=element('section');host.id='hx-concerts';const p=prefs();host.innerHTML='<h2>CONCERTS · RASSEMBLE TA HORDE</h2><p class="hx-small">Dates à venir, lieux et annonces vérifiables. Filtres facultatifs, sans GPS obligatoire.</p><div class="hx-concert-filters"><label>Ville<input id="hx-filter-city" maxlength="60" placeholder="Ex. Nantes"></label><label>Département<input id="hx-filter-department" maxlength="3" placeholder="Ex. 44"></label><label>Style<input id="hx-filter-style" maxlength="40" placeholder="Ex. metal"></label><label>Alertes souhaitées<select id="hx-filter-alerts"><option value="no">Non</option><option value="yes">Oui, mémoriser mon choix</option></select></label></div><p class="hx-small" id="hx-alert-note">Les préférences sont enregistrées sur cet appareil. Les alertes push ciblées exigent encore une activation serveur.</p><p class="hx-small" id="hx-concert-count">Chargement…</p><div id="hx-concert-list"></div>';
 anchor.insertAdjacentElement('afterend',host);
 for(const [id,key] of [['hx-filter-city','city'],['hx-filter-department','department'],['hx-filter-style','style']]){const input=host.querySelector('#'+id);input.value=p[key];input.addEventListener('input',()=>{const next=prefs();next[key]=input.value.trim();save(next);draw()})}
 const alerts=host.querySelector('#hx-filter-alerts');alerts.value=p.alerts?'yes':'no';alerts.addEventListener('change',()=>{const next=prefs();next.alerts=alerts.value==='yes';save(next)});
 draw();load();
}
let pending=false;function schedule(){if(pending)return;pending=true;setTimeout(()=>{pending=false;mount()},70)}
function init(){schedule();const app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true});document.addEventListener('click',e=>{if(e.target.closest('nav [data-page="accueil"]'))schedule()})}
window.HELLX_CONCERTS={refresh:load,preferences:prefs};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();