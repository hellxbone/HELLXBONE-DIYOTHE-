/* HELLXBONE — monochrome illustrated SVG icons for navigation (non-interactive decoration). */
(()=>{'use strict';
const art={
'accueil':'<path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M10 21v-7h4v7"/>',
'magazine':'<path d="M4 4h14v16H4zM18 8h3v12H8"/><path d="M7 8h8M7 12h8M7 16h5"/>',
'boutique':'<path d="M4 8h16l-1.5 13h-13zM9 9V6a3 3 0 0 1 6 0v3"/>',
'jeu':'<path d="M7 8h10c4 0 5 3 6 9 .5 4-2 5-5 2l-2-2H8l-2 2c-3 3-5 2-5-2C2 11 3 8 7 8Z"/><path d="M7 11v5m-2.5-2.5h5M17 12h.01M19 15h.01"/>',
'apropos':'<path d="M12 2 9 9l-6-3 3 7-3 4 8-1 1 6 2-6 7 1-4-6 2-6-6 4Z"/>',
'horde':'<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="m8 15 4 3 4-3M12 2v3"/>',
'radio':'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="m6 8 12-5M6 12h7M6 16h7"/><circle cx="17" cy="15" r="2"/>'
};
function decorate(button,key){
 if(!art[key]||button.querySelector('.hx-grunge-icon'))return;
 const label=button.textContent.trim().replace(/^[^\p{L}\p{N}]+/u,'').trim();
 const labelText=label||button.textContent.trim();
 button.replaceChildren();
 const icon=document.createElement('span');icon.className='hx-grunge-icon';icon.setAttribute('aria-hidden','true');
 icon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+art[key]+'</svg>';
 const caption=document.createElement('span');caption.textContent=labelText;
 button.append(icon,caption);
}
function refresh(){
 document.querySelectorAll('nav[aria-label="Navigation principale"] button[data-page]').forEach(b=>decorate(b,b.dataset.page));
 document.querySelectorAll('#hx-quick-nav button[data-hx-section]').forEach(b=>decorate(b,b.dataset.hxSection));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
const watcher=new MutationObserver(()=>refresh());
watcher.observe(document.documentElement,{childList:true,subtree:true});
})();
