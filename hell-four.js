(function hellFourModule(){
'use strict';
const URL='https://ldibykpitjutratyqqax.supabase.co/rest/v1/rpc/hell_four_api';
const KEY='sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv';
const IMAGE='./file_00000000590c81f49fa3bd7facf9f13a.png';
const DEVICE='hellx-club-device-v1';
const state={open:false,loaded:false,waiting:false,data:null,selected:null,panel:'lobby',error:'',notice:'',timer:null,previousOverflow:''};
let root=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const id=()=>localStorage.getItem(DEVICE)||'';
const GAME_KEY='hell-four-last-game';
function uidOk(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);}
function online(p){return p==='HELLX'||(state.data?.members||[]).some(m=>m.pseudo===p);}
function available(g){return !!g&&(g.bot||online(g.opponent));}
function dot(){return '<span class="hf-online" aria-label="En ligne"></span>';}
function selectedGame(){return(state.data?.games||[]).find(g=>g.id===state.selected)||null;}
function mount(){
 if(root)return;
 const style=document.createElement('style');
 style.id='hell-four-style';
 style.textContent=`
 #hell-four-root{position:fixed;inset:0;z-index:2147483400;background:#000;color:#fff;font-family:system-ui,Arial,sans-serif;display:none;align-items:center;justify-content:center;overscroll-behavior:contain}
 #hell-four-root.hf-visible{display:flex}
 #hell-four-root *{box-sizing:border-box}
 #hell-four-root .hf-stage{position:relative;width:min(100vw,600px,calc(100dvh * 0.55));height:auto;aspect-ratio:0.55;container-type:inline-size;background:#030603;overflow:hidden;isolation:isolate}
 #hell-four-root .hf-art{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;user-select:none}
 #hell-four-root .hf-close{position:absolute;left:1%;top:0.2%;width:12%;height:7%;border:0;background:transparent;cursor:pointer;z-index:8}
 #hell-four-root .hf-name{position:absolute;top:24.65%;width:27%;height:3%;z-index:2;display:flex;align-items:center;justify-content:center;font-size:clamp(10px,3.25vw,17px);font-weight:900;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px #000}
 #hell-four-root .hf-left{left:15%;color:#a0ff3c}
 #hell-four-root .hf-right{left:58%;color:#ff6767}
 #hell-four-root .hf-turn{position:absolute;left:32%;top:29.55%;width:45%;height:3.35%;z-index:2;background:#061004ed;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#a7ff61;font-size:clamp(10px,3.1vw,16px);font-weight:900;text-align:center;line-height:1.1;text-shadow:0 0 7px #51ff36;overflow:hidden}
 #hell-four-root .hf-drop{position:absolute;z-index:3;top:36.6%;width:10.2%;height:5%;transform:translateX(-50%);border:0;padding:0;background:transparent;cursor:pointer}
 #hell-four-root .hf-drop:disabled{cursor:default}
 #hell-four-root .hf-drop:focus-visible{outline:2px solid white}
 #hell-four-root .hf-cell{position:absolute;width:10.2%;height:auto;aspect-ratio:1;border:0;border-radius:50%;padding:0;margin:0;transform:translate(-50%,-50%);z-index:3;background:transparent;cursor:pointer;display:flex;justify-content:center;align-items:center}
 #hell-four-root .hf-cell:disabled{cursor:default}
 #hell-four-root .hf-cell:focus-visible{outline:3px solid #fff;outline-offset:2px}
 #hell-four-root .hf-token{width:89%;height:auto;aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:clamp(13px,4vw,24px);color:#071006}
 #hell-four-root .hf-token.green{background:radial-gradient(circle at 33% 24%,#e1ffc2 0%,#89ff12 28%,#238800 68%,#063800 100%);box-shadow:inset -3px -4px 6px #000a,0 0 9px #8dff15;border:1px solid #ddff9e}
 #hell-four-root .hf-token.red{background:radial-gradient(circle at 33% 24%,#ffcebc 0%,#ff513c 30%,#a60006 70%,#450003 100%);box-shadow:inset -3px -4px 6px #000a,0 0 9px #ff3b21;border:1px solid #ffb4a0}
 #hell-four-root .hf-token.green,#hell-four-root .hf-token.red{background-size:contain;background-position:center;background-repeat:no-repeat;box-shadow:none;border:0;width:100%;height:auto;aspect-ratio:1}
 #hell-four-root .hf-token.green{background-image:url("file_00000000096c81f48c8eee9fcc280bbf.png")}
 #hell-four-root .hf-token.red{background-image:url("file_00000000a8748210bccea0acb3420832.png")}
 #hell-four-root .hf-cell.hf-winning{z-index:4;outline:3px solid #fff4a0;box-shadow:0 0 8px 3px #ffd700,0 0 18px 5px #ffb300}
 #hell-four-root .hf-winning .hf-token{filter:brightness(1.35)}
 #hell-four-root .hf-zone{position:absolute;z-index:4;top:81%;height:10%;padding:0;border:0;background:transparent;cursor:pointer}
 #hell-four-root .hf-zone.challenge{left:0;width:34%}
 #hell-four-root .hf-zone.replay{left:34%;width:32%}
 #hell-four-root .hf-zone.ranking{left:66%;width:34%}
 #hell-four-root .hf-zone:focus-visible{outline:3px solid white;outline-offset:-3px}
 #hell-four-root .hf-shade{position:absolute;inset:0;z-index:5;background:rgba(0,0,0,.35)}
 #hell-four-root .hf-dialog{position:absolute;z-index:6;left:5%;right:5%;top:35%;bottom:12%;border:2px solid #83ff28;border-radius:14px;background:rgba(3,8,3,.97);box-shadow:0 0 24px #31ed3480,inset 0 0 22px #0f390c;overflow:auto;padding:clamp(12px,3vw,20px);-webkit-overflow-scrolling:touch;scrollbar-color:#87ff21 #101610}
 #hell-four-root .hf-dialog h2{margin:0 0 12px;color:#a0ff4b;font-size:clamp(18px,5vw,26px);text-align:center}
 #hell-four-root .hf-dialog p{font-size:14px;line-height:1.35;margin:8px 0}
 #hell-four-root .hf-actions{display:grid;gap:9px;margin:12px 0}
 #hell-four-root .hf-action{display:block;width:100%;padding:12px 10px;min-height:44px;border:1px solid #7dff20;border-radius:10px;background:linear-gradient(135deg,#233c13,#070c04);color:#fff;font-weight:800;font-size:14px;text-align:center;cursor:pointer;line-height:1.25}
 #hell-four-root .hf-action.secondary{border-color:#6e7770;background:#111b11}
 #hell-four-root .hf-action.red{border-color:#f75b4c;background:#38120f}
 #hell-four-root .hf-action:disabled{opacity:.5}
 #hell-four-root .hf-row{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #34502b}
 #hell-four-root .hf-online{display:inline-block;width:8px;height:8px;border-radius:50%;background:#48ff36;box-shadow:0 0 6px #48ff36;margin-right:6px;flex-shrink:0}
 #hell-four-root .hf-row strong{font-size:13px;max-width:48%;overflow-wrap:anywhere}
 #hell-four-root .hf-row button{width:auto;min-width:100px;padding:9px}
 #hell-four-root .hf-minor{color:#c1d3b9;font-size:12px}
 #hell-four-root .hf-error{color:#ff9d92!important;font-weight:700;overflow-wrap:anywhere}
 #hell-four-root .hf-toast{position:absolute;z-index:9;top:33%;left:6%;right:6%;pointer-events:none;text-align:center;background:#101a0ff4;color:#fff;padding:8px;border:1px solid #a3ff57;border-radius:8px;font-size:13px;font-weight:700}
 #hell-four-root .hf-empty{color:#dce8d6;font-size:13px}
 #hell-four-root .hf-table{width:100%;border-collapse:collapse;font-size:13px}
 #hell-four-root .hf-table th,#hell-four-root .hf-table td{padding:7px 3px;text-align:left;border-bottom:1px solid #405631}
 #hell-four-root .hf-table th{color:#b7ff79}
 #hell-four-root .hf-wait{position:absolute;z-index:2;left:15%;right:15%;top:76.7%;text-align:center;background:#030903dc;color:#d7ffbe;font-weight:800;font-size:11px;border-radius:5px;line-height:1.3}
 @media(min-width:600px){#hell-four-root .hf-name{font-size:19px}#hell-four-root .hf-turn{font-size:19px}}
 @media(max-height:600px){#hell-four-root .hf-dialog{top:33%;bottom:10%}#hell-four-root .hf-action{padding:7px;min-height:35px}}
 `;
 document.head.appendChild(style);
 root=document.createElement('div');
 root.id='hell-four-root';
 root.setAttribute('role','dialog');
 root.setAttribute('aria-label','HELL FOUR – duel entre membres');
 root.setAttribute('aria-modal','true');
 root.innerHTML=`<div class="hf-stage">
  <img class="hf-art" src="${IMAGE}" alt="HELL FOUR, plateau de 7 colonnes et 6 lignes" draggable="false"/>
  <button class="hf-close" data-hf="close" aria-label="Retour aux jeux"></button>
  <div class="hf-name hf-left"></div><div class="hf-name hf-right"></div>
  <div class="hf-turn" aria-live="polite"></div>
  <div class="hf-arrows"></div><div class="hf-cells"></div>
  <div class="hf-wait" hidden></div>
  <button class="hf-zone challenge" data-hf="choose" aria-label="Défier un membre"></button>
  <button class="hf-zone replay" data-hf="replay" aria-label="Revanche"></button>
  <button class="hf-zone ranking" data-hf="ranking" aria-label="Classement HELL FOUR"></button>
  <div class="hf-shade" hidden></div><div class="hf-dialog" hidden></div>
  <div class="hf-toast" hidden role="status"></div>
 </div>`;
 document.body.appendChild(root);
 root.addEventListener('click',onClick);
}
function showError(message){
 state.error=message;
 state.panel='error';
 render();
}
async function request(action='lobby',options={}){
 const member=id();
 if(!uidOk(member))throw new Error('Compte membre indisponible. Retourne à l’accueil et reconnecte ton pseudo.');
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),14000);
 try{
  const res=await fetch(URL,{
   method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},
   body:JSON.stringify({p_member_id:member,p_action:action,p_game_id:options.gameId??null,p_opponent:options.opponent??null,p_col:options.col??null}),
   signal:controller.signal,cache:'no-store'
  });
  const data=await res.json().catch(()=>null);
  if(!res.ok)throw new Error({
    PAS_TON_TOUR:"Ce n’est pas ton tour.",
    COLONNE_PLEINE_OU_INVALIDE:"Colonne indisponible, choisis-en une autre.",
    ADVERSAIRE_INVALIDE:"Ce membre n’est plus disponible.",
    MEMBRE_INCONNU:"Ton inscription n’est plus reconnue. Retourne à l’accueil.",
    TROP_DE_DEFIS:"Tu as trop de parties ouvertes, termine d’abord tes duels.",
    DEFI_NON_DISPONIBLE:"Ce défi n’est plus disponible."
   }[data?.message]||'Serveur indisponible ('+res.status+'). Réessaie.');
  return data;
 }catch(e){
  if(e.name==='AbortError')throw new Error('Connexion trop lente. Réessaie.');
  throw e;
 }finally{clearTimeout(timeout)}
}
function apply(data){
 state.data=data;
 if(data?.selected_game_id!=null)state.selected=Number(data.selected_game_id);
 if(state.selected!=null && !data.games?.some(g=>g.id===state.selected))state.selected=null;
 if(state.selected!=null){try{localStorage.setItem(GAME_KEY,String(state.selected))}catch(e){}}
 state.loaded=true;
 render();
}
async function run(action,options={},nextPanel=null){
 if(state.waiting)return;
 state.waiting=true;
 try{
  const data=await request(action,options);
  if(nextPanel!==null)state.panel=nextPanel;
  state.error='';
  apply(data);
  if(action==='new' && state.open) eerieMusicBox();
 }catch(e){showError(e.message||'Une erreur est survenue.');}
 finally{state.waiting=false;if(state.open)render();}
}
async function refresh(silent=false){
 if(!state.open||state.waiting)return;
 state.waiting=true;
 try{
  const data=await request('lobby');
  if(!state.open)return;
  if(!state.loaded){
   const recent=Number(localStorage.getItem(GAME_KEY)||'0');
   if(data.games?.some(g=>g.id===recent && g.status!=='declined'))state.selected=recent;
  }
  const old=selectedGame();const fresh=data.games?.find(g=>g.id===state.selected);
  if(old&&fresh&&fresh.board.some((v,i)=>v!==old.board[i]))bip();
  state.data=data;
  state.loaded=true;
  if(state.selected!=null && !data.games.some(g=>g.id===state.selected))state.selected=null;
  if(selectedGame()?.status==='pending'&&!available(selectedGame())){state.selected=null;state.panel='lobby';}
  render();
 }catch(e){if(!silent)showError(e.message||'Impossible de récupérer les parties.');}
 finally{state.waiting=false;if(state.open)render();}
}
function turnText(g){
 if(!g)return 'CHOISIS UN ADVERSAIRE';
 if(!available(g)&&g.status==='pending')return 'CHOISIS UN ADVERSAIRE';
 if(g.status==='pending')return g.me_side===2?'ACCEPTE LE DÉFI !':'DÉFI EN ATTENTE';
 if(g.status==='declined')return 'DÉFI REFUSÉ';
 if(g.status==='done'){
  if(g.winner===3)return 'MATCH NUL';
  return g.winner===g.me_side?'VICTOIRE !':'DÉFAITE';
 }
 return g.turn===g.me_side?'À TOI DE JOUER !':'AU TOUR DE '+g.opponent.toUpperCase();
}
function panelHtml(){
 const g=selectedGame();
 const games=(state.data?.games||[]).filter(available);
 if(state.panel==='error'){
  return `<h2>HELL FOUR</h2><p class="hf-error">${esc(state.error)}</p><div class="hf-actions"><button class="hf-action" data-hf="retry">RÉESSAYER</button><button class="hf-action secondary" data-hf="lobby">RETOUR</button></div>`;
 }
 if(state.panel==='ranking'){
  const rank=state.data?.ranking||[];
  return `<h2>CLASSEMENT HELL FOUR</h2>${rank.length?`<table class="hf-table"><thead><tr><th>#</th><th>Membre</th><th>Gagnées</th><th>Perdues</th></tr></thead><tbody>${rank.map((m,i)=>`<tr><td>${i+1}</td><td>${esc(m.pseudo)}</td><td>${Number(m.wins)||0}</td><td>${Number(m.losses)||0}</td></tr>`).join('')}</tbody></table>`:'<p>Aucun duel terminé entre membres.</p>'}<div class="hf-actions"><button class="hf-action secondary" data-hf="lobby">RETOUR</button></div>`;
 }
 if(state.panel==='choose'){
  const members=state.data?.members||[];
  return `<h2>DÉFIER UN MEMBRE</h2><div class="hf-actions"><button class="hf-action" data-hf="bot">JOUER CONTRE HELLX</button></div>
  ${members.length?`<p class="hf-minor">Défie un membre actuellement en ligne.</p>${members.map(m=>`<div class="hf-row"><strong>${dot()}${esc(m.pseudo)}</strong><button class="hf-action" data-hf="challenge" data-opponent="${esc(m.pseudo)}">DÉFIER</button></div>`).join('')}`:'<p class="hf-empty">Aucun autre joueur en ligne. HELLX est prêt à jouer.</p>'}
  <div class="hf-actions"><button class="hf-action secondary" data-hf="lobby">RETOUR</button></div>`;
 }
 if(state.panel==='invite' && available(g) && g?.status==='pending' && g.me_side===2){
  return `<h2>DÉFI DE ${esc(g.opponent)}</h2><p>Tu as reçu un défi de Puissance 4 !</p><div class="hf-actions"><button class="hf-action" data-hf="accept">ACCEPTER LE DUEL</button><button class="hf-action red" data-hf="decline">REFUSER</button><button class="hf-action secondary" data-hf="lobby">PLUS TARD</button></div>`;
 }
 if(state.panel==='result' && g?.status==='done'){
  const message=g.winner===3?'MATCH NUL':g.winner===g.me_side?'VICTOIRE !':'DÉFAITE';
  return `<h2>${message}</h2><p>Face à ${esc(g.opponent)}.</p><div class="hf-actions"><button class="hf-action" data-hf="replay">REVANCHE</button><button class="hf-action secondary" data-hf="hide">VOIR LA GRILLE</button><button class="hf-action secondary" data-hf="lobby">AUTRES PARTIES</button></div>`;
 }
 const pending=games.filter(g=>g.status==='pending'&&g.me_side===2);
 const active=games.filter(g=>g.status==='active');
 const outbound=games.filter(g=>g.status==='pending'&&g.me_side===1);
 return `<h2>HELL FOUR</h2><p>Puissance 4 version métal : aligne quatre crânes pour gagner.</p>
   ${pending.length?`<p><strong style="color:#ff8a70">${pending.length} défi(s) reçu(s)</strong></p>${pending.map(g=>`<div class="hf-row"><strong>${dot()}${esc(g.opponent)}</strong><button class="hf-action" data-hf="view" data-id="${g.id}">ACCEPTER</button></div>`).join('')}`:''}
   ${active.length?`<p><strong>Parties en cours</strong></p>${active.slice(0,10).map(g=>`<div class="hf-row"><strong>${dot()}${esc(g.opponent)}</strong><button class="hf-action" data-hf="view" data-id="${g.id}">${g.turn===g.me_side?'À TOI':'VOIR'}</button></div>`).join('')}`:''}
   ${outbound.length?`<p class="hf-minor">Défis envoyés : ${outbound.map(g=>esc(g.opponent)).join(', ')}</p>`:''}
   <div class="hf-actions"><button class="hf-action" data-hf="bot">JOUER CONTRE HELLX</button>${state.data?.members?.length?`<button class="hf-action" data-hf="choose">DÉFIER UN MEMBRE</button>`:""}${g?`<button class="hf-action secondary" data-hf="hide">RETOUR À LA GRILLE</button>`:''}</div>`;
}
let audio=null, tickTimer=null;
let introMaster=null;
function stopIntro(){if(introMaster){try{introMaster.disconnect()}catch(e){}introMaster=null;}}
function eerieMusicBox(){
 stopIntro();
 try{
 unlockAudio();if(!audio)return;
 const master=audio.createGain();master.gain.value=1.35;master.connect(audio.destination);introMaster=master;
 const start=audio.currentTime+.04;
 // Original mechanical jewelry-box melody, with struck metal comb resonances.
 const melody=[[76,0],[79,.32],[84,.64],[79,.96],[76,1.28],[72,1.60],[74,1.96],[77,2.28],[81,2.60],[77,2.92],[74,3.24],[71,3.56],[72,3.96],[76,4.28],[79,4.60],[72,5.02]];
 melody.forEach(([m,offset],i)=>{
 const t=start+offset+(i%3)*.008,f=440*Math.pow(2,(m-69)/12);
 [[1,.46,.9],[2.01,.18,.44],[3.98,.085,.21],[6.73,.045,.09]].forEach(([ratio,amp,decay])=>{
 const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f*ratio;
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(amp,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+decay);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+decay+.01);
 });
 const n=audio.createBuffer(1,Math.ceil(audio.sampleRate*.023),audio.sampleRate),d=n.getChannelData(0);
 for(let j=0;j<d.length;j++)d[j]=(Math.random()*2-1)*Math.exp(-j/(d.length*.14));
 const s=audio.createBufferSource(),g=audio.createGain(),filter=audio.createBiquadFilter();s.buffer=n;filter.type='bandpass';filter.frequency.value=3400;g.gain.value=.10;s.connect(filter);filter.connect(g);g.connect(master);s.start(t);
 });
 setTimeout(()=>{try{master.disconnect()}catch(e){}if(introMaster===master)introMaster=null;},6300);
 }catch(e){}
}
function stopTicks(){clearInterval(tickTimer);tickTimer=null;}
function tick(){try{if(!audio||audio.state!=='running')return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type='triangle';o.frequency.value=440;g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.001,t+.075);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.08);}catch(e){}}
function syncTicks(game){const on=state.open&&state.panel==='play'&&game?.status==='active'&&!document.hidden;if(!on){stopTicks();return;}if(!tickTimer){tick();tickTimer=setInterval(()=>{if(document.hidden)stopTicks();else tick();},650);}}
function thinkDelay(board){const filled=board.filter(Boolean).length;let threats=0;for(let c=0;c<7;c++){for(const side of [1,2]){const b=board.slice();for(let r=5;r>=0;r--){const i=r*7+c;if(!b[i]){b[i]=side;if(winningCells(b,side).size)threats++;break;}}}}const complexity=Math.min(1,filled/42+threats*.15);return Math.round(1000+3000*Math.min(1,.55*Math.random()+.45*complexity));}
function unlockAudio(){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch(e){}}
function bip(){try{if(!audio||audio.state!=='running')return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.frequency.value=720;g.gain.setValueAtTime(.65,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.13);}catch(e){}}
function winningCells(board,winner){
 if(winner!==1&&winner!==2)return new Set();
 for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){
  const er=r+3*dr,ec=c+3*dc;if(er<0||er>=6||ec<0||ec>=7)continue;
  const cells=Array.from({length:4},(_,k)=>(r+k*dr)*7+c+k*dc);
  if(cells.every(i=>board[i]===winner))return new Set(cells);
 }
 return new Set();
}
function render(){
 if(!root)return;
 const g=selectedGame();
 const board=(Array.isArray(g?.board)&&g.board.length===42?g.board:Array(42).fill(0)).map(n=>Number(n)||0);
 const winning=g?.status==='done'?winningCells(board,Number(g.winner)):new Set();
 root.querySelector('.hf-left').textContent=g?g.challenger_name:state.data?.me||'JOUEUR 1';
 root.querySelector('.hf-right').textContent=g?g.opponent_name:'HELLX';
 root.querySelector('.hf-turn').textContent=turnText(g);
 syncTicks(g);
 const challenge=root.querySelector('.hf-zone.challenge');challenge.disabled=!state.data?.members?.length;challenge.style.background=challenge.disabled?'#030603':'';challenge.style.opacity=challenge.disabled?'1':'';
 if(g&&available(g)){const side=g.me_side===1?'.hf-right':'.hf-left';root.querySelector(side).insertAdjacentHTML('afterbegin',dot());}
 const enabled=!!g&&g.status==='active'&&g.turn===g.me_side&&!state.waiting;
 root.querySelector('.hf-arrows').innerHTML=Array.from({length:7},(_,c)=>`<button class="hf-drop" style="left:${16+11.3*c}%" data-hf="col" data-col="${c}" aria-label="Jouer dans la colonne ${c+1}" ${!enabled||board[c]!==0?'disabled':''}></button>`).join('');
 root.querySelector('.hf-cells').innerHTML=board.map((v,i)=>{
  const c=i%7,r=Math.floor(i/7),x=16+11.3*c,y=44.3+6.23*r;
  return `<button class="hf-cell ${winning.has(i)?'hf-winning':''}" style="left:${x}%;top:${y}%" data-hf="col" data-col="${c}" aria-label="Colonne ${c+1}, ligne ${r+1}${v?', occupée':' vide'}" ${!enabled||board[c]!==0?'disabled':''}>${v?`<span class="hf-token ${v===1?'green':'red'}" aria-hidden="true"></span>`:''}</button>`;
 }).join('');
 const wait=root.querySelector('.hf-wait');
 wait.hidden=!(available(g)&&g.status==='pending'&&g.me_side===1);
 if(!wait.hidden)wait.textContent='DÉFI ENVOYÉ — EN ATTENTE DE '+g.opponent.toUpperCase();
 const dialog=root.querySelector('.hf-dialog'),shade=root.querySelector('.hf-shade');
 const show=state.panel!=='play';
 dialog.hidden=shade.hidden=!show;
 if(show)dialog.innerHTML=panelHtml();
}
function toast(message){
 if(!root)return;
 const el=root.querySelector('.hf-toast');
 el.textContent=message;el.hidden=false;
 clearTimeout(toast.timer);
 toast.timer=setTimeout(()=>{el.hidden=true},3000);
}
function open(){
 mount();
 if(state.open)return;
 state.open=true;
 state.loaded=false;
 state.panel='lobby';
 state.selected=null;
 state.data=null;
 state.previousOverflow=document.body.style.overflow;
 document.body.style.overflow='hidden';
 root.classList.add('hf-visible');
 render();
 refresh();
 state.timer=setInterval(()=>{if(!document.hidden)refresh(true)},12000);
}
function close(){
 if(!state.open)return;
 state.open=false;
 clearInterval(state.timer);stopTicks();stopIntro();
 clearTimeout(toast.timer);
 root.classList.remove('hf-visible');
 document.body.style.overflow=state.previousOverflow;
}
async function onClick(e){
 const action=e.target.closest('[data-hf]');
 if(!action||!root?.contains(action))return;
 const what=action.dataset.hf;unlockAudio();
 if(what==='close'){close();return;}
 if(what==='hide'){state.panel='play';render();return;}
 if(what==='lobby'){state.panel='lobby';render();return;}
 if(what==='choose'){if(!state.data?.members?.length)return;state.panel='choose';render();return;}
 if(what==='ranking'){state.panel='ranking';render();return;}
 if(what==='retry'){state.panel='lobby';render();refresh();return;}
 if(what==='bot'){state.panel='play';render();await run('new',{opponent:'__HELLX__'},'play');return;}
 if(what==='challenge'){
  if(!online(action.dataset.opponent)){toast('Ce joueur est hors ligne.');return;}
  state.panel='play';render();
  await run('new',{opponent:action.dataset.opponent},'play');
  if(!state.error)toast('Défi envoyé !');
  return;
 }
 if(what==='view'){
  state.selected=Number(action.dataset.id);
  const g=selectedGame();
  state.panel=g?.status==='pending'&&g.me_side===2?'invite':g?.status==='done'?'result':'play';
  render();return;
 }
 const g=selectedGame();
 if(what==='accept'&&g){await run('accept',{gameId:g.id},'play');return;}
 if(what==='decline'&&g){await run('decline',{gameId:g.id},'lobby');return;}
 if(what==='col'){
  if(!g){state.panel='lobby';render();return;}
  if(g.status!=='active'){toast('Cette partie n’est pas encore active.');return;}
  if(g.turn!==g.me_side){toast('Au tour de '+g.opponent);return;}
  if(state.waiting)return;
  state.waiting=true;
  try{
   const col=Number(action.dataset.col);
   const data=await request('move',{gameId:g.id,col});
   const next=data.games.find(x=>x.id===g.id);
   if(g.bot&&next){
    const interim=[...g.board];
    for(let row=5;row>=0;row--){const i=row*7+col;if(!interim[i]){interim[i]=g.me_side;break;}}
    state.data={...data,games:data.games.map(x=>x.id===g.id?{...g,board:interim,turn:3-g.me_side}:x)};
    render();bip();
    if(next.board.some((v,i)=>v!==interim[i])){await new Promise(resolve=>setTimeout(resolve,thinkDelay(interim)));if(state.open)bip();}
   }else bip();
   state.data=data;
   state.error='';
   const updated=selectedGame();
   state.panel='play';
   render();
  }catch(err){toast(err.message||'Coup impossible.');}
  finally{state.waiting=false;if(state.open)render();}
  return;
 }
 if(what==='replay'){
  if(!g){state.panel='choose';render();return;}
  if(g.status==='active'||g.status==='pending'){toast('Termine d’abord cette partie.');return;}
  if(!available(g)){toast('Ce joueur est hors ligne.');return;}
  const opponent=g.bot?'__HELLX__':g.opponent;
  state.panel='play';render();
  await run('new',{opponent},'play');
  return;
 }
}
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-hell-four-open]');
 if(btn){e.preventDefault();open();}
});
window.HellFour={open,close};
if(new URLSearchParams(location.search).get('game')==='hell-four'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(open,1000),{once:true});
 else setTimeout(open,1000);
}
})();