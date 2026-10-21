/* HELLXBONE — Secousse infernale | PWA Android, sans bouton */
(function(){
'use strict';
if(window.__hellxShakeInstalled)return;
window.__hellxShakeInstalled=true;
const COOLDOWN=25000, DURATION=3600;
let last=0, peaks=[], gravity={x:0,y:0,z:0}, initialized=false, active=false;
let audioCtx=null, audioUnlocked=false;
const reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function unlockAudio(){
  audioUnlocked=true;
  try{const C=window.AudioContext||window.webkitAudioContext;if(C){audioCtx=audioCtx||new C();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});}}catch(e){}
}
document.addEventListener('pointerdown',unlockAudio,{passive:true});
document.addEventListener('keydown',unlockAudio,{passive:true});
function rumble(){
  if(!audioUnlocked||!audioCtx)return;
  try{
    if(audioCtx.state!=='running')return;
    const t=audioCtx.currentTime, osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
    osc.type='sawtooth';osc.frequency.setValueAtTime(83,t);osc.frequency.exponentialRampToValueAtTime(31,t+0.9);
    gain.gain.setValueAtTime(0.0001,t);gain.gain.exponentialRampToValueAtTime(0.075,t+0.06);gain.gain.exponentialRampToValueAtTime(0.0001,t+1.1);
    osc.connect(gain);gain.connect(audioCtx.destination);osc.start(t);osc.stop(t+1.15);
  }catch(e){}
}
function effect(){
 if(active||document.hidden||document.documentElement.classList.contains('hellx-gate-pending'))return;
 active=true;last=Date.now();
 let wrap=document.createElement('div');
 wrap.className='hellx-shake-portal';
 wrap.setAttribute('role','status');wrap.setAttribute('aria-live','polite');
 wrap.innerHTML='<div class="hellx-shake-lightning" aria-hidden="true"></div><div class="hellx-shake-inner"><div class="hellx-shake-skull" aria-hidden="true">☠</div><div class="hellx-shake-title">HELLXBONE CLUB</div><div class="hellx-shake-sub">TU VIENS DE RÉVEILLER L’ENFER</div></div>';
 document.body.appendChild(wrap);
 try{if(navigator.vibrate)navigator.vibrate([100,65,180,65,280])}catch(e){}
 rumble();
 setTimeout(()=>{wrap.classList.add('hellx-shake-out');setTimeout(()=>{wrap.remove();active=false},reduced?100:400)},reduced?1300:DURATION);
}
function onMotion(e){
 if(document.hidden||active||Date.now()-last<COOLDOWN||document.documentElement.classList.contains('hellx-gate-pending'))return;
 const a=e.accelerationIncludingGravity||e.acceleration;
 if(!a||a.x==null||a.y==null||a.z==null)return;
 let x=a.x,y=a.y,z=a.z;
 if(!initialized){gravity={x,y,z};initialized=true;return;}
 gravity.x=gravity.x*.82+x*.18;gravity.y=gravity.y*.82+y*.18;gravity.z=gravity.z*.82+z*.18;
 const magnitude=Math.hypot(x-gravity.x,y-gravity.y,z-gravity.z);
 const now=Date.now();
 peaks=peaks.filter(p=>now-p<850);
 if(magnitude>14&&(peaks.length===0||now-peaks[peaks.length-1]>160)){
   peaks.push(now);
   if(peaks.length>=2){peaks=[];effect();}
 }
}
const css=document.createElement('style');
css.id='hellx-shake-style';
css.textContent=`
.hellx-shake-portal{position:fixed;inset:0;z-index:2147483646;background:radial-gradient(ellipse at center,#163219 0%,#020702 62%,#000 100%);color:#a7ff5b;display:grid;place-items:center;overflow:hidden;pointer-events:none;animation:hellx-portal-in .22s ease-out both}
.hellx-shake-inner{text-align:center;padding:22px;position:relative;z-index:2;max-width:95vw;text-shadow:0 0 15px #69ff4b}
.hellx-shake-skull{font-size:clamp(130px,47vw,250px);line-height:1;color:#c5ffc0;filter:drop-shadow(0 0 24px #37ff27);animation:hellx-skull-rise .65s cubic-bezier(.18,1.5,.35,1) both}
.hellx-shake-title{font-weight:1000;font-size:clamp(24px,8vw,40px);letter-spacing:2px;color:#aaff8a}
.hellx-shake-sub{font-weight:900;font-size:clamp(16px,5.7vw,27px);letter-spacing:1px;color:white;margin-top:14px}
.hellx-shake-lightning{position:absolute;inset:0;background:repeating-linear-gradient(118deg,transparent 0 16%,#42ff6444 17%,transparent 19% 39%);mix-blend-mode:screen;opacity:.7;animation:hellx-lightning .35s steps(2,end) 8}
.hellx-shake-portal.hellx-shake-out{opacity:0;transition:opacity .35s ease}
@keyframes hellx-portal-in{from{opacity:0}to{opacity:1}}
@keyframes hellx-skull-rise{from{transform:scale(.2) rotate(-14deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
@keyframes hellx-lightning{0%,100%{opacity:.1}35%{opacity:.9}55%{opacity:.2}80%{opacity:1}}
@media(prefers-reduced-motion:reduce){.hellx-shake-portal,.hellx-shake-skull,.hellx-shake-lightning{animation:none!important}.hellx-shake-portal.hellx-shake-out{transition:none}}
`;
document.head.appendChild(css);
if('DeviceMotionEvent' in window){window.addEventListener('devicemotion',onMotion,{passive:true});}
})();
