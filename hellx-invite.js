/* HELLXBONE — invitation simple sur l'accueil */
(()=>{'use strict';
if(window.__hellxInvite)return;window.__hellxInvite=true;
const URL='https://hellxbone.github.io/HELLXBONE-DIYOTHE-/';
const MESSAGE='☠️🔥 Rejoins-moi dans HELLXBONE CLUB ! 🤘 Club rock & metal gratuit : radio, news, mini-jeux, carte de membre et surprises infernales. Entre dans l’enfer : '+URL;
const css=document.createElement('style');
css.textContent='#hellx-invite-home{max-width:650px;margin:16px auto 20px;padding:0 12px;box-sizing:border-box;text-align:center}#hellx-invite-button{display:block;width:100%;padding:17px 16px;border:2px solid #9dff68;border-radius:13px;background:linear-gradient(135deg,#0c1c0d,#285426 55%,#09140a);color:#eeffe6;font:900 clamp(16px,4.4vw,21px)/1.35 system-ui;letter-spacing:.6px;box-shadow:0 0 20px #4cff4a55;cursor:pointer}#hellx-invite-button:focus-visible{outline:3px solid #fff;outline-offset:4px}#hellx-invite-feedback{font:13px system-ui;color:#a8ff86;min-height:18px;margin:8px 0 0}';
document.head.append(css);
async function invite(){
try{
if(navigator.share){await navigator.share({title:'HELLXBONE CLUB',text:MESSAGE,url:URL});return}
if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(MESSAGE);feedback('Invitation copiée ! Colle-la dans un message à tes potes.');return}
fallback();
}catch(e){if(e?.name!=='AbortError')fallback()}
}
function feedback(t){const node=document.getElementById('hellx-invite-feedback');if(node)node.textContent=t}
function fallback(){const text=document.createElement('textarea');text.value=MESSAGE;text.style.cssText='position:fixed;left:-9999px';document.body.append(text);text.select();let ok=false;try{ok=document.execCommand('copy')}catch{}text.remove();feedback(ok?'Invitation copiée !':'Copie ce lien : '+URL)}
function mount(){
const app=document.getElementById('app');if(!app)return;
const radio=app.querySelector('#hellx-onair');
if(!radio){document.getElementById('hellx-invite-home')?.remove();return}
if(document.getElementById('hellx-invite-home'))return;
const wrap=document.createElement('section');wrap.id='hellx-invite-home';
const button=document.createElement('button');button.id='hellx-invite-button';button.type='button';button.textContent='☠ INVITER MES POTES 🤘';button.addEventListener('click',invite);
const hint=document.createElement('p');hint.id='hellx-invite-feedback';hint.textContent='Fais entrer tes amis dans HELLXBONE CLUB — gratuit.';
wrap.append(button,hint);
radio.insertAdjacentElement('afterend',wrap);
}
function init(){const app=document.getElementById('app');if(!app)return;mount();new MutationObserver(()=>mount()).observe(app,{childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();