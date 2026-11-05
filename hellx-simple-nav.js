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
#hx-radio-panel{min-width:0}
html.hx-radio-selected #hx-home-actions{grid-template-columns:minmax(0,1fr)}
html.hx-radio-selected #hx-home-hub{display:none!important}
#hx-radio-panel .hx-radio-banner-bottom{display:block;width:100%;max-width:100%;margin:12px auto 0;background:#000;line-height:0;overflow:hidden}
#hx-radio-panel .hx-radio-banner-bottom img{display:block;width:100%;height:auto;object-fit:contain;background:#000}

html:not(.hx-radio-selected) #hellx-onair,
html:not(.hx-radio-selected) #hx-radio-panel{display:none!important}
html:not(.hx-radio-selected) #hx-radio-panel *{visibility:hidden!important}
#hx-radio-panel[hidden]{display:none!important}

@media(max-width:380px){#hx-home-actions button{font-size:13px}}
`;document.head.appendChild(style);

// Garder la page et son lecteur audio vivants lorsque HELLX SIGNAL est affiché.
let signalOverlay=null;
function closeSignal(){
 if(!signalOverlay)return;
 const overlay=signalOverlay;
 signalOverlay=null;
 if(document.fullscreenElement===overlay)document.exitFullscreen?.().catch(()=>{});
 overlay.remove();
 document.documentElement.style.removeProperty('overflow');
 document.body.style.removeProperty('overflow');
}
function openSignal(){
 if(signalOverlay)return;
 const overlay=document.createElement('div');
 overlay.id='hx-signal-overlay';
 overlay.setAttribute('role','dialog');
 overlay.setAttribute('aria-label','HELLX SIGNAL');
 overlay.setAttribute('aria-modal','true');
 Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'2147483000',background:'#000'});
 const frame=document.createElement('iframe');
 frame.title='HELLX SIGNAL';
 frame.src='./hellx-signal.html?embedded=1&v=20261104-clean-header-v5';
 frame.setAttribute('allow','screen-wake-lock');
 Object.assign(frame.style,{border:'0',width:'100%',height:'100%',display:'block',background:'#000'});
 overlay.appendChild(frame);
 document.body.appendChild(overlay);
 signalOverlay=overlay;
 document.documentElement.style.setProperty('overflow','hidden');
 document.body.style.setProperty('overflow','hidden');
 // Fenêtre bord à bord sans Fullscreen API : supprime le bandeau gris Android/Chrome.
 // Le lecteur radio demeure actif dans la page parente.
}
window.addEventListener('message',event=>{
 if(event.origin===location.origin&&event.source===signalOverlay?.querySelector('iframe')?.contentWindow&&event.data==='hellx-signal-close')closeSignal();
});
let selected='home';
document.documentElement.classList.remove('hx-radio-selected');
// L'accueil ne doit jamais conserver le lecteur radio affiché après un retour par la maison.
document.addEventListener('click',event=>{
 const home=event.target.closest('nav[aria-label="Navigation principale"] [data-page="accueil"]');
 if(home){selected='home';document.documentElement.classList.remove('hx-radio-selected');document.getElementById('hx-radio-panel')?.setAttribute('hidden','');setTimeout(sync,0)}
},true);
function nav(){
 // Les deux raccourcis crâne/radio sous le menu sont supprimés.
 // Le raccourci LIVE 666 reste disponible.
 document.getElementById('hx-quick-nav')?.remove();
}
function sync(){
 nav();const app=document.getElementById('app');if(!app)return;
 document.documentElement.classList.toggle('hx-radio-selected',selected==='radio');
 const radio=app.querySelector('#hellx-onair');if(!radio){const bar=document.getElementById('hx-quick-nav');if(bar)bar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));return}
 let hub=app.querySelector('#hx-home-hub'),radioPanel=app.querySelector('#hx-radio-panel');
 if(!hub){
  hub=document.createElement('section');hub.id='hx-home-hub';
  hub.innerHTML='<div id="hx-home-actions"><button type="button" data-hx-section="signal" aria-label="HELLX SIGNAL : communiquer sans parler">☠ HELLX SIGNAL<small>Communiquer sans parler</small></button><button type="button" data-hx-section="radio" aria-label="Radio metal live 24 heures sur 24">📻 LIVE 666<small>Le metal partout avec toi</small></button></div>';
  
  radioPanel=document.createElement('div');radioPanel.id='hx-radio-panel';
  app.prepend(hub,radioPanel);
  hub.addEventListener('click',e=>{const signal=e.target.closest('[data-hx-section="signal"]');if(signal){openSignal();return}const button=e.target.closest('[data-hx-section="radio"]');if(!button)return;selected='radio';sync()});
 }
 if(radio.parentElement!==radioPanel)radioPanel.appendChild(radio);
 // Ancien bandeau inférieur supprimé : le poste fusionné comprend déjà son visuel.
 radioPanel.querySelectorAll('.hx-radio-banner-bottom').forEach(banner=>banner.remove());
 radioPanel.style.setProperty('display',selected==='radio'?'':'none','important');
 
 // Les autres outils non concernés restent en place ; aucun lecteur audio n'est recréé.
 radioPanel.hidden=selected!=='radio';
 const clubButtons=document.getElementById('hellx-club'),reaper=document.getElementById('hellx-home-reaper');
 if(clubButtons)clubButtons.hidden=selected!=='home';
 if(reaper)reaper.hidden=selected!=='home';
// La radio ne s'affiche que sur demande via RADIOS LIVE, pas sur l'accueil.
if(selected==='home'){radioPanel.hidden=true}

 hub.querySelectorAll('[data-hx-section]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hxSection===selected)));
 document.querySelectorAll('#hx-quick-nav [data-hx-section]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hxSection===selected)));
}
// Synchronisation moins agressive : les clics déclenchent un rafraîchissement immédiat.
setInterval(sync,6000);
document.addEventListener('click',e=>{if(e.target.closest('nav [data-page], [data-hx-section]'))setTimeout(sync,0)},true);
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
 #hx-home-graphic{position:relative;display:block;width:100vw!important;max-width:none!important;aspect-ratio:1124/776;height:auto!important;margin-left:calc(50% - 50vw)!important;margin-right:0!important;line-height:0;overflow:hidden;background:#000;border:0!important;border-radius:0!important;box-shadow:none!important}
 /* Un seul rendu de l’image source, proportions naturelles sans étirement ni effets superposés. */
 #hx-home-graphic>img{position:absolute!important;left:0!important;top:-97.9381%!important;display:block!important;width:100%!important;height:auto!important;max-width:none!important;max-height:none!important;object-fit:unset!important;object-position:initial!important;transform:none!important;filter:brightness(.88) saturate(.84) contrast(1.05)!important;image-rendering:auto!important;pointer-events:none!important}
 #hx-home-graphic .hx-img-hotspot{position:absolute;display:block;min-height:0;min-width:0;margin:0;padding:0;border:0!important;border-radius:8px;background:transparent!important;background-image:none!important;color:transparent!important;font-size:0!important;box-shadow:none!important;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
 #hx-home-graphic .hx-img-hotspot:focus-visible{outline:2px solid #fff!important;outline-offset:-3px!important}
 #hx-home-graphic .hx-hot-meet{left:6%;top:5%;width:35%;height:41.5%}
 #hx-home-graphic .hx-hot-radio{left:62%;top:10.9%;width:33%;height:35.6%}
 #hx-home-graphic .hx-hot-member{left:6%;top:48.7%;width:33%;height:25.8%}
 #hx-home-graphic .hx-hot-draw{left:61%;top:48.7%;width:33%;height:25.8%}
 #hx-home-graphic .hx-hot-invite{left:18%;top:76.3%;width:64%;height:19.8%}
 #hx-home-graphic .hx-hot-nav{display:none!important}
 #hx-home-graphic .hx-hot-nav-home{left:1%}
 #hx-home-graphic .hx-hot-nav-news{left:20%}
 #hx-home-graphic .hx-hot-nav-shop{left:40%}
 #hx-home-graphic .hx-hot-nav-game{left:60%}
 #hx-home-graphic .hx-hot-nav-about{left:80%}
 html.hx-home-image-ready:not(.hx-radio-selected):has(#hx-home-graphic:not([hidden])) body>footer{display:none!important}
 html.hx-home-image-ready:not(.hx-radio-selected):has(#hx-home-graphic:not([hidden])) #app{padding:0!important;margin:0!important;max-width:none!important}
 html.hx-home-image-ready:not(.hx-radio-selected):has(#hx-home-graphic:not([hidden])) #hx-home-hub{margin:0!important;padding:0!important}
 html.hx-home-image-ready:not(.hx-radio-selected) #app>.hx-winner-led{display:flex!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;margin:0!important}
 #hx-home-graphic[hidden]{display:none!important}
 html.hx-home-image-ready:not(.hx-radio-selected) #hx-home-hub #hx-home-actions,
 html.hx-home-image-ready:not(.hx-radio-selected) #hx-home-hub #hellx-club{display:none!important}
 `;
 document.head.appendChild(css);
 const targets=[
  ['signal','hx-hot-meet','SOS — HELLX SIGNAL'],
  ['radio','hx-hot-radio','LIVE 666'],
  ['member','hx-hot-member','CARTE DE MEMBRE'],
  ['draw','hx-hot-draw','TIRAGE DU TEE-SHIRT'],
  ['invite','hx-hot-invite','INVITER MES POTES'],
  ['accueil','hx-hot-nav hx-hot-nav-home','Accueil'],
  ['magazine','hx-hot-nav hx-hot-nav-news','News'],
  ['boutique','hx-hot-nav hx-hot-nav-shop','Boutique'],
  ['jeu','hx-hot-nav hx-hot-nav-game','Jeux'],
  ['apropos','hx-hot-nav hx-hot-nav-about','À propos']
 ];
 function trigger(key){
  if(['accueil','magazine','boutique','jeu','apropos'].includes(key)){
   document.querySelector('nav[aria-label="Navigation principale"] [data-page="'+key+'"]')?.click();return;
  }
  const selector={
   signal:'#hx-home-actions [data-hx-section="signal"]',
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
   const img=document.createElement('img');img.src='./6617.png?v=20261105-glow-reduced-v2';img.alt='';img.decoding='async';
   img.addEventListener('load',()=>{document.documentElement.classList.add('hx-home-image-ready');syncVisibility()});
   img.addEventListener('error',()=>{document.documentElement.classList.remove('hx-home-image-ready');panel.hidden=true});
   panel.appendChild(img);
   for(const [key,cls,label] of targets){
    const button=document.createElement('button');button.type='button';button.className='hx-img-hotspot '+cls;
    button.setAttribute('aria-label',label);button.title=label;if(key==='signal')button.textContent='SOS';
    button.addEventListener('click',()=>trigger(key));
    panel.appendChild(button);
   }
   hub.insertBefore(panel,hub.querySelector('#hellx-club'));
  }
  syncVisibility();
 }
 function syncVisibility(){
  const panel=document.getElementById('hx-home-graphic');if(!panel)return;
  const radio=document.querySelector('#hx-home-actions [data-hx-section="radio"]');
  const subpage=radio?.getAttribute('aria-pressed')==='true';
  panel.hidden=!document.documentElement.classList.contains('hx-home-image-ready')||subpage;
 }
 setInterval(mount,1400);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

/* HELLXBONE — menu metal cinq zones tactiles, image 6553.png.
   Conserver les boutons data-page existants: navigation, clavier et lecteurs d'écran.
   Si l'image n'a pas encore été déposée, les icônes précédentes restent visibles. */
(()=>{
 'use strict';
 const css=document.createElement('style');
 css.textContent=`
 nav[aria-label="Navigation principale"].hx-neon-menu-ready{
  display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;
  width:100%!important;aspect-ratio:852 / 133!important;height:auto!important;
  min-height:0!important;max-height:none!important;gap:0!important;
  padding:0!important;margin:0!important;overflow:hidden!important;
  border:0!important;border-radius:0!important;box-shadow:none!important;
  background:#000 url("./IMG_20261104_132835.png?v=20261104-neon-menu-v3") center / 100% 100% no-repeat!important;
  position:sticky!important;top:0!important;z-index:90!important;
 }
 nav[aria-label="Navigation principale"].hx-neon-menu-ready > button,
 nav[aria-label="Navigation principale"].hx-neon-menu-ready > button[aria-current="page"],
 nav[aria-label="Navigation principale"].hx-neon-menu-ready > button[aria-current="true"]{
  display:block!important;width:100%!important;height:100%!important;
  min-height:0!important;max-height:none!important;min-width:0!important;
  margin:0!important;padding:0!important;flex:none!important;
  border:0!important;outline:0!important;border-radius:0!important;
  background:transparent!important;background-image:none!important;
  box-shadow:none!important;color:transparent!important;
  font-size:0!important;line-height:0!important;opacity:1!important;
  cursor:pointer!important;touch-action:manipulation;
 }
 nav[aria-label="Navigation principale"].hx-neon-menu-ready > button .hellx-nav-icon,\n nav[aria-label="Navigation principale"].hx-neon-menu-ready > button svg,
 nav[aria-label="Navigation principale"].hx-neon-menu-ready > button img,
 nav[aria-label="Navigation principale"].hx-neon-menu-ready > button .hellx-nav-icon{
  visibility:hidden!important;opacity:0!important;
 }
 nav[aria-label="Navigation principale"].hx-neon-menu-ready > button:focus-visible{
  outline:2px solid #fff!important;outline-offset:-4px!important;
 }
 nav[aria-label="Navigation principale"].hx-neon-menu-ready > button[aria-current="page"]{
  box-shadow:inset 0 -3px 0 #c5ffb2!important;
 }
 `;
 document.head.appendChild(css);
 const nav=document.querySelector('nav[aria-label="Navigation principale"]');
 if(!nav)return;
 const img=new Image();
 img.onload=()=>{if(img.naturalWidth>0)nav.classList.add('hx-neon-menu-ready')};
 img.onerror=()=>nav.classList.remove('hx-neon-menu-ready');
 img.src='./IMG_20261104_132835.png?v=20261104-neon-menu-v3';
})();
