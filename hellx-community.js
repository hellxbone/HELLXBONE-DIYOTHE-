(()=>{'use strict';
const key='hellxbone-member-v1';const style=document.createElement('style');
style.textContent='#hellx-club{max-width:900px;margin:8px auto;padding:0 12px;font:700 14px system-ui}#hellx-club button{width:49%;padding:12px 4px;background:#111;color:#9cff67;border:2px solid #9cff67;border-radius:9px;cursor:pointer}#hellx-club>div{display:flex;gap:2%}#hellx-club-dialog[hidden]{display:none}#hellx-club-dialog{position:fixed;inset:0;z-index:2147482000;background:#000d;display:flex;align-items:center;justify-content:center;padding:16px}#hellx-club-panel{width:min(100%,450px);max-height:90vh;overflow:auto;padding:20px;border:2px solid #9cff67;border-radius:16px;background:#111;color:white;font:16px system-ui}#hellx-club-panel h2{color:#9cff67!important;font-size:24px!important}#hellx-club-panel button{padding:11px;margin:5px 3px 5px 0;background:#9cff67;color:#111;border:0;border-radius:8px;font-weight:bold}#hellx-club-panel input{width:100%;box-sizing:border-box;padding:12px;background:#222!important;color:white!important;border:1px solid #9cff67!important}#hellx-club-card{background:linear-gradient(130deg,#252525,#050505);padding:20px;margin:14px 0;border:2px solid #9cff67;border-radius:12px}#hellx-club-clock{font-size:clamp(24px,7vw,38px);font-weight:900;color:#9cff67;text-align:center;padding:20px 0}';
document.head.appendChild(style);
const root=document.createElement('section');root.id='hellx-club';root.innerHTML='<div><button type="button" data-hxc="member">☠ CARTE DE MEMBRE</button><button type="button" data-hxc="clock">⏳ TIRAGE DU TEE-SHIRT</button></div>';
(document.querySelector('#hellx-live-entry')||document.querySelector('header')).insertAdjacentElement('afterend',root);
const modal=document.createElement('div');modal.id='hellx-club-dialog';modal.hidden=true;modal.innerHTML='<div id="hellx-club-panel" role="dialog" aria-modal="true"><button type="button" id="hellx-club-close">✕ FERMER</button><div id="hellx-club-body"></div></div>';document.body.appendChild(modal);
const body=modal.querySelector('#hellx-club-body');let timer;let focusBefore;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function close(){clearInterval(timer);modal.hidden=true;focusBefore?.focus?.();}
modal.querySelector('#hellx-club-close').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
function open(){focusBefore=document.activeElement;modal.hidden=false;modal.querySelector('#hellx-club-close').focus();}
function read(){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
function card(){clearInterval(timer);open();const m=read();body.innerHTML='<h2>☠ CARTE HELLXBONE</h2>'+(m?'<div id="hellx-club-card"><b style="font-size:27px;color:#9cff67">✠ HELLXBONE ✠</b><p>MEMBRE DE LA HORDE</p><h2>'+esc(m.name)+'</h2><p>Identifiant personnel : '+esc(m.id)+'</p><small>Depuis le '+esc(m.date)+'</small></div><button id="hxc-save">ENREGISTRER LA CARTE</button><button id="hxc-share">PARTAGER</button><button id="hxc-edit">CHANGER DE PSEUDO</button>':'<p>Crée ta carte virtuelle gratuitement, conservée sur ton téléphone.</p><form id="hxc-form"><label for="hxc-name">Ton pseudo</label><input id="hxc-name" maxlength="20" required autocomplete="nickname"><button type="submit">CRÉER MA CARTE</button></form>');
if(!m){const form=body.querySelector('form');form.querySelector('input').value=localStorage.getItem('hellx-riff-player-name')||'';form.onsubmit=e=>{e.preventDefault();const name=form.querySelector('input').value.trim().replace(/[<>]/g,'').slice(0,20);if(!name)return;try{localStorage.setItem(key,JSON.stringify({name,id:'HX-'+Math.random().toString(36).slice(2,10).toUpperCase(),date:new Date().toLocaleDateString('fr-FR')}));card()}catch{alert('Stockage local indisponible.')}};return;}
body.querySelector('#hxc-edit').onclick=()=>{const old=m.name;localStorage.removeItem(key);card();body.querySelector('#hxc-name').value=old;};
body.querySelector('#hxc-share').onclick=async()=>{const text='☠ '+m.name+' — Membre de la horde HELLXBONE 🤘 '+location.origin+location.pathname;try{if(navigator.share)await navigator.share({title:'HELLXBONE',text});else if(navigator.clipboard){await navigator.clipboard.writeText(text);alert('Texte copié');}else alert(text)}catch(e){if(e.name!=='AbortError')alert('Partage indisponible')}};
body.querySelector('#hxc-save').onclick=async()=>{
const button=body.querySelector('#hxc-save');
button.disabled=true;button.textContent='PRÉPARATION DE LA PHOTO…';
try{
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=600;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas indisponible');
 const bg=ctx.createLinearGradient(0,0,1080,600);bg.addColorStop(0,'#272727');bg.addColorStop(1,'#050505');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,600);
 ctx.strokeStyle='#9cff67';ctx.lineWidth=7;ctx.beginPath();ctx.roundRect(20,20,1040,560,28);ctx.stroke();
 ctx.textAlign='center';ctx.fillStyle='#9cff67';ctx.font='bold 73px Arial, sans-serif';ctx.fillText('✠ HELLXBONE ✠',540,140);
 ctx.fillStyle='#eeeeee';ctx.font='35px Arial, sans-serif';ctx.fillText('MEMBRE DE LA HORDE',540,225);
 let fontSize=62;do{ctx.font='bold '+fontSize+'px Arial, sans-serif';fontSize-=2}while(ctx.measureText(m.name).width>940&&fontSize>24);
 ctx.fillStyle='#9cff67';ctx.fillText(m.name,540,355);
 ctx.font='29px Arial, sans-serif';ctx.fillStyle='#dddddd';ctx.fillText('Identifiant personnel : '+m.id,540,455);
 ctx.font='25px Arial, sans-serif';ctx.fillText('Depuis le '+m.date,540,520);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Image non créée');
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='carte-HELLXBONE-'+m.id+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
 button.textContent='PHOTO ENREGISTRÉE / TÉLÉCHARGÉE';
 setTimeout(()=>{button.textContent='ENREGISTRER LA CARTE'},3500);
}catch(e){button.textContent='ERREUR — RÉESSAYER';setTimeout(()=>{button.textContent='ENREGISTRER LA CARTE'},3500);}
finally{button.disabled=false}
};
}
function parisTarget(){const now=new Date();const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit'});const p=Object.fromEntries(fmt.formatToParts(now).filter(x=>x.type!=='literal').map(x=>[x.type,+x.value]));const y=p.month===12?p.year+1:p.year,m=p.month===12?1:p.month+1,utc=Date.UTC(y,m-1,1);const q=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(utc)).filter(x=>x.type!=='literal').map(x=>[x.type,+x.value]));return utc-(Date.UTC(q.year,q.month-1,q.day,q.hour,q.minute)-utc);}
function countdown(){clearInterval(timer);open();const target=parisTarget();body.innerHTML='<h2>⏳ COMPTE À REBOURS INFERNAL</h2><p>Prochain premier du mois : rendez-vous pour le classement MÉGA RIFF et le tee-shirt annoncé.</p><div id="hellx-club-clock" role="timer"></div><p><small>Heure de Paris. Le tirage et les lots suivent les règles de ton concours.</small></p><button id="hxc-play">JOUER À MÉGA RIFF</button>';const el=body.querySelector('#hellx-club-clock');const tick=()=>{const v=Math.max(0,Math.floor((target-Date.now())/1000));el.textContent=v===0?'JOUR DU TIRAGE !':Math.floor(v/86400)+'j '+String(Math.floor(v%86400/3600)).padStart(2,'0')+'h '+String(Math.floor(v%3600/60)).padStart(2,'0')+'m '+String(v%60).padStart(2,'0')+'s';if(!v)clearInterval(timer)};tick();timer=setInterval(tick,1000);body.querySelector('#hxc-play').onclick=()=>{close();document.querySelector('nav [data-page="jeu"]')?.click()};}
root.addEventListener('click',e=>{const t=e.target.closest('[data-hxc]');if(t)(t.dataset.hxc==='member'?card:countdown)()});
})();