(function(){
'use strict';
const bands=[
{name:'CRORIF',genre:'Metal underground',query:'CRORIF metal'},
{name:'Unexpected Calibrations',genre:'Post-djent',query:'Unexpected Calibrations Albatross'},
{name:'Tagada Jones',genre:'Punk hardcore',query:'Tagada Jones'},
{name:'LEGBA',genre:'Rock metal',query:'LEGBA rockband Chris Chambers'},
{name:'Rankken',genre:'Thrash / Death metal',query:'Rankken thrash death'},
{name:'Yang Yang',genre:'Rock alternatif',query:'Yang Yang groupe rock'},
{name:'Gojira',genre:'Metal progressif',query:'Gojira metal'},
{name:'Mass Hysteria',genre:'Metal industriel',query:'Mass Hysteria metal'},
{name:'Alcest',genre:'Blackgaze',query:'Alcest'},
{name:'Landmvrks',genre:'Metalcore',query:'LANDMVRKS'},
{name:'Igorrr',genre:'Metal expérimental',query:'Igorrr'},
{name:'Heilung',genre:'Folk expérimental',query:'Heilung band'}
];
const id='hellx-discovery-dialog';
const css=`
#${id}{border:0;max-width:min(96vw,520px);width:100%;max-height:94dvh;overflow:auto;background:#090b09;color:#f4f4f4;border-radius:18px;padding:18px;box-shadow:0 0 0 2px #4dff6a,0 0 50px #1fae4260}
#${id}::backdrop{background:rgba(0,0,0,.88)}
#${id} .wheel-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
#${id} h2{font-size:clamp(22px,6vw,34px);margin:6px 0;color:#77ff86}
#${id} p{color:#ddd;line-height:1.45}
#${id} button{font:inherit;cursor:pointer}
#${id} .wheel-close{background:#252525;color:white;border:1px solid #777;border-radius:7px;padding:7px 12px}
#${id} .wheel-wrap{position:relative;max-width:340px;margin:24px auto 15px}
#${id} .wheel-pointer{position:absolute;top:-18px;left:50%;transform:translateX(-50%);z-index:2;color:#fff;font-size:34px;text-shadow:0 2px 4px black}
#${id} .wheel-disk{aspect-ratio:1;border-radius:50%;border:9px solid #171717;box-shadow:0 0 0 3px #6cfa72,0 0 34px #39ef7450;display:grid;place-items:center;transition:transform 4s cubic-bezier(.13,.8,.14,1);background:conic-gradient(#111 0deg 30deg,#7a1221 30deg 60deg,#133c23 60deg 90deg,#111 90deg 120deg,#7a1221 120deg 150deg,#133c23 150deg 180deg,#111 180deg 210deg,#7a1221 210deg 240deg,#133c23 240deg 270deg,#111 270deg 300deg,#7a1221 300deg 330deg,#133c23 330deg 360deg)}
#${id} .wheel-center{background:#050505;color:#8aff94;border:2px solid #a8ffa3;width:40%;aspect-ratio:1;border-radius:50%;display:grid;place-items:center;text-align:center;font-size:clamp(16px,5vw,25px);font-weight:900;letter-spacing:1px;box-shadow:0 0 20px #000}
#${id} .wheel-spin{display:block;width:100%;margin-top:12px;padding:15px;background:#6dff75;color:#051008;border:0;border-radius:9px;font-weight:900;font-size:19px}
#${id} .wheel-spin:disabled{opacity:.55;cursor:wait}
#${id} .wheel-result{padding:16px;border:1px solid #396c45;background:#111b13;border-radius:12px;margin-top:16px;text-align:center}
#${id} .wheel-result[hidden]{display:none}
#${id} .wheel-result strong{display:block;font-size:25px;color:#8aff93}
#${id} .wheel-result a{display:inline-block;margin-top:10px;padding:12px 18px;background:#f4f4f4;color:#080808;text-decoration:none;border-radius:8px;font-weight:900}
#${id} .wheel-hint{font-size:12px;text-align:center}
`;
let currentAngle=0,spinning=false;
function create(){
 let style=document.getElementById('hellx-discovery-style');if(!style){style=document.createElement('style');style.id='hellx-discovery-style';style.textContent=css;document.head.appendChild(style);}
 let d=document.getElementById(id);if(d)return d;
 d=document.createElement('dialog');d.id=id;d.setAttribute('aria-label','Roulette des découvertes rock metal');
 d.innerHTML='<div class="wheel-head"><h2>☠ ROULETTE METAL</h2><button class="wheel-close" type="button" aria-label="Fermer">✕</button></div><p>Fais tourner la roue des enfers et découvre un groupe à écouter !</p><div class="wheel-wrap"><span class="wheel-pointer" aria-hidden="true">▼</span><div class="wheel-disk" id="hellx-discovery-disk"><span class="wheel-center">HELL<br>XBONE</span></div></div><button class="wheel-spin" type="button">⚡ FAIRE TOURNER LA ROUE</button><div class="wheel-result" hidden aria-live="polite"><strong class="wheel-band"></strong><span class="wheel-genre"></span><div><a class="wheel-listen" target="_blank" rel="noopener noreferrer">▶ ÉCOUTER LE GROUPE ↗</a></div></div><p class="wheel-hint">Écoute via une recherche YouTube. Aucune publicité ni musique intégrée à l’application.</p>';
 document.body.appendChild(d);
 d.querySelector('.wheel-close').addEventListener('click',()=>d.close());
 d.querySelector('.wheel-spin').addEventListener('click',()=>{
  if(spinning)return;spinning=true;
  const btn=d.querySelector('.wheel-spin'),disk=d.querySelector('.wheel-disk'),res=d.querySelector('.wheel-result');
  btn.disabled=true;res.hidden=true;
  const n=Math.floor(Math.random()*bands.length);
  // Le pointeur est en haut : chaque segment fait 30 degrés.
  const normalized=((currentAngle%360)+360)%360;
  const target=(360-((n+.5)*30))%360;
  const delta=(target-normalized+360)%360;
  currentAngle+=1440+delta;
  disk.style.transform='rotate('+currentAngle+'deg)';
  setTimeout(()=>{
    const b=bands[n];d.querySelector('.wheel-band').textContent=b.name;d.querySelector('.wheel-genre').textContent=b.genre;
    d.querySelector('.wheel-listen').href='https://www.youtube.com/results?search_query='+encodeURIComponent(b.query);
    res.hidden=false;btn.disabled=false;spinning=false;
  },4100);
 });
 return d;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-discovery-open]');if(!b)return;e.preventDefault();const d=create();if(!d.open)d.showModal();});
})();