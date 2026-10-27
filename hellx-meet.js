/* HELLXBONE — Rendez-vous metal, invitations volontaires sans GPS. */
(()=>{'use strict';
const PREFIX='hxmeet=';
const css=document.createElement('style');
css.textContent=`
#hellx-meet{max-width:650px;margin:12px auto 24px;background:#07150b;color:#e0ffe4;border:2px solid #53f779;border-radius:12px;padding:16px;font:15px system-ui;box-shadow:0 0 18px #20f05733}
#hellx-meet h2{font:900 22px system-ui;color:#91ffa7;margin:0 0 8px}
#hellx-meet p{line-height:1.5}
#hellx-meet label{display:block;font-weight:700;margin:12px 0 4px}
#hellx-meet input,#hellx-meet textarea{width:100%;border:1px solid #68aa77;border-radius:7px;padding:12px;background:#020b04;color:#fff;font:15px system-ui}
#hellx-meet button{background:#63ed83;color:#001909;border:0;padding:12px 14px;border-radius:7px;margin:7px 6px 5px 0;font-weight:900;cursor:pointer}
#hellx-meet button.secondary{background:#253e2b;color:#e2ffe4}
#hellx-meet .meet-invite{padding:14px;border:1px solid #58865e;background:#102b17;margin-top:12px;border-radius:9px;overflow-wrap:anywhere}
#hellx-meet .meet-note{font-size:12px;color:#b9d9bb}
`;document.head.appendChild(css);
function el(tag,value){const e=document.createElement(tag);if(value!==undefined)e.textContent=value;return e}
function pseudo(){try{return String(JSON.parse(localStorage.getItem('hellxbone-member-v1')||'null')?.name||'Membre HELLXBONE').slice(0,20)}catch{return 'Membre HELLXBONE'}}
function pack(x){const bytes=new TextEncoder().encode(JSON.stringify(x));let binary='';bytes.forEach(b=>binary+=String.fromCharCode(b));return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unpack(x){try{const b=atob(x.replace(/-/g,'+').replace(/_/g,'/'));const arr=Uint8Array.from(b,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(arr))}catch{return null}}
function invitation(){const m=new URLSearchParams(location.hash.replace(/^#/,''));const token=m.get('hxmeet');const v=token&&token.length<1500?unpack(token):null;if(!v||v.v!==1||!v.place||!v.when||!v.host||Date.parse(v.when)<Date.now()-3600000)return null;return v}
const API='https://ldibykpitjutratyqqax.supabase.co/rest/v1/rpc/';
const KEY='sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv';
async function rpc(name,params){const r=await fetch(API+name,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(params)});if(!r.ok)throw Error('Impossible d’enregistrer le rendez-vous ('+r.status+').');return r.json()}
function shareUrl(v){return location.origin+location.pathname+'#meet='+encodeURIComponent(v.id)}
async function share(v,box){
 if(!v.id){box.textContent='Lien court indisponible : réessaie de créer le rendez-vous.';return}
 const url=shareUrl(v);
 const txt='☠️ RASSEMBLE TA HORDE ! 🤘 '+v.host+' propose un rendez-vous metal à '+v.place+' le '+new Date(v.when).toLocaleString('fr-FR',{dateStyle:'medium',timeStyle:'short'})+'. Rejoins la Horde sur HELLXBONE !';
 try{if(navigator.share)await navigator.share({title:'HELLXBONE · Rassemble ta Horde',text:txt,url:url});else if(navigator.clipboard){await navigator.clipboard.writeText(txt+'\n'+url);box.textContent='Invitation copiée avec un seul lien court.'}else{box.textContent=txt+'\n'+url}}catch(e){if(e.name!=='AbortError')box.textContent=txt+'\n'+url}
}
async function resolveIncoming(){
 const params=new URLSearchParams(location.hash.replace(/^#/,''));
 const id=params.get('meet');
 if(id&&/^[0-9a-f]{12}$/.test(id)){
   try{const data=await rpc('hellx_meet_get',{p_id:id});return data?{v:1,id:data.id,host:data.host,place:data.place,when:data.when,note:data.note}:null}catch{return null}
 }
 return invitation();
}
function attach(){const radar=document.getElementById('hellx-radar');if(!radar)return false;
let root=document.getElementById('hellx-meet');if(root)return true;
root=el('section');root.id='hellx-meet';
root.innerHTML='<h2>☠ RASSEMBLE TA HORDE</h2><p>Organise un rendez-vous entre métalleux dans un lieu public : concert, festival ou bar. Invite directement tes potes !</p><button id="hellx-meet-open" type="button">CRÉER UN RENDEZ-VOUS</button><div id="hellx-meet-invite"></div><div id="hellx-meet-form" hidden><form><label for="hx-meet-place">Lieu public (nom du bar, festival, point de ralliement)</label><input id="hx-meet-place" required minlength="3" maxlength="90" placeholder="Ex : buvette du festival"><label for="hx-meet-when">Date et heure du rendez-vous</label><input id="hx-meet-when" type="datetime-local" required><label for="hx-meet-note">Message (facultatif)</label><textarea id="hx-meet-note" rows="2" maxlength="200" placeholder="Qui vient boire une mousse ?"></textarea><button type="submit">CRÉER ET PARTAGER</button><button type="button" class="secondary" id="hx-meet-cancel">ANNULER</button></form></div><p class="meet-note">Participation volontaire. Aucun GPS ni numéro de téléphone inclus dans le lien. Les rendez-vous sont enregistrés pour permettre les liens courts. Aucun GPS ni numéro privé n’est enregistré. Choisis uniquement un lieu public ; ne communique pas ton adresse privée.</p><p id="hellx-meet-status" role="status"></p>';
radar.insertAdjacentElement('afterend',root);
const status=root.querySelector('#hellx-meet-status'),form=root.querySelector('#hellx-meet-form');
root.querySelector('#hellx-meet-open').onclick=()=>{form.hidden=false;root.querySelector('#hx-meet-place').focus()};
root.querySelector('#hx-meet-cancel').onclick=()=>{form.hidden=true};
function draw(v){
 const slot=root.querySelector('#hellx-meet-invite');slot.replaceChildren();
 const card=el('div');card.className='meet-invite';
 card.append(el('strong','INVITATION DE '+v.host),el('p',v.place+' · '+new Date(v.when).toLocaleString('fr-FR',{dateStyle:'full',timeStyle:'short'})));
 if(v.note)card.append(el('p',v.note));
 const button=el('button','INVITER MES POTES');button.type='button';button.onclick=()=>share(v,status);card.append(button);
 const join=el('button',"J'ARRIVE !");join.type='button';join.className='secondary';
 join.onclick=()=>{status.textContent='Préviens tes potes avec le bouton de partage. Pour discuter sur place, active ton radar puis rejoins le Chat Fantôme à proximité.';document.getElementById('hellx-ghost')?.scrollIntoView({behavior:'smooth',block:'center'})};
 card.append(join);slot.append(card)
}
root.querySelector('form').onsubmit=async e=>{e.preventDefault();const place=root.querySelector('#hx-meet-place').value.trim(),when=root.querySelector('#hx-meet-when').value,note=root.querySelector('#hx-meet-note').value.trim();
 if(place.length<3||!when||Date.parse(when)<Date.now()){status.textContent='Indique un lieu et une date future.';return}
 const v={v:1,host:pseudo(),place:place.slice(0,90),when:new Date(when).toISOString(),note:note.slice(0,200)};
 try{v.id=await rpc('hellx_meet_create',{p_host:v.host,p_place:v.place,p_when:v.when,p_note:v.note});draw(v);form.hidden=true;await share(v,status)}catch(err){status.textContent=err.message||'Erreur lors de la création du rendez-vous.'}
};
resolveIncoming().then(incoming=>{if(incoming){draw(incoming);root.scrollIntoView({block:'start'})}})
return true
}
let attempts=0;const timer=setInterval(()=>{if(attach()||++attempts>120)clearInterval(timer)},1000);if(document.readyState!=='loading')attach();else document.addEventListener('DOMContentLoaded',attach);
})();
