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
#hx-home-hub{font:15px system-ui;color:#e7ffed;background:linear-gradient(160deg,#07180d,#0c100d);border-radius:14px;border:0!important;padding:14px;margin-bottom:16px}
#hx-home-hub h2{color:#97ffae!important;font:900 25px system-ui!important;text-align:center;margin:5px 0}
#hx-home-hub p{color:#ccedcf!important;text-align:center}
#hx-home-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:13px 0}
#hx-home-actions button{display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;min-height:65px;background:#14351e;border:0!important;border-radius:12px;color:#e3ffea;font:900 15px system-ui;padding:7px 8px;cursor:pointer}
#hx-home-actions button small{font:12px system-ui;color:#bfe7c9}
#hx-home-actions button[aria-pressed=true]{background:#4fe378;color:#092311}
#hx-home-actions button[aria-pressed=true] small{color:#103d20}
#hx-radio-panel,#hx-horde-panel{min-width:0}
html.hx-radio-selected #hx-home-actions{grid-template-columns:minmax(0,1fr)}
html.hx-radio-selected #hx-home-actions [data-hx-section="horde"]{display:none!important}
html.hx-radio-selected #hx-home-hub{display:none!important}
#hx-radio-panel .hx-radio-banner-bottom{display:block;width:100%;max-width:100%;margin:12px auto 0;background:#000;line-height:0;overflow:hidden}
#hx-radio-panel .hx-radio-banner-bottom img{display:block;width:100%;height:auto;object-fit:contain;background:#000}

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
  hub.innerHTML='<div id="hx-home-actions"><button type="button" data-hx-section="horde">🤘 ON SE CAPTE ?<small>Concerts • Festivals • Sorties</small></button><button type="button" data-hx-section="radio" aria-label="Radio metal live 24 heures sur 24">📻 LIVE 666<small>Le metal partout avec toi</small></button></div>';
  horde=document.createElement('div');horde.id='hx-horde-panel';
  radioPanel=document.createElement('div');radioPanel.id='hx-radio-panel';
  app.prepend(hub,horde,radioPanel);
  hub.addEventListener('click',e=>{const button=e.target.closest('[data-hx-section]');if(!button)return;selected=button.dataset.hxSection;sync();if(selected==='horde')document.getElementById('hx-horde-panel')?.scrollIntoView({behavior:'smooth',block:'start'})});
 }
 if(radio.parentElement!==radioPanel)radioPanel.appendChild(radio);
 // Ancien bandeau inférieur supprimé : le poste fusionné comprend déjà son visuel.
 radioPanel.querySelectorAll('.hx-radio-banner-bottom').forEach(banner=>banner.remove());
 radioPanel.style.setProperty('display',selected==='radio'?'':'none','important');
 const meet=app.querySelector('#hellx-meet'),radar=app.querySelector('#hellx-radar');
 if(meet&&meet.parentElement!==horde)horde.appendChild(meet);
 if(radar&&radar.parentElement!==horde)horde.appendChild(radar);
 // Les autres outils non concernés restent en place ; aucun lecteur audio n'est recréé.
 horde.hidden=selected!=='horde';radioPanel.hidden=selected!=='radio';
 const clubButtons=document.getElementById('hellx-club'),reaper=document.getElementById('hellx-home-reaper');
 if(clubButtons)clubButtons.hidden=selected!=='home';
 if(reaper)reaper.hidden=selected!=='home';
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


/* HELLXBONE — panneau accueil illustré, cinq zones tactiles indépendantes.
   Déposer 6487.png à la racine du dépôt. Retour aux boutons classiques si l'image manque. */
