(()=>{
// Clips directs de secours : la découverte principale vient de MusicBrainz.
// Découverte de vrais morceaux complets mis en écoute publique sur Audius.
const genres=['metal','death metal','black metal','thrash metal','doom metal','metalcore','heavy metal','progressive metal','hardcore punk','punk rock','industrial metal','sludge','grindcore','symphonic metal'];
const used=new Set();
async function getJSON(url,ms=12000){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),ms);
 try{const res=await fetch(url,{signal:ctrl.signal,headers:{Accept:'application/json'}});if(!res.ok)throw Error('HTTP '+res.status);return await res.json();}
 finally{clearTimeout(timer);}
}
const acceptable=t=>{
 const genre=String(t.genre||'').toLowerCase(),tags=String(t.tags||'').toLowerCase(),title=String(t.title||'').toLowerCase();
 const text=genre+' '+tags+' '+title;
 return /metal|rock|punk|hardcore|grind|sludge|doom|goth|thrash|deathcore|blackgaze/.test(text)&&!t.is_stream_gated&&!t.is_delete&&Number(t.duration)>=70&&Number(t.duration)<=1800&&t.id&&t.user?.name;
};
async function discover(){
 for(let attempt=0;attempt<5;attempt++){
  const genre=genres[Math.floor(Math.random()*genres.length)];
  const offset=Math.floor(Math.random()*4)*20;
  const uri='https://api.audius.co/v1/tracks/search?query='+encodeURIComponent(genre)+'&limit=35&offset='+offset+'&app_name=HELLXBONE';
  try{
   const result=await getJSON(uri,13000);
   const tracks=(result.data||[]).filter(t=>acceptable(t)&&!used.has(t.id));
   if(!tracks.length)continue;
   const t=tracks[Math.floor(Math.random()*tracks.length)];
   used.add(t.id);if(used.size>150)used.clear();
   return {name:t.user.name,genre:t.genre||genre,track:t.title,
     stream:'https://api.audius.co/v1/tracks/'+encodeURIComponent(t.id)+'/stream?app_name=HELLXBONE'};
  }catch(e){}
 }
 throw Error('Aucun titre complet disponible');
}
let dialog, angle=0, spinning=false;
const css=[
'#hx-roulette{background:#080908;color:#fff;border:2px solid #81ff8a;border-radius:20px;width:min(96vw,520px);max-width:96vw;max-height:94dvh;overflow:auto;padding:18px;box-sizing:border-box;box-shadow:0 0 45px #358c424f}',
'#hx-roulette::backdrop{background:rgba(0,0,0,.92)}',
'#hx-roulette *{box-sizing:border-box}',
'#hx-roulette h2{font-size:clamp(26px,7vw,37px);color:#8dff98;margin:6px 0}',
'#hx-roulette .hx-top{display:flex;align-items:start;justify-content:space-between;gap:10px}',
'#hx-roulette .hx-close{background:#242424;color:#fff;border:1px solid #777;border-radius:9px;padding:10px 14px}',
'#hx-roulette .hx-sub{font-size:14px;color:#ddd;margin:8px 0 15px}',
'#hx-roulette .hx-wheel{position:relative;width:min(74vw,340px);aspect-ratio:1;margin:20px auto}',
'#hx-roulette .hx-arrow{position:absolute;z-index:2;top:-22px;left:50%;transform:translateX(-50%);color:#fff;font-size:36px;text-shadow:0 1px 5px #000}',
'#hx-roulette .hx-disc{position:absolute;inset:0;border:9px solid #1b1b1b;border-radius:50%;box-shadow:0 0 0 3px #8cff90,0 0 25px #62ff6a4f;background:conic-gradient(#762033 0 90deg,#174024 90deg 180deg,#762033 180deg 270deg,#174024 270deg 360deg);transition:transform 4.1s cubic-bezier(.11,.82,.13,1)}',
'#hx-roulette .hx-mark{position:absolute;left:50%;top:50%;font-size:clamp(10px,2.7vw,15px);font-weight:950;color:white;text-shadow:0 1px 5px #000;line-height:1.12;text-align:center;width:39%;overflow-wrap:anywhere}',
'#hx-roulette .hx-center{position:absolute;inset:38%;display:grid;place-items:center;border-radius:50%;background:#070a07;border:3px solid #91ff94;color:#aaffb0;font-weight:950;font-size:20px}',
'#hx-roulette .hx-spin{display:block;width:100%;border:0;border-radius:12px;padding:17px 12px;background:#75ff83;color:#061008;font-size:19px;font-weight:950}',
'#hx-roulette .hx-spin:disabled{opacity:.55}',
'#hx-roulette .hx-result{margin-top:16px;background:#111b12;border:2px solid #396e40;border-radius:15px;padding:16px;text-align:center}',
'#hx-roulette .hx-label{font-size:12px;color:#aaffb0;letter-spacing:2px;font-weight:900}',
'#hx-roulette .hx-name{font-weight:950;font-size:clamp(29px,8vw,42px);color:#fff;line-height:1.12;margin:9px 0;overflow-wrap:anywhere}',
'#hx-roulette .hx-genre{color:#ddd;font-size:17px}',
'#hx-roulette .hx-track{color:#acffb0;font-size:18px;font-weight:850;margin:7px 0}',
'#hx-roulette .hx-audio{width:100%;margin:14px auto;display:block;accent-color:#7cff84}',
'#hx-roulette .hx-status{color:#c7eac7;font-size:14px;margin:12px 0}',
'#hx-roulette .hx-note{color:#ccc;font-size:12px;text-align:center}',
'#hx-roulette [hidden]{display:none!important}'
].join('');
function setup(){
 if(dialog)return dialog;
 const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
 dialog=document.createElement('dialog');dialog.id='hx-roulette';
 dialog.innerHTML='<div class="hx-top"><div><div class="hx-label">HELLXBONE • DÉCOUVERTES</div><h2>☠ ROULETTE METAL</h2></div><button type="button" class="hx-close">✕</button></div><p class="hx-sub">Une découverte metal au hasard. Des morceaux entiers, sans vidéo !</p><div class="hx-wheel"><div class="hx-arrow">▼</div><div class="hx-disc"></div><div class="hx-center">HX</div></div><button class="hx-spin" type="button">⚡ FAIRE TOURNER LA ROUE</button><section class="hx-result" aria-live="polite"><div class="hx-label">LE GROUPE À DÉCOUVRIR</div><p class="hx-intro">Des groupes et des morceaux complets publiés sur Audius. Lance la roulette !</p><div class="hx-picked" hidden><div class="hx-name"></div><div class="hx-genre"></div><div class="hx-track"></div><audio class="hx-audio" controls preload="none" playsinline hidden></audio><p class="hx-status" role="status"></p></div></section><p class="hx-note">Seuls les morceaux complets accessibles en streaming sont sélectionnés. Aucun extrait, aucune vidéo.</p>';
 document.body.appendChild(dialog);
 const disk=dialog.querySelector('.hx-disc');
 dialog.querySelector('.hx-close').onclick=()=>{dialog.querySelector('.hx-audio').pause();dialog.close();};
 dialog.querySelector('.hx-spin').onclick=()=>{
  if(spinning)return;spinning=true;const btn=dialog.querySelector('.hx-spin');btn.disabled=true;
  const oldAudio=dialog.querySelector('.hx-audio');oldAudio.pause();oldAudio.removeAttribute('src');oldAudio.load();oldAudio.hidden=true;
  dialog.querySelector('.hx-picked').hidden=true;dialog.querySelector('.hx-intro').hidden=false;
  const target=Math.floor(Math.random()*360);
  const delta=(target-(angle%360)+360)%360;angle+=1800+delta;
  disk.style.transform='rotate('+angle+'deg)';
  setTimeout(async()=>{
   const root=dialog;
   root.querySelector('.hx-intro').textContent='Recherche d’un groupe dans la scène metal mondiale…';
   try{
    const b=await discover();
    root.querySelector('.hx-name').textContent=b.name;
    root.querySelector('.hx-genre').textContent=b.genre;
    root.querySelector('.hx-track').textContent=b.track;
    const audio=root.querySelector('.hx-audio'),status=root.querySelector('.hx-status');
    audio.src=b.stream;audio.hidden=false;
    status.textContent='Morceau complet — Lecture/Pause dans HELLXBONE, sans vidéo.';
    audio.onerror=()=>{status.textContent='Ce titre ne peut pas être lu. Relance la roue : ce groupe sera ignoré.';audio.hidden=true;};
    root.querySelector('.hx-picked').hidden=false;root.querySelector('.hx-intro').hidden=true;
   }catch(e){
    root.querySelector('.hx-intro').textContent='Aucun morceau complet trouvé cette fois. Relance pour une nouvelle découverte.';
   }
   spinning=false;btn.disabled=false;
  },4200);
 };
 return dialog;
}
document.addEventListener('click',e=>{if(!e.target.closest('[data-discovery-open]'))return;e.preventDefault();const d=setup();if(!d.open)d.showModal();});
})();