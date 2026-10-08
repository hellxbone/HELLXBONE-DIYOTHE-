(() => {
  const KEY='hellxbone-digicode-v1';
  const digest='8c40a6d264e529987be355b303cb08181b8595753e3ef3c8f4bdc29859ac5605';
  let code='',busy=false,lit='',notice='';

  // Sons du digicode : bips plus forts et vibration de secours sur Android.
  let audioCtx=null;
  function getAudioCtx(){
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx)return null;
      if(!audioCtx)audioCtx=new Ctx();
      return audioCtx;
    }catch(e){return null;}
  }
  function vibrate(pattern){try{if(navigator.vibrate)navigator.vibrate(pattern);}catch(e){}}
  async function tone(freq,duration=0.11,volume=0.16,type='square',delay=0){
    const ctx=getAudioCtx();if(!ctx)return;
    try{if(ctx.state==='suspended')await ctx.resume();}catch(e){}
    if(ctx.state!=='running')return;
    const start=ctx.currentTime+delay;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(freq,start);
    gain.gain.setValueAtTime(0.0001,start);
    gain.gain.linearRampToValueAtTime(volume,start+0.008);
    gain.gain.setValueAtTime(volume,start+Math.max(0.012,duration-0.025));
    gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);
    osc.connect(gain);gain.connect(ctx.destination);
    osc.start(start);osc.stop(start+duration+0.02);
  }
  function soundDigit(n){tone(850+(Number(n)||0)*24,0.10,0.18,'square');vibrate(28);}
  function soundValidate(){tone(620,0.12,0.18,'square');tone(940,0.14,0.18,'square',0.14);vibrate([45,45,45]);}
  function soundError(){tone(220,0.18,0.20,'sawtooth');tone(150,0.22,0.20,'sawtooth',0.20);vibrate([100,70,160]);}
  function soundWin(){tone(620,0.12,0.18,'square');tone(820,0.12,0.18,'square',0.13);tone(1100,0.25,0.20,'square',0.26);vibrate([60,40,60,40,180]);}

  const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const cookieGet=name=>document.cookie.split('; ').find(v=>v.startsWith(name+'='))?.split('=').slice(1).join('=')||'';
  const cookieSet=(name,value,days=30)=>{
    document.cookie=name+'='+encodeURIComponent(value)+'; Max-Age='+(days*86400)+'; Path=/; SameSite=Lax; Secure';
  };
  function sendGameEvent(kind,zone){
    const path='mini-jeu-'+kind+'-zone-'+(zone||'non-partagee');
    const fire=()=>{
      if(window.goatcounter&&typeof window.goatcounter.count==='function'){
        window.goatcounter.count({path,title:'HELLXBONE mini-jeu',event:true,no_session:true});
        return true;
      }
      return false;
    };
    if(!fire()) setTimeout(fire,1200);
  }
  function trackMiniGame(kind){
    const saved=decodeURIComponent(cookieGet('hellxbone_zone')||'');
    const pref=decodeURIComponent(cookieGet('hellxbone_loc_pref')||'');
    if(saved){sendGameEvent(kind,saved);return;}
    if(pref==='refused'){sendGameEvent(kind,'non-partagee');return;}
    if(pref==='accepted'){
      if(!navigator.geolocation){sendGameEvent(kind,'indisponible');return;}
      navigator.geolocation.getCurrentPosition(pos=>{
        const lat=(Math.round(pos.coords.latitude*10)/10).toFixed(1);
        const lon=(Math.round(pos.coords.longitude*10)/10).toFixed(1);
        const zone=lat+'_'+lon;
        cookieSet('hellxbone_zone',zone,30);
        sendGameEvent(kind,zone);
      },()=>sendGameEvent(kind,'non-partagee'),{enableHighAccuracy:false,timeout:7000,maximumAge:86400000});
      return;
    }
    const ok=window.confirm('HELLXBONE souhaite connaître uniquement ta zone approximative en France quand tu joues (environ 10 km), jamais ton adresse exacte. Autoriser ?');
    cookieSet('hellxbone_loc_pref',ok?'accepted':'refused',30);
    if(!ok){sendGameEvent(kind,'non-partagee');return;}
    if(!navigator.geolocation){sendGameEvent(kind,'indisponible');return;}
    navigator.geolocation.getCurrentPosition(pos=>{
      const lat=(Math.round(pos.coords.latitude*10)/10).toFixed(1);
      const lon=(Math.round(pos.coords.longitude*10)/10).toFixed(1);
      const zone=lat+'_'+lon;
      cookieSet('hellxbone_zone',zone,30);
      sendGameEvent(kind,zone);
    },()=>sendGameEvent(kind,'non-partagee'),{enableHighAccuracy:false,timeout:7000,maximumAge:86400000});
  }
  function read(){const value=JSON.parse(localStorage.getItem(KEY)||'null');return value&&value.day===day()?value:null;}
  function draw(){
    const root=document.getElementById('digicode');if(!root)return;
    let saved;try{saved=read();localStorage.setItem(KEY,localStorage.getItem(KEY)||'null');}catch(e){root.innerHTML='<p role="alert">Active le stockage de ton navigateur pour jouer et conserver ta tentative du jour.</p>';return;}
    if(saved){
      if(saved.won){
        root.innerHTML='<div class="code-result victory" role="status">CHAOS</div><p class="code-caption">Code trouvé ! Contacte-moi sur <a href="https://facebook.com/DIYOTHE" target="_blank" rel="noopener noreferrer">Facebook DIYOTHE</a> pour ton tee-shirt.</p>';
      }else{
        root.innerHTML='<div class="code-poster code-poster-locked"><img class="code-art" src="digicode-art.jpg" alt="Digicode HELLXBONE : chaînes, métal gravé, touches de 0 à 9 et bouton Valider"><div class="code-slots" aria-label="Tentative terminée">'+Array.from({length:4},()=>'<span></span>').join('')+'</div><div class="code-keys">'+[1,2,3,4,5,6,7,8,9,0].map(n=>'<button class="metal-key key-'+n+'" disabled aria-label="Chiffre '+n+'">'+n+'</button>').join('')+'</div><button class="code-validate" disabled aria-label="Tentative utilisée"><span>VALIDER</span></button></div><div class="code-feedback error" role="status"><strong>❌ Mauvais code.</strong><br>Perdu, retente demain.</div><p class="code-small">Nouvelle tentative à minuit, heure de Paris. La tentative est conservée sur cet appareil et ce navigateur.</p>';
      }
      return;
    }
    root.innerHTML='<div class="code-poster"><img class="code-art" src="digicode-art.jpg" alt="Digicode HELLXBONE : chaînes, métal gravé, touches de 0 à 9 et bouton Valider"><div class="code-slots" aria-label="Code saisi : '+code.length+' chiffres sur 4">'+Array.from({length:4},(_,i)=>'<span>'+ (code[i]||'') +'</span>').join('')+'</div><div class="code-keys">'+[1,2,3,4,5,6,7,8,9,0].map(n=>'<button class="metal-key key-'+n+' '+(lit===String(n)?'lit':'')+'" data-digit="'+n+'" '+(busy||code.length===4?'disabled':'')+' aria-label="Chiffre '+n+'">'+n+'</button>').join('')+'</div><button class="code-validate" data-code-action="validate" '+(busy||code.length!==4?'disabled':'')+' aria-label="Valider mon code"><span>'+(busy?'Vérification…':'VALIDER')+'</span></button></div><div class="code-actions"><button class="code-clear" data-code-action="clear" '+(busy||!code?'disabled':'')+'>Effacer le code</button></div><p class="code-notice" role="status">'+notice+'</p><p class="code-small">Nouvelle tentative à minuit, heure de Paris. La tentative est conservée sur cet appareil et ce navigateur. Le gain est confirmé avec moi sur Facebook.</p>';
  }
  async function validate(){
    if(busy||code.length!==4)return;
    soundValidate();
    try{if(read()){draw();return;}}catch(e){draw();return;}
    trackMiniGame('digicode');
    busy=true;draw();
    try{
      const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code));
      const won=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')===digest;
      if(!read())localStorage.setItem(KEY,JSON.stringify({day:day(),won}));
      if(won)soundWin();else soundError();
      code='';lit='';notice='';
    }catch(e){notice='Vérification indisponible. Réessaie dans un instant.';}
    busy=false;draw();
  }
  document.addEventListener('pointerdown',e=>{
    if(e.target.closest('#digicode button')) getAudioCtx();
  },true);

  document.addEventListener('click',e=>{
    const key=e.target.closest('[data-digit],[data-code-action]');if(!key||!key.closest('#digicode')||key.disabled||busy)return;
    if(key.dataset.digit!==undefined){try{if(read()){draw();return;}}catch(e){draw();return;}if(code.length<4){lit=key.dataset.digit;soundDigit(lit);code+=lit;draw();}}
    else if(key.dataset.codeAction==='clear'){code='';lit='';notice='';draw();}
    else validate();
  });

  // Accès discret à la réinitialisation par appui long.
  let resetHold=null, suppressClickUntil=0;
  function cancelResetHold(){clearTimeout(resetHold);resetHold=null;}
  function requestReset(){
    if(busy)return;
    const entered=window.prompt('Code de réinitialisation (5 chiffres)');
    if(entered===null)return;
    if(entered!=='00000'){window.alert('Code incorrect.');return;}
    try{localStorage.removeItem(KEY);code='';lit='';notice='Tentative réinitialisée.';draw();}
    catch(e){window.alert('La réinitialisation est indisponible dans ce navigateur.');}
  }
  document.addEventListener('pointerdown',e=>{
    if(e.button!==0||!e.target.closest('#digicode')||e.target.closest('button,a'))return;
    cancelResetHold();
    resetHold=setTimeout(()=>{resetHold=null;suppressClickUntil=Date.now()+1000;requestReset();},2000);
  });
  ['pointerup','pointercancel','pointerleave'].forEach(kind=>document.addEventListener(kind,cancelResetHold));
  document.addEventListener('contextmenu',e=>{if(resetHold&&e.target.closest('#digicode'))e.preventDefault();});
  document.addEventListener('click',e=>{if(Date.now()<suppressClickUntil&&e.target.closest('#digicode')){e.preventDefault();e.stopImmediatePropagation();}},true);

  window.addEventListener('storage',e=>{if(e.key===KEY)draw();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw();});
  window.HellCode={render(){code='';lit='';notice='';app.innerHTML='<section class="section-head section-head-game"><span class="section-kicker">HELLXBONE GAME</span><h2>🎮 MINI-JEU</h2><p>Tente ta chance. Une dose de hasard, un peu de chaos et peut-être la victoire.</p></section><section id="digicode" aria-label="Jeu du digicode"></section>';draw();}};
})();