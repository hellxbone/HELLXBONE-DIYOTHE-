/* HELLXBONE — chat privé de proximité, consentement par radar, accès JWT/RLS. */
(()=>{'use strict';
const ROOT='https://ldibykpitjutratyqqax.supabase.co',KEY='sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv';
const STORE='hellx-nearby-auth-v1';
let token=null,expires=0,refresh=null,active=false,working=false,tick=null,current=null,known=[],inbox=[],panel=null;
const style=document.createElement('style');
style.textContent=`
#hellx-radar .hx-nearby-chat{margin:14px 0;padding:12px;border:1px solid #56895c;background:#06170d;color:#d6ffe0;border-radius:8px;font:14px monospace}
#hellx-radar .hx-nearby-chat h3{color:#a8ffa9;font:900 17px monospace;margin:4px 0 10px}
#hellx-radar .hx-nearby-chat button{font:700 12px monospace!important;padding:8px 11px!important;margin:3px!important}
#hellx-radar .hx-nearby-chat .hx-chat-row{border-bottom:1px solid #24482b;padding:8px 0;display:flex;gap:7px;align-items:center;flex-wrap:wrap}
#hellx-radar .hx-nearby-chat .hx-chat-row span{flex:1;min-width:115px}
#hellx-radar .hx-nearby-chat .hx-chat-box{max-height:250px;overflow:auto;background:#020a04;border:1px solid #376942;padding:8px;margin:8px 0}
#hellx-radar .hx-nearby-chat .hx-msg{padding:5px;margin:5px 0;background:#1b3623;border-radius:5px;overflow-wrap:anywhere}
#hellx-radar .hx-nearby-chat .hx-msg.mine{text-align:right;background:#315b35}
#hellx-radar .hx-nearby-chat input{width:100%;background:#061008;color:#f0fff1;border:1px solid #71c17b;border-radius:6px;padding:10px;font:15px sans-serif}
`;
document.head.appendChild(style);
function safeRead(){try{return JSON.parse(localStorage.getItem(STORE)||'null')}catch{return null}}
function saveAuth(x){try{localStorage.setItem(STORE,JSON.stringify(x))}catch{}}
async function auth(){
 const s=safeRead();if(s&&s.access_token&&s.expires_at>Date.now()/1000+90){token=s.access_token;return token}
 if(s?.refresh_token){const res=await fetch(ROOT+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});if(res.ok){const v=await res.json();token=v.access_token;saveAuth({...v,expires_at:Math.floor(Date.now()/1000)+v.expires_in});return token}}
 const res=await fetch(ROOT+'/auth/v1/signup',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({data:{hellxbone_radar:true}})});
 if(!res.ok)throw Error('Connexion sécurisée indisponible. Activer les comptes anonymes dans Supabase Auth.');
 const v=await res.json();if(!v.access_token)throw Error('Connexion sécurisée non activée sur le serveur.');
 token=v.access_token;saveAuth({...v,expires_at:Math.floor(Date.now()/1000)+v.expires_in});return token;
}
async function rpc(name,data={}){
 await auth();
 let res=await fetch(ROOT+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(data)});
 if(res.status===401){localStorage.removeItem(STORE);await auth();res=await fetch(ROOT+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(data)})}
 if(!res.ok)throw Error('Service indisponible ('+res.status+').');
 return res.status===204?null:res.json().catch(()=>null);
}
function pseudo(){try{return (JSON.parse(localStorage.getItem('hellxbone-member-v1')||'null')?.name||localStorage.getItem('hellx-riff-player-name')||'Métalleux').slice(0,20)}catch{return 'Métalleux'}}
function el(tag,text,klass){const e=document.createElement(tag);if(text!=null)e.textContent=text;if(klass)e.className=klass;return e}
function note(msg){if(panel){let p=panel.querySelector('[data-hx-status]');if(p)p.textContent=msg}}
function view(){
 const radar=document.getElementById('hellx-radar');if(!radar)return;
 if(panel?.parentNode!==radar){panel=el('section',null,'hx-nearby-chat');panel.innerHTML='<h3>☠ TRANSMISSION ENTRE MÉTALLEUX</h3><p>Chat privé à moins de 500 m. Chaque membre accepte la demande avant de recevoir des messages. GPS exact masqué.</p><p data-hx-status>Active ton radar pour ouvrir le chat.</p><div data-hx-near></div><div data-hx-inbox></div><div data-hx-conversation></div>';radar.appendChild(panel)}
 }
