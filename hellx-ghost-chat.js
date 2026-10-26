/* HELLXBONE CHAT FANTOME — salon collectif local, messages conserves 24h max. */
(()=>{'use strict';
const ROOT='https://ldibykpitjutratyqqax.supabase.co',KEY='sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv';
let busy=false,visible=false;
const style=document.createElement('style');style.textContent=`
#hellx-ghost{margin:14px 0;padding:14px;background:#06180b;border:2px solid #41e968;border-radius:9px;color:#d9ffe1;font:14px system-ui}
#hellx-ghost h3{color:#a7ffac;font:900 19px monospace;margin:0 0 8px}
#hellx-ghost .hx-ghost-log{max-height:300px;overflow:auto;background:#010b04;padding:8px;border:1px solid #275e32}
#hellx-ghost .hx-ghost-msg{background:#153722;margin:7px 0;padding:8px;border-radius:6px;overflow-wrap:anywhere}
#hellx-ghost .hx-ghost-msg.mine{background:#295b32}
#hellx-ghost input{flex:1;min-width:0;padding:10px;background:#021009;color:white;border:1px solid #59ca79;border-radius:6px}
#hellx-ghost form{display:flex;gap:6px;margin-top:8px}
#hellx-ghost button{font:700 13px monospace!important;padding:9px!important}
`;document.head.appendChild(style);
function el(tag,text,cls){const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x}
function token(){try{const v=JSON.parse(localStorage.getItem('hellx-nearby-auth-v1')||'null');if(v?.access_token && v.expires_at>Date.now()/1000+30)return v.access_token}catch{}return null}
async function rpc(body){let t=token();if(!t)throw Error('Connexion sécurisée en cours. Réessaie dans quelques secondes.');
const r=await fetch(ROOT+'/rest/v1/rpc/hellx_ghost_channel',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify(body||{})});
if(!r.ok)throw Error('Service temporairement indisponible ('+r.status+').');return r.json()}
function setup(){const radar=document.getElementById('hellx-radar');if(!radar)return null;
let p=document.getElementById('hellx-ghost');if(p)return p;
p=el('section');p.id='hellx-ghost';p.innerHTML='<h3>☠ CHAT FANTÔME · COLLECTIF</h3><p>Salon local à 500 m. Les messages expirent après 24 heures et sont supprimés du serveur automatiquement (purge toutes les 5 minutes). Aucun numéro de téléphone.</p><p data-status>Active ton radar pour rejoindre le salon.</p><div class="hx-ghost-log" role="log" aria-live="polite"></div><form><input maxlength="500" required placeholder="Un message à la horde…" aria-label="Message collectif"><button type="submit">ENVOYER</button></form>';
const before=radar.querySelector('.hx-nearby-chat');if(before)radar.insertBefore(p,before);else radar.append(p);
p.querySelector('form').onsubmit=async e=>{e.preventDefault();const input=p.querySelector('input'),msg=input.value.trim();if(!msg||busy)return;const b=p.querySelector('button');b.disabled=true;try{const d=await rpc({p_body:msg});if(d.status==='active'){input.value='';render(p,d)}else p.querySelector('[data-status]').textContent='En attente d’un autre membre volontaire à moins de 500 m.'}catch(err){p.querySelector('[data-status]').textContent=err.message}finally{b.disabled=false}};
return p}
function render(p,d){p.querySelector('[data-status]').textContent=d.status==='waiting'?'En attente d’un autre membre à moins de 500 m.':'CANAL ACTIF · '+d.members+' membre(s) à proximité · messages éphémères 24 h';
const log=p.querySelector('.hx-ghost-log');log.replaceChildren();
const msgs=Array.isArray(d.messages)?d.messages:[];
msgs.reverse().forEach(m=>log.append(el('div',(m.pseudo||'Membre')+' : '+m.body,'hx-ghost-msg'+(m.mine?' mine':''))));
log.scrollTop=log.scrollHeight;
p.querySelector('form').hidden=d.status!=='active'}
async function poll(){if(busy||document.hidden)return;const p=setup();if(!p)return;
if(!document.getElementById('hellx-radar')?.classList.contains('hx-scanning')){p.querySelector('[data-status]').textContent='Active ton radar pour accéder au salon collectif.';p.querySelector('form').hidden=true;return}
busy=true;try{render(p,await rpc())}catch(e){p.querySelector('[data-status]').textContent=e.message}finally{busy=false}}
setInterval(poll,12000);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',poll);else poll();
})();
