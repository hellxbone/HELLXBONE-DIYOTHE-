/* HELLXBONE UNDERGROUND — social sécurisé par Supabase Auth + RLS */
(()=>{'use strict';
const BASE='https://ldibykpitjutratyqqax.supabase.co';
const KEY='sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv';
const STORE='hx-social-session-v1';
let session=null,me=null,tab='feed',timer=null,started=0,posts=[],profiles={},comments={},likes=[],follows=[];
const el=(tag,attrs={},children=[])=>{const n=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==='text')n.textContent=v;else if(k==='class')n.className=v;else if(k==='onclick')n.addEventListener('click',v);else n.setAttribute(k,v)};for(const c of children)n.append(typeof c==='string'?document.createTextNode(c):c);return n};
const modal=el('div',{id:'hx-social-modal',role:'dialog','aria-modal':'true','aria-label':'HELLXBONE UNDERGROUND'});
modal.hidden=true;
modal.append(el('div',{class:'hx-social-shell'},[
 el('div',{class:'hx-social-top'},[el('strong',{text:'☠ HELLXBONE UNDERGROUND'}),el('button',{type:'button',text:'✕',onclick:close,'aria-label':'Fermer'})]),
 el('div',{id:'hx-social-status',role:'status'}),
 el('nav',{id:'hx-social-tabs','aria-label':'Réseau social'},[
 el('button',{type:'button',text:'Fil',onclick:()=>switchTab('feed')}),
 el('button',{type:'button',text:'Membres',onclick:()=>switchTab('members')}),
 el('button',{type:'button',text:'Profil',onclick:()=>switchTab('profile')})
 ]),
 el('div',{id:'hx-social-content'})
]));
document.body.append(modal);
function status(msg){document.getElementById('hx-social-status').textContent=msg||''}
function open(){modal.hidden=false;document.body.classList.add('hx-social-open');boot()}
function close(){modal.hidden=true;document.body.classList.remove('hx-social-open')}
modal.addEventListener('click',e=>{if(e.target===modal)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
function banner(){return document.querySelector('header.hellx-header')||document.querySelector('.hellx-header')}
function bindBanner(){const b=banner();if(!b||b.dataset.socialLongpress)return;b.dataset.socialLongpress='yes';
b.style.touchAction='pan-y';b.setAttribute('title','Maintiens 5 secondes pour ouvrir HELLXBONE UNDERGROUND');
const cancel=()=>{clearTimeout(timer);timer=null;started=0};
b.addEventListener('pointerdown',e=>{if(e.button!==0)return;started=Date.now();clearTimeout(timer);timer=setTimeout(()=>{timer=null;started=0;open()},5000)});
['pointerup','pointercancel','pointerleave','contextmenu'].forEach(ev=>b.addEventListener(ev,cancel));
b.addEventListener('pointermove',e=>{if(e.buttons===0)cancel()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindBanner);else bindBanner();
async function authRequest(path,body){const r=await fetch(BASE+'/auth/v1/'+path,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.msg||j.error_description||j.message||'Connexion impossible');return j}
async function ensureSession(){try{session=JSON.parse(localStorage.getItem(STORE)||'null')}catch(e){}
if(session&&session.expires_at>Date.now()/1000+90)return;
if(session&&session.refresh_token){try{const s=await authRequest('token?grant_type=refresh_token',{refresh_token:session.refresh_token});session={...s,expires_at:Math.floor(Date.now()/1000)+(s.expires_in||3600)};localStorage.setItem(STORE,JSON.stringify(session));return}catch(e){session=null}}
const s=await authRequest('signup',{data:{}});if(!s.access_token||!s.user)throw Error('Connexion sociale indisponible : activer les connexions anonymes dans Supabase Auth.');
session={...s,expires_at:Math.floor(Date.now()/1000)+(s.expires_in||3600)};localStorage.setItem(STORE,JSON.stringify(session));
}
async function api(table,method='GET',data=null,query='',prefer='return=representation'){await ensureSession();const r=await fetch(BASE+'/rest/v1/'+table+query,{method,headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:prefer},body:data===null?undefined:JSON.stringify(data)});
if(r.status===401){localStorage.removeItem(STORE);throw Error('Session expirée, ferme puis rouvre le réseau.')}
if(!r.ok){const j=await r.json().catch(()=>({}));throw Error(j.message||'Erreur serveur '+r.status)}
return r.status===204?[]:r.json().catch(()=>[])}
function memberName(){try{return String(JSON.parse(localStorage.getItem('hellxbone-member-v1')||'{}').name||'').trim().slice(0,20)}catch(e){return ''}}
async function boot(){status('Connexion à la Horde…');try{await ensureSession();const id=session.user.id;let p=await api('hx_social_profiles','GET',null,'?user_id=eq.'+encodeURIComponent(id));
if(!p.length){const name=memberName();if(!name){status('Inscris d’abord ton pseudo HELLXBONE CLUB.');return}p=await api('hx_social_profiles','POST',{user_id:id,pseudo:name})}
me=p[0];status('');await switchTab('feed')}catch(e){status(e.message);const c=document.getElementById('hx-social-content');c.replaceChildren(el('button',{text:'Réessayer',onclick:boot}))}}
async function switchTab(t){tab=t;for(const [i,b]of [...document.querySelectorAll('#hx-social-tabs button')].entries())b.setAttribute('aria-current',(['feed','members','profile'][i]===t)?'page':'false');if(!me)return;
status('Chargement…');try{if(t==='feed')await feed();if(t==='members')await members();if(t==='profile')await profile();status('')}catch(e){status(e.message)}}
const content=()=>document.getElementById('hx-social-content');
function button(text,fn,cls=''){return el('button',{type:'button',text,class:cls,onclick:fn})}
function label(tag,text){return el(tag,{text})}
function postAuthor(user){return profiles[user]?.pseudo||'Membre HELLXBONE'}
async function loadSocial(){const [ps,pr,lk,fo]=await Promise.all([
 api('hx_social_posts','GET',null,'?select=*&order=created_at.desc&limit=60'),
 api('hx_social_profiles','GET',null,'?select=user_id,pseudo,bio&limit=500'),
 api('hx_social_likes','GET',null,'?select=post_id,user_id&limit=3000'),
 api('hx_social_follows','GET',null,'?select=follower_id,following_id&limit=3000')
]);posts=ps;profiles=Object.fromEntries(pr.map(p=>[p.user_id,p]));likes=lk;follows=fo;}
async function feed(){await loadSocial();const c=content();c.replaceChildren();const form=el('form',{class:'hx-social-compose'});
const field=el('textarea',{placeholder:'Quoi de neuf dans la Horde ?','aria-label':'Ta publication',maxlength:'3000',required:''});
const media=el('input',{type:'url',placeholder:'Lien HTTPS photo ou vidéo (facultatif)','aria-label':'Lien média',maxlength:'1000'});
form.append(label('h3','Publier dans la Horde'),field,media,el('button',{type:'submit',text:'Publier'}));form.addEventListener('submit',async e=>{e.preventDefault();const body=field.value.trim();if(!body)return;try{await api('hx_social_posts','POST',{user_id:me.user_id,body,media_url:media.value.trim()||null});await feed()}catch(x){status(x.message)}});c.append(form);
if(!posts.length)c.append(label('p','Le mur est vide. Publie le premier message !'));
for(const p of posts){const card=el('article',{class:'hx-social-post'});card.append(label('strong',postAuthor(p.user_id)),label('small',new Date(p.created_at).toLocaleString('fr-FR')),label('p',p.body));
if(p.media_url){const url=p.media_url;try{if(new URL(url).protocol==='https:'){const a=el('a',{href:url,target:'_blank',rel:'noopener noreferrer',text:'Voir le média'});if(/\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url)){const img=el('img',{src:url,loading:'lazy',alt:'Photo publiée'});a.replaceChildren(img)}card.append(a)}}catch(e){}}
const n=likes.filter(l=>l.post_id===p.id).length;const liked=likes.some(l=>l.post_id===p.id&&l.user_id===me.user_id);
const actions=el('div',{class:'hx-social-actions'});
actions.append(button((liked?'♥':'♡')+' '+n,async()=>{try{if(liked)await api('hx_social_likes','DELETE',null,'?post_id=eq.'+p.id+'&user_id=eq.'+me.user_id,'return=minimal');else await api('hx_social_likes','POST',{post_id:p.id,user_id:me.user_id});await feed()}catch(e){status(e.message)}}),button('Commentaires',()=>showComments(p.id,card)));
if(p.user_id===me.user_id)actions.append(button('Supprimer',async()=>{if(!confirm('Supprimer cette publication ?'))return;try{await api('hx_social_posts','DELETE',null,'?id=eq.'+p.id,'return=minimal');await feed()}catch(e){status(e.message)}}));
else actions.append(button('Signaler',async()=>{const reason=prompt('Pourquoi signaler cette publication ?');if(!reason||reason.trim().length<3)return;try{await api('hx_social_reports','POST',{post_id:p.id,reporter_id:me.user_id,reason:reason.trim()});status('Signalement envoyé.')}catch(e){status(e.message)}}));
card.append(actions);c.append(card)}
}
async function showComments(postId,card){let area=card.querySelector('.hx-social-comments');if(area){area.remove();return}area=el('div',{class:'hx-social-comments'});card.append(area);const data=await api('hx_social_comments','GET',null,'?post_id=eq.'+postId+'&order=created_at.asc&limit=100');for(const item of data){const l=el('p',{},[el('b',{text:postAuthor(item.user_id)+': '}),document.createTextNode(item.body)]);if(item.user_id===me.user_id)l.append(button('✕',async()=>{await api('hx_social_comments','DELETE',null,'?id=eq.'+item.id,'return=minimal');l.remove()}));area.append(l)}
const form=el('form');const input=el('input',{placeholder:'Écrire un commentaire',required:'',maxlength:'1000'});form.append(input,el('button',{type:'submit',text:'Envoyer'}));form.onsubmit=async e=>{e.preventDefault();try{await api('hx_social_comments','POST',{post_id:postId,user_id:me.user_id,body:input.value.trim()});area.remove();await showComments(postId,card)}catch(x){status(x.message)}};area.append(form)}
async function members(){await loadSocial();const c=content();c.replaceChildren(label('h3','Les membres de la Horde'));const search=el('input',{type:'search',placeholder:'Chercher un pseudo'});c.append(search);const listing=el('div');c.append(listing);
function draw(){listing.replaceChildren();Object.values(profiles).filter(p=>p.pseudo.toLowerCase().includes(search.value.toLowerCase())).slice(0,100).forEach(p=>{const line=el('div',{class:'hx-social-person'});line.append(el('strong',{text:p.pseudo}),label('p',p.bio||''));if(p.user_id!==me.user_id){const following=follows.some(f=>f.follower_id===me.user_id&&f.following_id===p.user_id);line.append(button(following?'Ne plus suivre':'Suivre',async()=>{try{if(following)await api('hx_social_follows','DELETE',null,'?follower_id=eq.'+me.user_id+'&following_id=eq.'+p.user_id,'return=minimal');else await api('hx_social_follows','POST',{follower_id:me.user_id,following_id:p.user_id});await members()}catch(e){status(e.message)}}))}listing.append(line)})}search.addEventListener('input',draw);draw()}
async function profile(){await loadSocial();const c=content();c.replaceChildren(label('h3','Mon profil'));const form=el('form',{class:'hx-social-compose'});const name=el('input',{value:me.pseudo,maxlength:'24',required:'','aria-label':'Pseudo'});const bio=el('textarea',{maxlength:'500',placeholder:'Ma présentation','aria-label':'Présentation'});bio.value=me.bio||'';form.append(label('p','Pseudo'),name,label('p','Présentation'),bio,el('button',{type:'submit',text:'Enregistrer'}));form.onsubmit=async e=>{e.preventDefault();try{const [p]=await api('hx_social_profiles','PATCH',{pseudo:name.value.trim(),bio:bio.value.trim()},'?user_id=eq.'+me.user_id);me=p;status('Profil enregistré')}catch(x){status(x.message)}};c.append(form,label('p','Publications : '+posts.filter(p=>p.user_id===me.user_id).length+' · Abonnés : '+follows.filter(f=>f.following_id===me.user_id).length+' · Abonnements : '+follows.filter(f=>f.follower_id===me.user_id).length))}
})();