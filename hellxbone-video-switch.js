/* HELLXBONE video selector: 1 cemetery, 2 Metal TV */
(()=>{'use strict';
let chosen='1';try{chosen=localStorage.getItem('hx-video-choice')||'1'}catch(e){}
const css=document.createElement('style');
css.textContent='#hellx-onair .hx-video-choice{display:flex;justify-content:center;gap:2px;grid-column:1/-1;z-index:20;position:relative;margin:2px auto}#hellx-onair .hx-video-choice button{background:#080e0a;color:#d8e7d9;border:1px solid #607665;padding:4px 17px;font-weight:900;border-radius:14px}#hellx-onair .hx-video-choice button[aria-pressed=true]{background:#6cfb88;color:#061008}#hellx-onair .hx-metaltv{position:absolute;inset:0;width:100%;height:100%;border:0;z-index:30;background:black}#hellx-onair.hx-tv-selected .hx-display canvas,#hellx-onair.hx-tv-selected .hx-display::before,#hellx-onair.hx-tv-selected .hx-standby-marquee{visibility:hidden!important}';
document.head.appendChild(css);
function install(){
const root=document.getElementById('hellx-onair');if(!root||root.querySelector('.hx-video-choice'))return;
const controls=root.querySelector('.hx-controls'),screen=root.querySelector('.hx-display');if(!controls||!screen)return;
const sw=document.createElement('div');sw.className='hx-video-choice';sw.setAttribute('role','group');sw.setAttribute('aria-label','Choix de vidéo');
for(const v of ['1','2']){const b=document.createElement('button');b.type='button';b.textContent=v;b.setAttribute('aria-label',v==='1'?'Cimetière':'Metal TV');b.onclick=()=>{chosen=v;try{localStorage.setItem('hx-video-choice',v)}catch(e){}draw()};sw.appendChild(b)}
controls.appendChild(sw);
function draw(){root.classList.toggle('hx-tv-selected',chosen==='2');sw.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(chosen===String(i+1))));let f=screen.querySelector('.hx-metaltv');if(chosen==='2'&&!f){f=document.createElement('iframe');f.className='hx-metaltv';f.title='Metal TV';f.allow='autoplay; fullscreen';f.src='https://metaltv.live/';screen.appendChild(f)}else if(chosen==='1'&&f)f.remove()}
draw();
}
document.addEventListener('DOMContentLoaded',()=>{install();new MutationObserver(install).observe(document.body,{childList:true,subtree:true})});
})();