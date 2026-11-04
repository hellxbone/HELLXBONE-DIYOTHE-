/* HELLXBONE — Habillage RADAR / CHAT FANTÔME, conserve les modules Supabase existants. */
(()=>{'use strict';
if(window.__hxRadarArtwork)return;window.__hxRadarArtwork=true;
const style=document.createElement('style');
style.textContent=`
#hx-art-radar,#hx-art-chat{position:relative;width:min(100%,520px);aspect-ratio:865/1536;margin:0 auto;background:#000 center/100% 100% no-repeat;overflow:hidden;color:#baffbb}
#hx-art-radar{background-image:url('./hellxbone-radar-1.webp')}
#hx-art-chat{background-image:url('./hellxbone-radar-2.webp')}
#hx-art-radar[hidden],#hx-art-chat[hidden]{display:none!important}
#hx-art-radar .hx-art-hit,#hx-art-chat .hx-art-hit{position:absolute;padding:0!important;margin:0!important;border:0!important;box-shadow:none!important;background:transparent!important;color:transparent!important;font:0/0 sans-serif!important;cursor:pointer;z-index:9;touch-action:manipulation}
#hx-art-radar .hx-art-hit:focus-visible,#hx-art-chat .hx-art-hit:focus-visible{outline:3px solid white!important;outline-offset:-3px!important}
#hx-art-radar .hx-art-scope{position:absolute;left:26.3%;top:23.7%;width:47.4%;height:24.6%;border-radius:50%;overflow:hidden}
#hx-art-radar .hx-art-scope .hx-radar-screen{width:100%!important;height:100%!important;aspect-ratio:1!important;margin:0!important;border:0!important;outline:0!important;box-shadow:none!important}

#hx-art-radar .hx-art-scope{box-sizing:border-box;left:29%;top:25.4%;width:42%;height:auto;aspect-ratio:1;background:#021108;border-radius:50%;overflow:hidden}
#hx-art-radar .hx-art-scope .hx-radar-screen{position:relative!important;display:block!important;box-sizing:border-box!important;width:100%!important;height:100%!important;aspect-ratio:1!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;overflow:hidden!important;isolation:isolate;background:repeating-radial-gradient(circle,transparent 0 19.5%,#36ff5f45 19.8% 20%,transparent 20.4% 20.5%),linear-gradient(90deg,transparent 49.75%,#43ff6059 50%,transparent 50.25%),linear-gradient(0deg,transparent 49.75%,#43ff6059 50%,transparent 50.25%),radial-gradient(circle,#0a3419,#041e0d 65%,#010b05)!important;box-shadow:inset 0 0 26px #10ff5240!important}
#hx-art-radar .hx-radar-screen::before{content:"";position:absolute;inset:0;z-index:5;pointer-events:none;border-radius:50%;background:repeating-linear-gradient(0deg,#03100422 0px,#03100422 1px,transparent 2px,transparent 5px)}
#hx-art-radar .hx-radar-screen::after{content:none!important}
#hx-art-radar .hx-radar-sweep{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,transparent 0deg,transparent 288deg,#21c94a12 312deg,#46f96c66 347deg,#acffc4e8 359deg,transparent 360deg);animation:hellx-radar-rotate 4.2s linear infinite;pointer-events:none;z-index:2}
#hx-art-radar .hx-radar-sweep::after{content:"";position:absolute;left:50%;top:50%;width:48%;height:2px;background:#baffc1;box-shadow:0 0 8px 2px #52ff76;transform-origin:left center;transform:rotate(-90deg)}
#hx-art-radar .hx-radar-center{position:absolute;left:50%;top:50%;height:8px;width:8px;transform:translate(-50%,-50%);border-radius:50%;background:#d8ffda;box-shadow:0 0 10px #60ff70;z-index:4}
#hx-art-radar .hx-radar-dots{position:absolute;inset:0;z-index:3;pointer-events:none}
#hx-art-radar .hx-radar-dot{position:absolute;width:9px;height:9px;border:1px solid #efffee;border-radius:50%;transform:translate(-50%,-50%);background:#bcffac;box-shadow:0 0 8px 3px #68ff82;animation:hellx-radar-pulse 1.7s infinite}
#hx-art-radar .hx-radar-label,#hx-art-radar .hx-radar-range{display:none!important}
#hx-horde-panel:has(#hx-art-views)>#hellx-meet{display:none!important}
#hx-art-meet #hellx-meet{display:block!important;position:static!important;margin:0!important;width:100%!important}
@media(prefers-reduced-motion:reduce){#hx-art-radar .hx-radar-sweep,#hx-art-radar .hx-radar-dot{animation:none!important}}
#hx-art-radar .hx-hit-chat{left:6%;top:60.7%;width:88%;height:14.4%}
#hx-art-radar .hx-hit-meet{left:25%;top:74.5%;width:50%;height:5.8%}
#hx-art-radar .hx-hit-back{left:26%;top:90.4%;width:49%;height:7.3%}
#hx-art-radar .hx-art-toggle{position:absolute;left:8%;top:54.8%;width:84%;height:5.1%;z-index:10;background:transparent!important;color:transparent!important;border:0!important;font-size:0!important;box-shadow:none!important}
#hx-art-radar .hx-art-toggle:focus-visible{outline:2px solid white!important}
#hx-art-radar .hx-art-led{position:absolute;right:19%;top:22.5%;width:2.4%;height:1.4%;border-radius:100%;background:#555}
#hx-art-radar.hx-art-active .hx-art-led{background:#80ff60;box-shadow:0 0 12px #39ff14}
#hx-art-chat .hx-chat-window{position:absolute;left:9.1%;top:33.7%;width:81.5%;height:38.7%;overflow:visible;z-index:2}
#hx-art-chat #hellx-ghost{margin:0!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;height:100%;display:flex;flex-direction:column}
#hx-art-chat #hellx-ghost>h3,#hx-art-chat #hellx-ghost>p:not([data-status]){display:none!important}
#hx-art-chat #hellx-ghost [data-status]{font-size:11px!important;line-height:1.2!important;text-align:center;margin:0!important;color:#afffb9!important}
#hx-art-chat #hellx-ghost .hx-ghost-log{flex:1;min-height:0;max-height:none!important;overflow-y:auto!important;background:transparent!important;border:0!important;padding:4px!important}
#hx-art-chat #hellx-ghost form{position:absolute;top:104%;left:0;width:100%;height:12%;display:flex!important;gap:2%;margin:0!important;z-index:4}
#hx-art-chat #hellx-ghost form[hidden]{display:none!important}
#hx-art-chat #hellx-ghost form input{width:72%;height:100%;border:0!important;background:transparent!important;color:white!important;font-size:14px!important;outline:none}
#hx-art-chat #hellx-ghost form button{width:26%;height:100%;border:0!important;background:transparent!important;color:transparent!important;font-size:0!important;box-shadow:none!important}
#hx-art-chat .hx-hit-back{left:26%;top:90.4%;width:49%;height:7.3%}
#hx-art-views{width:100%;margin:auto;background:#000}
#hx-art-views #hellx-radar{position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;padding:0!important;margin:0!important;border:0!important;box-shadow:none!important;background:transparent!important;opacity:0!important;pointer-events:none!important}
#hx-art-views #hellx-radar>h2,#hx-art-views #hellx-radar>.hx-mil-heading,#hx-art-views #hellx-radar>p,#hx-art-views #hellx-radar>ul,#hx-art-views #hellx-radar>.hx-nearby-chat{display:none!important}
#hx-art-views #hellx-radar>#hellx-radar-toggle{display:none!important}
#hx-art-meet{padding:12px;background:#000;border:1px solid #38ff28}
#hx-art-meet[hidden]{display:none!important}
#hx-art-meet .hx-art-back{display:block;margin:10px auto;padding:13px 26px;border:1px solid #39ff14;background:#071a09;color:#9fff9b;font-weight:bold}
#hx-art-views .hx-art-status{position:absolute;left:10%;top:58%;width:80%;font-size:11px;text-align:center;pointer-events:none;color:#aaffaf;z-index:3}
`;
document.head.append(style);
const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e};
let mounted=false;
function mount(){
const radar=document.getElementById('hellx-radar'),horde=document.getElementById('hx-horde-panel'),ghost=document.getElementById('hellx-ghost');
if(!radar||!horde||!ghost||document.getElementById('hx-art-views'))return;
const art=mk('div');art.id='hx-art-views';
const front=mk('section');front.id='hx-art-radar';front.setAttribute('aria-label','Radar HELLXBONE');
const chat=mk('section');chat.id='hx-art-chat';chat.hidden=true;chat.setAttribute('aria-label','Chat Fantôme');
const meet=mk('section');meet.id='hx-art-meet';meet.hidden=true;
const scope=mk('div','hx-art-scope');const realScope=radar.querySelector('.hx-radar-screen');if(realScope)scope.append(realScope);front.append(scope);
const led=mk('span','hx-art-led');front.append(led);
const toggle=mk('button','hx-art-toggle');toggle.type='button';toggle.setAttribute('aria-label','Activer ou couper mon radar');toggle.onclick=()=>radar.querySelector('#hellx-radar-toggle')?.click();front.append(toggle);
const status=mk('div','hx-art-status');status.setAttribute('role','status');front.append(status);
function hotspot(parent,cls,label,action){const b=mk('button','hx-art-hit '+cls);b.type='button';b.setAttribute('aria-label',label);b.addEventListener('click',action);parent.append(b)}
function show(name){front.hidden=name!=='radar';chat.hidden=name!=='chat';meet.hidden=name!=='meet';if(name==='chat')ghost.querySelector('input')?.focus({preventScroll:true});art.scrollIntoView({block:'start'})}
hotspot(front,'hx-hit-chat','Ouvrir le Chat Fantôme',()=>show('chat'));
hotspot(front,'hx-hit-meet','Créer un rendez-vous',()=>{const original=document.getElementById('hellx-meet');if(!original)return;meet.append(original);show('meet');original.querySelector('#hellx-meet-open')?.click()});
hotspot(front,'hx-hit-back','Retour à l’accueil',()=>{document.querySelector('nav[aria-label="Navigation principale"] [data-page="accueil"]')?.click();show('radar')});
const windowEl=mk('div','hx-chat-window');windowEl.append(ghost);chat.append(windowEl);
hotspot(chat,'hx-hit-back','Retour au radar',()=>show('radar'));
const backMeet=mk('button','hx-art-back','← RETOUR AU RADAR');backMeet.type='button';backMeet.onclick=()=>show('radar');meet.append(backMeet);
art.append(front,chat,meet);horde.prepend(art);front.append(radar);
// Le rendez-vous existant doit vivre UNIQUEMENT dans la sous-page, et non sous le radar.
const originalMeet=document.getElementById('hellx-meet');if(originalMeet)meet.append(originalMeet);
const refresh=()=>{front.classList.toggle('hx-art-active',radar.classList.contains('hx-scanning'));const raw=radar.querySelector('#hellx-radar-status')?.textContent||'';status.textContent=/refus|indisponible|impossible|erreur/i.test(raw)?raw:''};
new MutationObserver(refresh).observe(radar,{attributes:true,attributeFilter:['class'],subtree:false});const statusEl=radar.querySelector('#hellx-radar-status');if(statusEl)new MutationObserver(refresh).observe(statusEl,{childList:true,characterData:true,subtree:true});refresh();
mounted=true;
}
function preflight(){
const paths=['./hellxbone-radar-1.webp','./hellxbone-radar-2.webp'];
Promise.all(paths.map(src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(true);i.onerror=()=>resolve(false);i.src=src}))).then(results=>{if(!results.every(Boolean))return;setInterval(()=>{if(!mounted)mount()},1000);mount()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',preflight);else preflight();
})();