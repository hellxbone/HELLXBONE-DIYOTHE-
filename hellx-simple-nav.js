/* HELLXBONE UX — navigation mobile simplifiée, modules existants conservés. */
(()=>{'use strict';
const style=document.createElement('style');
style.textContent=`
nav[aria-label="Navigation principale"]{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:7px!important;padding:8px!important;overflow:visible!important;background:#080e0a!important;position:sticky!important;top:0!important;z-index:90!important;align-items:stretch!important}
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
#hx-radio-panel,#hx-horde-panel{min-width:0}\n#hx-radio-panel[hidden],#hx-horde-panel[hidden]{display:none!important}
#hx-horde-panel #hellx-meet,#hx-horde-panel #hellx-radar{margin:12px auto!important}
@media(max-width:380px){#hx-home-actions button{font-size:13px}}
`;document.head.appendChild(style);
let selected='home';
function nav(){const main=document.querySelector('nav[aria-label="Navigation principale"]');if(!main)return;
 let bar=document.getElementById('hx-quick-nav');if(bar)return;
 bar=document.createElement('div');bar.id='hx-quick-nav';bar.setAttribute('aria-label','Accès rapides');
 bar.innerHTML='<button type="button" data-hx-section="horde" aria-label="Rencontres" title="Rencontres">☠️</button><button type="button" data-hx-section="radio" aria-label="Radios live" title="Radios live">📻</button>';
 main.insertAdjacentElement('afterend',bar);
 bar.addEventListener('click',e=>{const b=e.target.closest('[data-hx-section]');if(!b)return;selected=b.dataset.hxSection;const home=main.querySelector('[data-page="accueil"]');const app=document.getElementById('app');if(!app?.querySelector('#hellx-onair'))home?.click();setTimeout(()=>{sync();document.getElementById('hx-horde-panel')?.scrollIntoView({behavior:'smooth',block:'start'});},150);});
}
function sync(){
 nav();const app=document.getElementById('app');if(!app)return;
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
 const meet=app.querySelector('#hellx-meet'),radar=app.querySelector('#hellx-radar');
 if(meet&&meet.parentElement!==horde)horde.appendChild(meet);
 if(radar&&radar.parentElement!==horde)horde.appendChild(radar);
 // Les autres outils non concernés restent en place ; aucun lecteur audio n'est recréé.
 horde.hidden=selected!=='horde';radioPanel.hidden=selected!=='radio';
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
