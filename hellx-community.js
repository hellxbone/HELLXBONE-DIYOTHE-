(()=>{'use strict';
const key='hellxbone-member-v1';const style=document.createElement('style');
style.textContent='#hellx-club{max-width:900px;margin:8px auto;padding:0 12px;font:700 14px system-ui}#hellx-club>div>button{width:49%!important;height:38px!important;min-height:38px!important;max-height:38px!important;box-sizing:border-box!important;padding:2px 5px!important;font-size:12px!important;line-height:1!important;background:#111;color:#9cff67;border:2px solid #9cff67;border-radius:9px;cursor:pointer}#hellx-club>div{display:flex;gap:2%}#hellx-club-dialog[hidden]{display:none}#hellx-club-dialog{position:fixed;inset:0;z-index:2147482000;background:#000d;display:flex;align-items:center;justify-content:center;padding:16px}#hellx-club-panel{width:min(100%,450px);max-height:90vh;overflow:auto;padding:20px;border:2px solid #9cff67;border-radius:16px;background:#111;color:white;font:16px system-ui}#hellx-club-panel h2{color:#9cff67!important;font-size:24px!important}#hellx-club-panel button{padding:11px;margin:5px 3px 5px 0;background:#9cff67;color:#111;border:0;border-radius:8px;font-weight:bold}#hellx-club-panel input{width:100%;box-sizing:border-box;padding:12px;background:#222!important;color:white!important;border:1px solid #9cff67!important}#hellx-club-card{background:linear-gradient(130deg,#252525,#050505);padding:20px;margin:14px 0;border:2px solid #9cff67;border-radius:12px}#hellx-club-clock{font-size:clamp(24px,7vw,38px);font-weight:900;color:#9cff67;text-align:center;padding:20px 0}';
document.head.appendChild(style);
const root=document.createElement('section');root.id='hellx-club';root.innerHTML='<div><button type="button" data-hxc="member">☠ CARTE DE MEMBRE</button><button type="button" data-hxc="clock">⏳ TIRAGE DU TEE-SHIRT</button></div>';
(document.querySelector('#hellx-live-entry')||document.querySelector('header')).insertAdjacentElement('afterend',root);
const art=document.createElement('figure');
art.id='hellx-home-reaper';
art.setAttribute('aria-label','Illustration gothique HELLXBONE');
art.innerHTML='<img src="./hellxbone-faucheuse.png" alt="Faucheuse gothique à la faux, crânes et décor macabre HELLXBONE" loading="lazy" decoding="async">';
style.textContent+='#hellx-club[hidden],#hellx-home-reaper[hidden]{display:none!important}';
style.textContent+='#hellx-home-reaper{display:block;width:min(100% - 24px,876px);margin:20px auto 32px;padding:0;background:#000;border:1px solid #443e31;border-radius:6px;overflow:hidden}#hellx-home-reaper img{display:block;width:100%;height:auto;object-fit:contain}';
const placeClub=()=>{
 const app=document.getElementById('app');
 const radio=app?.querySelector('#hellx-onair');
 const hub=app?.querySelector('#hx-home-hub');
 // Les boutons sont réservés à l'accueil et jamais à la rubrique radios.
 if(!radio||!hub){root.remove();art.remove();return}
 if(root.parentElement!==app||root.previousElementSibling!==hub)hub.insertAdjacentElement('afterend',root);
 if(art.parentElement!==app||art.previousElementSibling!==root)root.insertAdjacentElement('afterend',art);
 const onHome=!document.documentElement.classList.contains('hx-radio-selected')&&!document.querySelector('#hx-home-actions [data-hx-section="horde"][aria-pressed="true"]');
 root.hidden=!onHome;
 art.hidden=!onHome;
};
const appRoot=document.getElementById('app');
if(appRoot)new MutationObserver(placeClub).observe(appRoot,{childList:true});
placeClub();
const modal=document.createElement('div');modal.id='hellx-club-dialog';modal.hidden=true;modal.innerHTML='<div id="hellx-club-panel" role="dialog" aria-modal="true"><button type="button" id="hellx-club-close">✕ FERMER</button><div id="hellx-club-body"></div></div>';document.body.appendChild(modal);
const body=modal.querySelector('#hellx-club-body');let timer;let focusBefore;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function close(){clearInterval(timer);modal.hidden=true;focusBefore?.focus?.();}
modal.querySelector('#hellx-club-close').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
function open(){focusBefore=document.activeElement;modal.hidden=false;modal.querySelector('#hellx-club-close').focus();}
function read(){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
const CARD_ART='carte-horde.png';
function paintCard(canvas,m){
 const ctx=canvas.getContext('2d');if(!ctx)return Promise.reject(Error('Canvas indisponible'));
 canvas.width=1536;canvas.height=976;
 return new Promise(resolve=>{
  const img=new Image();
  img.onload=()=>{ctx.drawImage(img,0,0,1536,976);
   // Cache uniquement les trois zones personnalisables du modèle fourni.
   function panel(x,y,w,h){const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#050907');g.addColorStop(.5,'#080b09');g.addColorStop(1,'#050907');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)}
   panel(425,493,710,115);panel(407,665,733,69);panel(564,770,414,64);
   ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#76ff2f';ctx.shadowBlur=19;
   let size=83;do{ctx.font='bold '+size+'px Georgia,serif';size-=2}while(ctx.measureText(m.name).width>660&&size>28);
   ctx.fillStyle='#adff83';ctx.fillText(m.name,768,559);ctx.shadowBlur=0;
   ctx.fillStyle='#e7e7e7';ctx.font='39px Georgia,serif';
   let idText='Identifiant personnel : '+m.id;let idSize=39;
   while(ctx.measureText(idText).width>705&&idSize>23){idSize-=2;ctx.font=idSize+'px Georgia,serif'}
   ctx.fillText(idText,768,700);
   ctx.font='35px Georgia,serif';ctx.fillText('Depuis le '+m.date,768,806);resolve(true)};
  img.onerror=()=>{const g=ctx.createLinearGradient(0,0,1536,976);g.addColorStop(0,'#202820');g.addColorStop(1,'#030503');ctx.fillStyle=g;ctx.fillRect(0,0,1536,976);ctx.strokeStyle='#8dff48';ctx.lineWidth=17;ctx.strokeRect(25,25,1486,926);ctx.textAlign='center';ctx.fillStyle='#9cff67';ctx.font='bold 115px Georgia,serif';ctx.fillText('HELLXBONE',768,250);ctx.fillStyle='white';ctx.font='55px Georgia,serif';ctx.fillText('MEMBRE DE LA HORDE',768,400);ctx.fillStyle='#9cff67';ctx.font='bold 90px Georgia,serif';ctx.fillText(m.name,768,580);ctx.fillStyle='white';ctx.font='38px Georgia,serif';ctx.fillText('Identifiant personnel : '+m.id,768,720);ctx.fillText('Depuis le '+m.date,768,820);resolve(false)};
  img.src=CARD_ART;
 });
}
function card(){clearInterval(timer);open();const m=read();body.innerHTML='<h2>☠ CARTE HELLXBONE</h2>'+(m?'<canvas id="hellx-club-preview" style="width:100%;height:auto;display:block;border-radius:9px;margin:12px 0" aria-label="Carte de membre HELLXBONE personnalisée"></canvas><button id="hxc-save">ENREGISTRER LA CARTE</button><button id="hxc-share">PARTAGER</button><button id="hxc-edit">CHANGER DE PSEUDO</button>':'<p>Crée ta carte virtuelle gratuitement, conservée sur ton téléphone.</p><form id="hxc-form"><label for="hxc-name">Ton pseudo</label><input id="hxc-name" maxlength="20" required autocomplete="nickname"><button type="submit">CRÉER MA CARTE</button></form>');
if(!m){const form=body.querySelector('form');form.querySelector('input').value=localStorage.getItem('hellx-riff-player-name')||'';form.onsubmit=e=>{e.preventDefault();const name=form.querySelector('input').value.trim().replace(/[<>]/g,'').slice(0,20);if(!name)return;try{localStorage.setItem(key,JSON.stringify({name,id:'HX-'+Math.random().toString(36).slice(2,10).toUpperCase(),date:new Date().toLocaleDateString('fr-FR')}));card()}catch{alert('Stockage local indisponible.')}};return;}
const canvas=body.querySelector('#hellx-club-preview');const ready=paintCard(canvas,m);
body.querySelector('#hxc-edit').onclick=()=>{const name=prompt('Nouveau pseudo (20 caractères maximum)',m.name);if(name===null)return;const clean=name.trim().replace(/[<>]/g,'').slice(0,20);if(!clean)return;localStorage.setItem(key,JSON.stringify({...m,name:clean}));card()};
body.querySelector('#hxc-share').onclick=async()=>{const text='☠ '+m.name+' — Membre de la horde HELLXBONE 🤘 '+location.origin+location.pathname;try{if(navigator.share)await navigator.share({title:'HELLXBONE',text});else if(navigator.clipboard){await navigator.clipboard.writeText(text);alert('Texte copié');}else alert(text)}catch(e){if(e.name!=='AbortError')alert('Partage indisponible')}};
body.querySelector('#hxc-save').onclick=async()=>{
const button=body.querySelector('#hxc-save');button.disabled=true;button.textContent='PRÉPARATION DE LA PHOTO…';
try{await ready;const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Image non créée');
const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='carte-HELLXBONE-'+m.id+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
button.textContent='PHOTO TÉLÉCHARGÉE';setTimeout(()=>{button.textContent='ENREGISTRER LA CARTE'},3500);
}catch(e){button.textContent='ERREUR — RÉESSAYER';setTimeout(()=>{button.textContent='ENREGISTRER LA CARTE'},3500)}finally{button.disabled=false}
};
}
function parisTarget(){const now=new Date();const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit'});const p=Object.fromEntries(fmt.formatToParts(now).filter(x=>x.type!=='literal').map(x=>[x.type,+x.value]));const y=p.month===12?p.year+1:p.year,m=p.month===12?1:p.month+1,utc=Date.UTC(y,m-1,1);const q=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(utc)).filter(x=>x.type!=='literal').map(x=>[x.type,+x.value]));return utc-(Date.UTC(q.year,q.month-1,q.day,q.hour,q.minute)-utc);}
function countdown(){clearInterval(timer);open();const target=parisTarget();body.innerHTML='<h2>⏳ COMPTE À REBOURS INFERNAL</h2><p>Prochain premier du mois : rendez-vous pour le classement MÉGA RIFF et le tee-shirt annoncé.</p><div id="hellx-club-clock" role="timer"></div><p><small>Heure de Paris. Le tirage et les lots suivent les règles de ton concours.</small></p><button id="hxc-play">JOUER À MÉGA RIFF</button>';const el=body.querySelector('#hellx-club-clock');const tick=()=>{const v=Math.max(0,Math.floor((target-Date.now())/1000));el.textContent=v===0?'JOUR DU TIRAGE !':Math.floor(v/86400)+'j '+String(Math.floor(v%86400/3600)).padStart(2,'0')+'h '+String(Math.floor(v%3600/60)).padStart(2,'0')+'m '+String(v%60).padStart(2,'0')+'s';if(!v)clearInterval(timer)};tick();timer=setInterval(tick,1000);body.querySelector('#hxc-play').onclick=()=>{close();document.querySelector('nav [data-page="jeu"]')?.click()};}
root.addEventListener('click',e=>{const t=e.target.closest('[data-hxc]');if(t)(t.dataset.hxc==='member'?card:countdown)()});
})();