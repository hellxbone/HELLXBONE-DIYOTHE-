/* HELLXBONE UX — navigation mobile simplifiée, modules existants conservés. */
(()=>{'use strict';
const style=document.createElement('style');
style.textContent=`
nav[aria-label="Navigation principale"]{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:7px!important;padding:8px!important;overflow:visible!important;background:#080e0a!important;position:sticky!important;top:0!important;z-index:90!important;align-items:stretch!important}
nav[aria-label="Navigation principale"]{width:100%!important;box-sizing:border-box!important;justify-items:stretch!important;direction:ltr!important}
nav[aria-label="Navigation principale"] > button{box-sizing:border-box!important;justify-self:stretch!important;align-self:center!important;flex:none!important;max-width:100%!important;min-width:0!important;position:relative!important;left:auto!important;right:auto!important;translate:none!important;text-align:center!important}
nav[aria-label="Navigation principale"] button{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:64px!important;min-height:64px!important;padding:0!important;margin:0!important;min-width:0!important;font-family:"Noto Color Emoji","Segoe UI Emoji",system-ui!important;font-size:clamp(31px,8.5vw,42px)!important;font-weight:400!important;line-height:1!important;letter-spacing:0!important;text-indent:0!important;transform:none!important;border-radius:12px!important;flex:1!important}
#hx-quick-nav{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:9px 12px;background:#0a160e;border-bottom:1px solid #39784c}
#hx-quick-nav button{display:flex;align-items:center;justify-content:center;min-height:62px;padding:4px;border:1px solid #4ed66f;background:#15321c;color:#d3ffe0;border-radius:10px;font:900 clamp(34px,8vw,44px)/1 system-ui;cursor:pointer}
#hx-quick-nav button[aria-pressed=true]{background:#59e479;color:#03200b}
#hx-home-hub{font:15px system-ui;color:#e7ffed;background:linear-gradient(160deg,#07180d,#0c100d);border-radius:14px;border:1px solid #39784c;padding:14px;margin-bottom:16px}
#hx-home-hub h2{color:#97ffae!important;font:900 25px system-ui!important;text-align:center;margin:5px 0}
#hx-home-hub p{color:#ccedcf!important;text-align:center}
#hx-home-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:13px 0}
#hx-home-actions button{display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;min-height:82px;background:#14351e;border:1px solid #5ce67c;border-radius:12px;color:#e3ffea;font:900 15px system-ui;padding:12px 8px;cursor:pointer}
#hx-home-actions button small{font:12px system-ui;color:#bfe7c9}
#hx-home-actions button[aria-pressed=true]{background:#4fe378;color:#092311}
#hx-home-actions button[aria-pressed=true] small{color:#103d20}
#hx-radio-panel,#hx-horde-panel{min-width:0}
#hx-radio-panel .hx-eq{display:block!important;visibility:visible!important;position:relative!important;opacity:1!important;min-height:115px!important;margin:12px 0!important;padding:12px!important;border:2px solid #60fb79!important;background:#061b0c!important;color:#baffc2!important}
#hx-radio-panel .hx-eq-sliders{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}
#hx-radio-panel .hx-eq-sliders input{width:100%!important;display:block!important}

html:not(.hx-radio-selected) #hellx-onair,
html:not(.hx-radio-selected) #hx-radio-panel{display:none!important}
html:not(.hx-radio-selected) #hx-radio-panel *{visibility:hidden!important}
#hx-radio-panel[hidden],#hx-horde-panel[hidden]{display:none!important}
#hx-horde-panel #hellx-meet,#hx-horde-panel #hellx-radar{margin:12px auto!important}
@media(max-width:380px){#hx-home-actions button{font-size:13px}}
`;document.head.appendChild(style);
let selected='home';
document.documentElement.classList.remove('hx-radio-selected');
// L'accueil ne doit jamais conserver le lecteur radio affiché après un retour par la maison.
document.addEventListener('click',event=>{
 const home=event.target.closest('nav[aria-label="Navigation principale"] [data-page="accueil"]');
 if(home){selected='home';document.documentElement.classList.remove('hx-radio-selected');document.getElementById('hx-radio-panel')?.setAttribute('hidden','');setTimeout(sync,0)}
},true);
function nav(){
 // Les deux raccourcis crâne/radio sous le menu sont supprimés.
 // Les accès RENCONTRES et RADIOS LIVE du panneau HELLXBONE CLUB restent disponibles.
 document.getElementById('hx-quick-nav')?.remove();
}
function sync(){
 nav();const app=document.getElementById('app');if(!app)return;
 document.documentElement.classList.toggle('hx-radio-selected',selected==='radio');
 const radio=app.querySelector('#hellx-onair');if(!radio){const bar=document.getElementById('hx-quick-nav');if(bar)bar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));return}
 let hub=app.querySelector('#hx-home-hub'),horde=app.querySelector('#hx-horde-panel'),radioPanel=app.querySelector('#hx-radio-panel');
 if(!hub){
  hub=document.createElement('section');hub.id='hx-home-hub';
  hub.innerHTML='<h2>☠ HELLXBONE CLUB</h2><p>Ta communauté rock & metal. Retrouve la Horde, écoute tes radios et profite de l\'underground.</p><div id="hx-home-actions"><button type="button" data-hx-section="horde">☠ RENCONTRES<small>Radar, rendez-vous, chats</small></button><button type="button" data-hx-section="radio">📻 RADIOS LIVE<small>Le metal partout avec toi</small></button></div>';
  horde=document.createElement('div');horde.id='hx-horde-panel';
  radioPanel=document.createElement('div');radioPanel.id='hx-radio-panel';
  app.prepend(hub,horde,radioPanel);
  hub.addEventListener('click',e=>{const button=e.target.closest('[data-hx-section]');if(!button)return;selected=button.dataset.hxSection;sync();if(selected==='horde')document.getElementById('hx-horde-panel')?.scrollIntoView({behavior:'smooth',block:'start'})});
 }
 if(radio.parentElement!==radioPanel)radioPanel.appendChild(radio);
 // Garantit la présence de l'égaliseur même dans un lecteur restauré par le cache.
 let eq=radio.querySelector('.hx-eq');
 if(!eq){
  eq=document.createElement('div');eq.className='hx-eq';
  eq.innerHTML='<strong>ÉGALISEUR HELLXBONE</strong><button type="button" id="hx-eq-toggle">ACTIVER EQ</button><div class="hx-eq-sliders">'+
  [['bass','MÉGA BASSES'],['mid','MÉDIUMS'],['treble','AIGUS']].map(([k,n])=>'<label>'+n+' <output id="hx-eq-'+k+'-value">+0 dB</output><input type="range" id="hx-eq-'+k+'" min="-12" max="12" value="0" step="1"></label>').join('')+'</div>';
  radio.appendChild(eq);
 }
 eq.style.setProperty('display','block','important');
 eq.style.setProperty('visibility','visible','important');

 radioPanel.style.setProperty('display',selected==='radio'?'':'none','important');
 const meet=app.querySelector('#hellx-meet'),radar=app.querySelector('#hellx-radar');
 if(meet&&meet.parentElement!==horde)horde.appendChild(meet);
 if(radar&&radar.parentElement!==horde)horde.appendChild(radar);
 // Les autres outils non concernés restent en place ; aucun lecteur audio n'est recréé.
 horde.hidden=selected!=='horde';radioPanel.hidden=selected!=='radio';
// La radio ne s'affiche que sur demande via RADIOS LIVE, pas sur l'accueil.
if(selected==='home'){radioPanel.hidden=true;horde.hidden=true}
 // Afficher aussi le radar et ses chats (enfants du radar) dès que Rencontres est choisi.
 if(selected==='horde'){
  const radarNode=document.getElementById('hellx-radar');
  const meetNode=document.getElementById('hellx-meet');
  if(meetNode&&meetNode.parentElement!==horde)horde.prepend(meetNode);
  if(radarNode&&radarNode.parentElement!==horde)horde.append(radarNode);
 }

 hub.querySelectorAll('[data-hx-section]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hxSection===selected)));
 document.querySelectorAll('#hx-quick-nav [data-hx-section]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hxSection===selected)));
}
setInterval(sync,1200);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
})();
