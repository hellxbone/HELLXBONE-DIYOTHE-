/* HELLXBONE — raccourci HELL PACHINKO indépendant de MEGA RIFF. */
(()=>{'use strict';
if(window.__hellPachinkoLauncher)return;window.__hellPachinkoLauncher=true;
const style=document.createElement('style');
style.textContent='#hx-pachinko-home-btn{display:block!important;position:relative!important;z-index:4!important;width:calc(100% - 24px)!important;max-width:600px!important;min-height:58px!important;margin:10px auto 16px!important;padding:12px 16px!important;border:2px solid #fb5a1b!important;border-radius:14px!important;background:linear-gradient(140deg,#280600,#850f04 52%,#280600)!important;color:#fff!important;box-shadow:0 0 18px #e30a,inset 0 1px 4px #f75!important;font:900 19px/1.2 system-ui!important;text-align:center!important;cursor:pointer!important;letter-spacing:.04em!important}#hx-pachinko-home-btn small{display:block!important;margin-top:4px!important;font:12px system-ui!important;color:#ffcfaa!important}';
document.head.appendChild(style);
function mount(){
 const hub=document.getElementById('hx-home-hub');
 if(!hub)return;
 if(hub.querySelector('#hx-pachinko-home-btn'))return;
 const b=document.createElement('button');b.id='hx-pachinko-home-btn';b.type='button';
 b.innerHTML='HELL PACHINKO<small>Lancer le nouveau jeu</small>';b.setAttribute('aria-label','Jouer à HELL PACHINKO');
 b.addEventListener('click',()=>{location.href='./hell-pachinko.html'});
 const graphic=hub.querySelector('#hx-home-graphic');
 if(graphic)graphic.after(b);else hub.appendChild(b);
}
const start=()=>{mount();const root=document.getElementById('app');if(root){new MutationObserver(mount).observe(root,{childList:true})}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();