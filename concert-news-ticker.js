/* HELLXBONE — annonces de concerts issues du flux d'actualités existant.
   Pas de dates inventées, ni de clés/API supplémentaires. */
(function(){
'use strict';
const ID='hx-concert-news';
const SOURCES=/^https:\/\/(?:www\.)?(?:metalorgie\.com|metalzone\.fr|info-lux\.com)\//i;
const EVENT=/(?:concerts? en france|concerts? (?:à|au|aux|le|les|prévu|annoncé)|joueront le|jouera (?:le|à|au)|se produira|sera en concert|en concert (?:à|au|le)|dates? de (?:concerts?|tournée)|programmation (?:du|de la)|à l.affiche|(?:festival|fest) 20\d\d|(?:festival|fest) (?:à|du|le)|tournée (?:française|européenne)|en tournée (?:en|à|avant)|fera .*concerts?)/i;
const EXCLUDE=/(?:annul|reporté|annonce.*annulation|refusé|a refusé|concert entier.*sortie live|film[ée].*concert)/i;
let lastStamp='';
function mount(){
 const host=document.getElementById(ID);
 if(!host||host.dataset.ready)return;
 host.dataset.ready='1';
 refresh(host);
}
function draw(host,items){
 const track=host.querySelector('.hx-concert-track');
 if(!track)return;
 track.replaceChildren();
 if(!items.length){
   const s=document.createElement('span');s.className='hx-concert-empty';
   s.textContent='AUCUNE NOUVELLE ANNONCE DE CONCERT POUR LE MOMENT';
   track.append(s);host.classList.add('hx-concert-idle');return;
 }
 host.classList.remove('hx-concert-idle');
 const group=()=>{const row=document.createElement('span');row.className='hx-concert-group';
   for(const item of items){const a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';
     a.textContent=item.title; a.title='Lire l’annonce sur '+item.source;row.append(a);
     const dot=document.createElement('span');dot.textContent=' ◆ ';dot.setAttribute('aria-hidden','true');row.append(dot);}
   return row;};
 track.append(group(),group());track.lastElementChild.setAttribute('aria-hidden','true');
 const seconds=Math.max(32,items.length*9);
 track.style.setProperty('--hx-concert-duration',seconds+'s');
}
async function refresh(host){
 try{
  const response=await fetch('./metal-news.json?v='+Math.floor(Date.now()/3600000),{cache:'no-store'});
  if(!response.ok)throw new Error('flux');
  const feed=await response.json();
  const now=Date.now();
  const items=(Array.isArray(feed.items)?feed.items:[]).filter(item=>{
    if(!item||!SOURCES.test(item.url||''))return false;
    const d=Date.parse(item.date||'');
    if(!Number.isFinite(d)||d>now+86400000||d<now-14*86400000)return false;
    const content=String(item.title||'')+' '+String(item.summary||'');
    return EVENT.test(content)&&!EXCLUDE.test(content);
  }).slice(0,8);
  draw(host,items);
 }catch(e){draw(host,[]);}
}
function boot(){
 const app=document.getElementById('app');
 if(!app)return;
 mount();
 new MutationObserver(mount).observe(app,{childList:true});
 setInterval(()=>{const host=document.getElementById(ID);if(host)refresh(host);},3600000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