(()=>{
 'use strict';
 if(window.__hxHomeIllustratedMenu)return;
 window.__hxHomeIllustratedMenu=true;
 const css=document.createElement('style');
 css.textContent=`
 #hx-home-hub:has(#hx-home-graphic:not([hidden])){padding:0!important;margin-left:0!important;margin-right:0!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important}
 #hx-home-graphic{position:relative;display:block;width:100vw!important;max-width:none!important;aspect-ratio:852/572;height:auto!important;margin-left:calc(50% - 50vw)!important;margin-right:0!important;line-height:0;overflow:hidden;background:#000;border:0!important;border-radius:0!important;box-shadow:none!important}
 #hx-home-graphic>img{object-fit:contain!important}
 #hx-home-graphic>img{display:block;width:100%;height:100%;object-fit:fill;pointer-events:none}
 #hx-home-graphic .hx-img-hotspot{position:absolute;display:block;min-height:0;min-width:0;margin:0;padding:0;border:0!important;border-radius:8px;background:transparent!important;background-image:none!important;color:transparent!important;font-size:0!important;box-shadow:none!important;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
 #hx-home-graphic .hx-img-hotspot:focus-visible{outline:2px solid #fff!important;outline-offset:-3px!important}
 #hx-home-graphic .hx-hot-meet{left:6%;top:10%;width:33%;height:29%}
 #hx-home-graphic .hx-hot-radio{left:61%;top:10%;width:33%;height:29%}
 #hx-home-graphic .hx-hot-member{left:6%;top:45%;width:33%;height:26%}
 #hx-home-graphic .hx-hot-draw{left:61%;top:45%;width:33%;height:26%}
 #hx-home-graphic .hx-hot-invite{left:18%;top:75%;width:64%;height:19%}
 #hx-home-graphic[hidden]{display:none!important}
 html.hx-home-image-ready:not(.hx-radio-selected) #hx-home-hub #hx-home-actions,
 html.hx-home-image-ready:not(.hx-radio-selected) #hx-home-hub #hellx-club{display:none!important}
 `;
 document.head.appendChild(css);
 const targets=[
  ['meet','hx-hot-meet','ON SE CAPTE ?'],
  ['radio','hx-hot-radio','LIVE 666'],
  ['member','hx-hot-member','CARTE DE MEMBRE'],
  ['draw','hx-hot-draw','TIRAGE DU TEE-SHIRT'],
  ['invite','hx-hot-invite','INVITER MES POTES']
 ];
 function trigger(key){
  const selector={
   meet:'#hx-home-actions [data-hx-section="horde"]',
   radio:'#hx-home-actions [data-hx-section="radio"]',
   member:'#hellx-club [data-hxc="member"]',
   draw:'#hellx-club [data-hxc="clock"]',
   invite:'#hellx-invite-button'
  }[key];
  const target=document.querySelector(selector);
  if(target)target.click();
 }
 function mount(){
  const hub=document.getElementById('hx-home-hub');if(!hub)return;
  let panel=document.getElementById('hx-home-graphic');
  if(!panel){
   panel=document.createElement('div');panel.id='hx-home-graphic';panel.hidden=true;
   panel.setAttribute('role','group');panel.setAttribute('aria-label','Raccourcis HELLXBONE CLUB');
   const img=document.createElement('img');img.src='./6487.png?v=20261103-menu-home';img.alt='';img.decoding='async';
   img.addEventListener('load',()=>{document.documentElement.classList.add('hx-home-image-ready');syncVisibility()});
   img.addEventListener('error',()=>{document.documentElement.classList.remove('hx-home-image-ready');panel.hidden=true});
   panel.appendChild(img);
   for(const [key,cls,label] of targets){
    const button=document.createElement('button');button.type='button';button.className='hx-img-hotspot '+cls;
    button.setAttribute('aria-label',label);button.title=label;
    button.addEventListener('click',()=>trigger(key));
    panel.appendChild(button);
   }
   hub.insertBefore(panel,hub.querySelector('#hellx-club'));
  }
  syncVisibility();
 }
 function syncVisibility(){
  const panel=document.getElementById('hx-home-graphic');if(!panel)return;
  const horde=document.querySelector('#hx-home-actions [data-hx-section="horde"]');
  const radio=document.querySelector('#hx-home-actions [data-hx-section="radio"]');
  const subpage=horde?.getAttribute('aria-pressed')==='true'||radio?.getAttribute('aria-pressed')==='true';
  panel.hidden=!document.documentElement.classList.contains('hx-home-image-ready')||subpage;
 }
 setInterval(mount,1400);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
