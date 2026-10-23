/* HELLXBONE — La Malédiction : apparitions imprévisibles, opt-in, sans toucher aux autres modules. */
(()=>{'use strict';
if(window.__hellxCurseLoaded)return;window.__hellxCurseLoaded=true;
const PREF='hellx-curse-settings-v1',DAY='hellx-curse-day-v1';
const defaults={enabled:false,sound:false};
function read(k,fallback){try{return JSON.parse(localStorage.getItem(k))||fallback}catch{return fallback}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
let settings={...defaults,...read(PREF,{})},pending=null,showing=false,last=0,interacted=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const css=document.createElement('style');
css.textContent=`
#hx-curse-settings{position:fixed;bottom:14px;left:12px;z-index:10001;background:#070a07;color:#a5ff93;border:1px solid #418c43;border-radius:25px;padding:9px 12px;font:700 12px system-ui;box-shadow:0 0 14px #1c4d20;cursor:pointer}
#hx-curse-dialog{position:fixed;inset:0;z-index:2147483645;background:#000c;display:grid;place-items:center;padding:20px}
#hx-curse-dialog section{box-sizing:border-box;width:min(440px,100%);background:linear-gradient(145deg,#030703,#152014);color:#f8fff6;border:2px solid #6bfa59;border-radius:14px;padding:23px;box-shadow:0 0 35px #25842b}
#hx-curse-dialog h2{color:#adff91;font-size:24px;margin:0 0 12px}
#hx-curse-dialog p{line-height:1.5}#hx-curse-dialog label{display:block;margin:16px 0}
#hx-curse-dialog button{padding:12px;border:1px solid #72d76b;border-radius:8px;background:#244c26;color:#fff;font-weight:800;cursor:pointer;margin:5px}
#hx-curse-dialog button.hx-off{background:#272727;border-color:#777}
#hx-curse-stage{position:fixed;inset:0;z-index:2147483644;display:grid;place-items:center;background:#000;color:#e8ffe1;text-align:center;overflow:hidden;isolation:isolate}
#hx-curse-stage .hx-noise{position:absolute;inset:-15%;background:repeating-linear-gradient(0deg,#0000 0 5px,#56ff451b 6px 7px);animation:hx-curse-glitch .18s steps(3) infinite}
#hx-curse-stage .hx-body{position:relative;z-index:1;width:100%;padding:20px;box-sizing:border-box}
#hx-curse-stage img{display:block;object-fit:contain;width:min(87vw,430px);height:min(58vh,540px);margin:auto;filter:drop-shadow(0 0 25px #57ff34);animation:hx-curse-pounce .42s cubic-bezier(.1,1.5,.3,1) both}
#hx-curse-stage .hx-eyes{font-size:clamp(100px,40vw,220px);color:#8aff63;text-shadow:0 0 55px #39f922;animation:hx-curse-pounce .35s both}
#hx-curse-stage .hx-words{font:900 clamp(20px,6vw,38px)/1.15 system-ui;letter-spacing:1px;text-shadow:0 0 14px #3cff27;margin:12px auto;max-width:520px}
#hx-curse-stage .hx-close{position:absolute;top:12px;right:12px;border:1px solid #999;color:white;background:#161616;border-radius:8px;padding:10px 13px;z-index:3}
#hx-curse-stage.hx-fade{opacity:0;transition:opacity .3s}
@keyframes hx-curse-pounce{from{transform:scale(.06) rotate(-9deg);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes hx-curse-glitch{0%{transform:translate(0)}50%{transform:translate(-2%,2%)}100%{transform:translate(2%,-2%)}}
@media(prefers-reduced-motion:reduce){#hx-curse-stage *{animation:none!important}}
`;
document.head.appendChild(css);
function getPseudo(){try{const m=JSON.parse(localStorage.getItem('hellxbone-member-v1')||'null');return String(m?.name||localStorage.getItem('hellx-riff-player-name')||'').slice(0,20)}catch{return ''}}
function counts(){const date=new Date().toLocaleDateString('en-CA');let d=read(DAY,{date,n:0});if(d.date!==date)d={date,n:0};return d}
function eligible(){if(!settings.enabled||showing||document.hidden||document.documentElement.classList.contains('hellx-gate-pending'))return false;
if(document.querySelector('#hellx-member-gate,#hx-curse-dialog,.hellx-shake-portal'))return false;
if(document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))return false;
return counts().n<2 && Date.now()-last>180000;}
let scream=null;
function sound(){if(!settings.sound||!interacted)return;try{
scream=scream||new Audio('https://upload.wikimedia.org/wikipedia/commons/e/e6/Nick121087_-_Demonic_Woman_Scream_%28cc0%29_%28freesound%29.mp3');
scream.volume=.65;scream.currentTime=0;scream.play().catch(()=>{});
}catch{}}
function apparition(){
if(!eligible())return;showing=true;last=Date.now();let c=counts();c.n++;write(DAY,c);
const scenes=[
['JE TE VOIS','Les ténèbres connaissent ton pseudo.'],
['TU AS OUVERT LA PORTE','L’enfer sait maintenant où te trouver.'],
['HELLX EST LÀ','Il n’y a plus de retour.'],
['TU ES ENCORE LÀ ?','Je t’attendais…']
];const index=Math.floor(Math.random()*scenes.length),scene=scenes[index],pseudo=getPseudo();
const stage=document.createElement('div');stage.id='hx-curse-stage';stage.setAttribute('role','dialog');stage.setAttribute('aria-label','Apparition horrifique HELLXBONE');
const noise=document.createElement('div');noise.className='hx-noise';stage.append(noise);
const body=document.createElement('div');body.className='hx-body';
if(index===0){const eyes=document.createElement('div');eyes.className='hx-eyes';eyes.textContent='◉  ◉';body.append(eyes)}
else{const img=document.createElement('img');img.alt='Créature HELLXBONE';img.src='hellxbone-shake-neon.webp';img.onerror=()=>{img.replaceWith(document.createTextNode('☠'))};body.append(img)}
const title=document.createElement('div');title.className='hx-words';title.textContent=(pseudo&&index===0?pseudo.toUpperCase()+'… ':'')+scene[0];body.append(title);
const caption=document.createElement('p');caption.textContent=scene[1];body.append(caption);stage.append(body);
const close=document.createElement('button');close.className='hx-close';close.textContent='FERMER ×';close.setAttribute('aria-label','Fermer l’apparition');stage.append(close);
document.body.append(stage);sound();if(!reduced)try{navigator.vibrate?.([75,60,130])}catch{}
let done=false;const finish=()=>{if(done)return;done=true;scream?.pause();stage.classList.add('hx-fade');setTimeout(()=>{stage.remove();showing=false},350)};
close.addEventListener('click',finish);setTimeout(finish,reduced?1600:4500);
}
function schedule(){clearTimeout(pending);pending=null;if(!settings.enabled)return;
pending=setTimeout(()=>{if(eligible())apparition();schedule()},(4+Math.random()*12)*60000)}
function dialog(first=false){if(document.getElementById('hx-curse-dialog'))return;
const overlay=document.createElement('div');overlay.id='hx-curse-dialog';const section=document.createElement('section');
const h=document.createElement('h2');h.textContent='LA MALÉDICTION HELLXBONE';section.append(h);
const p=document.createElement('p');p.textContent='Des apparitions horrifiques imprévisibles peuvent surgir lorsque tu utilises l’application. Désactive-les à tout moment. Aucun effet lorsque l’application est fermée.';section.append(p);
const warning=document.createElement('p');warning.textContent='Attention : sursauts, cris et mouvements visuels. Déconseillé aux personnes sensibles.';section.append(warning);
const label=document.createElement('label');const check=document.createElement('input');check.type='checkbox';check.checked=settings.sound;label.append(check,document.createTextNode(' Autoriser les cris horrifiques (son)'));section.append(label);
const on=document.createElement('button');on.textContent='ACTIVER LA MALÉDICTION';section.append(on);
const off=document.createElement('button');off.textContent=first?'NON MERCI':'DÉSACTIVER';off.className='hx-off';section.append(off);overlay.append(section);document.body.append(overlay);
on.onclick=()=>{settings={enabled:true,sound:check.checked};write(PREF,settings);overlay.remove();schedule()};
off.onclick=()=>{settings={enabled:false,sound:false};write(PREF,settings);overlay.remove();clearTimeout(pending)};
}
function init(){
const control=document.createElement('button');control.id='hx-curse-settings';control.textContent='☠ MODE HORREUR';control.title='Activer ou désactiver les apparitions aléatoires';
control.addEventListener('click',()=>dialog(false));document.body.append(control);
document.addEventListener('pointerdown',()=>{interacted=true},{passive:true});document.addEventListener('keydown',()=>{interacted=true},{passive:true});
if(localStorage.getItem(PREF)===null){setTimeout(()=>{if(!document.documentElement.classList.contains('hellx-gate-pending'))dialog(true)},14000)}
else schedule();
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!showing)schedule()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();