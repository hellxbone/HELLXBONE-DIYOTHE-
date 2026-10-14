(()=>{
'use strict';
const stations=[
{name:'METAL INTERNATIONAL',url:'https://streams.radiobob.de/bob-metal/mp3-128/streams.radiobob.de/'},
{name:'METALCORE',url:'https://streams.radiobob.de/metalcore/mp3-128/streams.radiobob.de/'},
{name:'NEW METAL',url:'https://stream.starfm.de/newmetal/mp3-128/stream.starfm.de/'}
];
const css=document.createElement('style');
css.textContent=`#hellx-onair{background:linear-gradient(145deg,#0b1410,#050605)!important;border:2px solid #78ff66;border-radius:17px;padding:18px;margin:0 0 20px;color:#fff!important;box-shadow:0 0 20px #57ff572e;text-align:center}#hellx-onair h2{color:#a4ff80!important;margin:0 0 7px;font-size:clamp(28px,7vw,39px);font-weight:900!important}#hellx-onair p{color:#e3eedf!important;margin:9px 0 14px}#hellx-onair button{border:0;border-radius:12px;background:#85ff6f;color:#071008;font-size:20px;font-weight:900;padding:16px 20px;min-height:56px;width:100%;cursor:pointer}#hellx-onair select{display:block;width:100%;max-width:440px;margin:12px auto;padding:12px;background:#15231a!important;color:#fff!important;border:1px solid #85ff6f;border-radius:8px;font-size:16px}#hellx-onair-status{font-size:14px;min-height:22px;color:#bceab4}#hellx-onair small{display:block;margin-top:8px;color:#c4d6bd}`;
document.head.appendChild(css);
const audio=new Audio();audio.preload='none';audio.setAttribute('playsinline','');
let active=false;let index=0;
function state(message){const s=document.getElementById('hellx-onair-status');if(s)s.textContent=message;}
function update(){const b=document.getElementById('hellx-onair-toggle');if(b){b.textContent=active?'■ COUPER ON AIR':'▶ ON AIR — ÉCOUTER';b.setAttribute('aria-pressed',String(active));}}
async function start(){audio.src=stations[index].url;active=true;update();state('Connexion au direct…');try{await audio.play();state('EN DIRECT • '+stations[index].name);}catch(e){active=false;update();state('Lecture bloquée ou flux indisponible. Appuie à nouveau pour réessayer.');}}
function stop(){active=false;audio.pause();audio.removeAttribute('src');audio.load();update();state('Radio à l’arrêt');}
function mount(){
 const app=document.querySelector('#app');if(!app||document.getElementById('hellx-onair'))return;
 const discovery=document.getElementById('hellx-discovery-home');
 if(!discovery)return;
 const div=document.createElement('section');div.id='hellx-onair';div.setAttribute('aria-label','Radio metal en direct');
 div.innerHTML='<h2>🔴 ON AIR</h2><p>Du metal non-stop, en direct dans HELLXBONE. Scènes américaine, allemande et asiatique à découvrir — la programmation dépend des radios diffusées.</p><button type="button" id="hellx-onair-toggle" aria-pressed="false">▶ ON AIR — ÉCOUTER</button><label for="hellx-onair-station" style="display:block;margin-top:13px">Choisir une ambiance</label><select id="hellx-onair-station"><option value="0">Metal international</option><option value="1">Metalcore</option><option value="2">New metal</option></select><div id="hellx-onair-status" role="status">Prêt à diffuser</div><small>Flux audio de radios partenaires externes • Pas de vidéo • Internet nécessaire</small>';
 app.insertBefore(div,discovery);
 div.querySelector('#hellx-onair-toggle').addEventListener('click',()=>active?stop():start());
 div.querySelector('#hellx-onair-station').addEventListener('change',e=>{const was=active;index=Number(e.target.value)||0;stop();if(was)start();});
 update();if(active)state('EN DIRECT • '+stations[index].name);
}
audio.addEventListener('error',()=>{if(active){active=false;update();state('Flux indisponible. Choisis une autre ambiance.');}});
audio.addEventListener('playing',()=>{if(active)state('EN DIRECT • '+stations[index].name)});
const observer=new MutationObserver(()=>{if(document.getElementById('hellx-discovery-home')&&!document.getElementById('hellx-onair'))mount()});
function init(){mount();const app=document.querySelector('#app');if(app)observer.observe(app,{childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();