function draw(){
 if(!panel)return;
 const near=panel.querySelector('[data-hx-near]'),box=panel.querySelector('[data-hx-inbox]');near.replaceChildren();box.replaceChildren();
 if(!active){note('Active ton radar pour autoriser ta présence sur le chat.');return}
 near.appendChild(el('strong','MÉTALLEUX À MOINS DE 500 M'));
 if(!known.length)near.appendChild(el('p','Aucun métalleux disponible dans ce rayon.'));
 known.forEach(m=>{const line=el('div',null,'hx-chat-row');line.append(el('span',m.pseudo+' · '+m.distance));const b=el('button','CONTACTER');b.type='button';b.onclick=async()=>{b.disabled=true;try{await rpc('hellx_nearby_request',{p_to:m.user_id});note('Demande envoyée. Le membre doit accepter.');await loadInbox()}catch(e){note(e.message)}finally{b.disabled=false}};line.append(b);near.append(line)});
 box.appendChild(el('h3','MESSAGES & INVITATIONS'));
 inbox.forEach(m=>{
 const other=m.direction==='sent'?m.recipient:m.sender;
 const line=el('div',null,'hx-chat-row');line.append(el('span',m.pseudo+' · '+(m.status==='accepted'?'conversation active':m.status==='pending'?'demande en attente':'refusée')));
 if(m.status==='pending'&&m.direction==='received'){
 for(const [label,yes] of [['ACCEPTER',true],['REFUSER',false]]){const b=el('button',label);b.onclick=async()=>{try{await rpc('hellx_nearby_respond',{p_id:m.id,p_accept:yes});await loadInbox()}catch(e){note(e.message)}};line.append(b)}
 }else if(m.status==='accepted'){const b=el('button','ÉCRIRE');b.onclick=()=>openChat(other,m.pseudo);line.append(b)}
 const block=el('button','BLOQUER');block.className='hx-off';block.onclick=async()=>{if(!confirm('Bloquer ce membre et masquer ses messages ?'))return;try{await rpc('hellx_nearby_block',{p_user:other});if(current===other)current=null;await loadInbox();await scan()}catch(e){note(e.message)}};line.append(block);box.append(line);
 });
}
async function loadInbox(){inbox=await rpc('hellx_nearby_inbox')||[];draw();if(current)await renderMessages()}
async function openChat(id,name){current=id;view();panel.querySelector('[data-hx-conversation]').replaceChildren();const cont=panel.querySelector('[data-hx-conversation]');cont.append(el('h3','CHAT PRIVÉ · '+name));const msg=el('div',null,'hx-chat-box');msg.dataset.hxMessages='1';cont.append(msg);const form=el('form');const input=el('input');input.maxLength=500;input.required=true;input.placeholder='Ton message (500 caractères max)';input.setAttribute('aria-label','Écrire un message');const button=el('button','ENVOYER');button.type='submit';form.append(input,button);form.onsubmit=async e=>{e.preventDefault();const body=input.value.trim();if(!body)return;button.disabled=true;try{await rpc('hellx_nearby_send',{p_to:id,p_body:body});input.value='';await renderMessages()}catch(err){note(err.message)}finally{button.disabled=false}};cont.append(form);await renderMessages()}
async function renderMessages(){if(!current||!panel)return;const box=panel.querySelector('[data-hx-messages]');if(!box)return;try{const messages=await rpc('hellx_nearby_history',{p_with:current})||[];box.replaceChildren();messages.forEach(m=>box.append(el('div',(m.mine?'Moi : ':'Métalleux : ')+m.body,'hx-msg'+(m.mine?' mine':''))));box.scrollTop=box.scrollHeight}catch(e){note(e.message)}}
async function scan(){
 if(!active||working||document.hidden)return;working=true;
 try{const geo=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,maximumAge:25000,timeout:14000}));if(!active)return;
 known=await rpc('hellx_nearby_ping',{p_pseudo:pseudo(),p_lat:geo.coords.latitude,p_lon:geo.coords.longitude})||[];
 await loadInbox();note('Canal sécurisé actif · '+known.length+' membre(s) à moins de 500 m.');
 }catch(e){note(e.code===1?'Autorisation GPS nécessaire pour chatter.':e.message)}finally{working=false}
}
async function stop(){if(!active)return;active=false;known=[];current=null;draw();panel?.querySelector('[data-hx-conversation]')?.replaceChildren();try{await rpc('hellx_nearby_off')}catch{}}
function sync(){view();const radar=document.getElementById('hellx-radar');const wanted=!!radar?.classList.contains('hx-scanning')&&!document.hidden;if(wanted&&!active){active=true;scan()}else if(!wanted&&active)stop()}
setInterval(()=>{sync();if(active&&!document.hidden)scan()},35000);
setInterval(()=>{if(active&&!document.hidden){loadInbox().catch(()=>{});if(current)renderMessages()}},12000);
document.addEventListener('visibilitychange',sync);
new MutationObserver(sync).observe(document.getElementById('app')||document.body,{childList:true,subtree:false});
setInterval(sync,1500);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
})();