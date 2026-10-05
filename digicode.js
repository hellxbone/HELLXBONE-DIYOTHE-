(() => {
  const KEY='hellxbone-digicode-v1';
  const digest='8c40a6d264e529987be355b303cb08181b8595753e3ef3c8f4bdc29859ac5605';
  let code='',busy=false,lit='',notice='';
  const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function read(){const value=JSON.parse(localStorage.getItem(KEY)||'null');return value&&value.day===day()?value:null;}
  function draw(){
    const root=document.getElementById('digicode');if(!root)return;
    let saved;try{saved=read();localStorage.setItem(KEY,localStorage.getItem(KEY)||'null');}catch(e){root.innerHTML='<p role="alert">Active le stockage de ton navigateur pour jouer et conserver ta tentative du jour.</p>';return;}
    if(saved){root.innerHTML=saved.won?'<div class="code-result victory" role="status">CHAOS</div><p class="code-caption">Code trouvé ! Contacte-moi sur <a href="https://facebook.com/DIYOTHE" target="_blank" rel="noopener noreferrer">Facebook DIYOTHE</a> pour ton tee-shirt.</p>':'<div class="code-result defeat" role="status">Perdu, retente demain.</div>';return;}
    root.innerHTML='<div class="code-poster"><img class="code-art" src="digicode-art.jpg" alt="Digicode HELLXBONE : chaînes, métal gravé, touches de 0 à 9 et bouton Valider"><div class="code-slots" aria-label="Code saisi : '+code.length+' chiffres sur 4">'+Array.from({length:4},(_,i)=>'<span>'+ (code[i]||'') +'</span>').join('')+'</div><div class="code-keys">'+[1,2,3,4,5,6,7,8,9,0].map(n=>'<button class="metal-key key-'+n+' '+(lit===String(n)?'lit':'')+'" data-digit="'+n+'" '+(busy||code.length===4?'disabled':'')+' aria-label="Chiffre '+n+'">'+n+'</button>').join('')+'</div><button class="code-validate" data-code-action="validate" '+(busy||code.length!==4?'disabled':'')+' aria-label="Valider mon code"><span>'+(busy?'Vérification…':'VALIDER')+'</span></button></div><div class="code-actions"><button class="code-clear" data-code-action="clear" '+(busy||!code?'disabled':'')+'>Effacer le code</button></div><p class="code-notice" role="status">'+notice+'</p><p class="code-small">Nouvelle tentative à minuit, heure de Paris. La tentative est conservée sur cet appareil et ce navigateur. Le gain est confirmé avec moi sur Facebook.</p>';
  }
  async function validate(){
    if(busy||code.length!==4)return;
    try{if(read()){draw();return;}}catch(e){draw();return;}
    busy=true;draw();
    try{
      const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code));
      const won=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')===digest;
      if(!read())localStorage.setItem(KEY,JSON.stringify({day:day(),won}));
      code='';lit='';notice='';
    }catch(e){notice='Vérification indisponible. Réessaie dans un instant.';}
    busy=false;draw();
  }
  document.addEventListener('click',e=>{
    const key=e.target.closest('[data-digit],[data-code-action]');if(!key||!key.closest('#digicode')||key.disabled||busy)return;
    if(key.dataset.digit!==undefined){try{if(read()){draw();return;}}catch(e){draw();return;}if(code.length<4){lit=key.dataset.digit;code+=lit;draw();}}
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
  const WHEEL_KEY='hellxbone-wheel-v2';
  let wheelBusy=false,wheelMessage='',wheelRotation=0;
  function readWheel(){const value=JSON.parse(localStorage.getItem(WHEEL_KEY)||'null');return value&&value.day===day()?value:null;}
  function wheelSvg(){
    const cx=160,cy=160,r=136,ri=58;
    const labels=['GAGNÉ','PERDU','GAGNÉ','PERDU','GAGNÉ','PERDU','GAGNÉ','PERDU'];
    const fills=['#111','#d9c998','#242424','#eee2b6','#111','#d9c998','#242424','#eee2b6'];
    let slices='';
    for(let i=0;i<8;i++){
      const a1=(-90+i*45)*Math.PI/180,a2=(-90+(i+1)*45)*Math.PI/180;
      const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);
      const xi1=cx+ri*Math.cos(a1),yi1=cy+ri*Math.sin(a1),xi2=cx+ri*Math.cos(a2),yi2=cy+ri*Math.sin(a2);
      const d='M '+x1+' '+y1+' A '+r+' '+r+' 0 0 1 '+x2+' '+y2+' L '+xi2+' '+yi2+' A '+ri+' '+ri+' 0 0 0 '+xi1+' '+yi1+' Z';
      const mid=(-67.5+i*45)*Math.PI/180;
      const tx=cx+99*Math.cos(mid),ty=cy+99*Math.sin(mid);
      const dark=i===0||i===2||i===4||i===6;
      slices+='<path d="'+d+'" fill="'+fills[i]+'" stroke="#6f6653" stroke-width="2"/><text x="'+tx+'" y="'+ty+'" text-anchor="middle" dominant-baseline="middle" transform="rotate('+(i*45)+' '+tx+' '+ty+')" class="wheel-seg-text '+(dark?'light':'dark')+'">'+labels[i]+'</text>';
    }
    return '<svg class="wheel-svg" viewBox="0 0 320 320" role="img" aria-label="Roue du Chaos à huit cases">'+
      '<circle cx="160" cy="160" r="151" fill="#090909" stroke="#5c5548" stroke-width="6"/>'+
      '<circle cx="160" cy="160" r="143" fill="#191919" stroke="#b6a982" stroke-width="3"/>'+
      slices+
      '<circle cx="160" cy="160" r="55" fill="#070707" stroke="#8c8065" stroke-width="4"/>'+
      '<text x="160" y="153" text-anchor="middle" class="wheel-logo">HELL</text>'+
      '<text x="160" y="177" text-anchor="middle" class="wheel-logo">XBONE</text>'+
      '</svg>';
  }
  function drawWheel(){
    const root=document.getElementById('chaos-wheel');if(!root)return;
    let saved=null;
    try{saved=readWheel();}catch(e){root.innerHTML='<p role="alert">Active le stockage de ton navigateur pour jouer à la Roue du Chaos.</p>';return;}
    const result=saved?(saved.won?'GAGNÉ — Tu remportes un tee-shirt HELLXBONE au choix. Contacte-moi sur Facebook.':'PERDU — Retente demain.'):(wheelMessage||'');
    root.innerHTML='<section class="wheel-zone" aria-label="Roue du Chaos"><div class="wheel-head"><span class="wheel-kicker">JEU HELLXBONE</span><h2>La Roue du Chaos</h2><p>Une seule tentative par jour. 1 chance sur 100 de décrocher le lot.</p></div><div class="wheel-stage"><div class="wheel-pointer" aria-hidden="true"></div><div class="chaos-wheel" style="transform:rotate('+wheelRotation+'deg)">'+wheelSvg()+'</div></div><button class="button wheel-button" data-wheel-action="spin" '+(wheelBusy||saved?'disabled':'')+'>'+(wheelBusy?'LA ROUE TOURNE…':'LANCER LA ROUE')+'</button><div class="wheel-result '+(saved&&saved.won?'win':'')+'" role="status">'+result+'</div><p class="code-small">Nouvelle chance à minuit, heure de Paris. La tentative reste enregistrée sur cet appareil et ce navigateur.</p></section>';
  }
  function spinWheel(){
    if(wheelBusy)return;
    try{if(readWheel()){drawWheel();return;}}catch(e){drawWheel();return;}
    wheelBusy=true;wheelMessage='';drawWheel();
    const won=Math.floor(Math.random()*100)===0;
    const targetIndex=won?([0,2,4,6][Math.floor(Math.random()*4)]):([1,3,5,7][Math.floor(Math.random()*4)]);
    const center=targetIndex*45+22.5;
    const turns=6+Math.floor(Math.random()*2);
    wheelRotation += turns*360 + (360-center);
    const el=document.querySelector('.chaos-wheel');
    if(el)requestAnimationFrame(()=>{el.style.transition='transform 4.2s cubic-bezier(.12,.7,.08,1)';el.style.transform='rotate('+wheelRotation+'deg)';});
    setTimeout(()=>{
      try{if(!readWheel())localStorage.setItem(WHEEL_KEY,JSON.stringify({day:day(),won}));}catch(e){}
      wheelBusy=false;wheelMessage=won?'GAGNÉ — Tu remportes un tee-shirt HELLXBONE au choix.':'PERDU — Retente demain.';drawWheel();
    },4250);
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-wheel-action="spin"]');if(b&&!b.disabled)spinWheel();});

  // Réinitialisation de la Roue du Chaos : maintenir la roue 5 secondes.
  // Gestion pensée pour Android/PWA : on capture le pointeur et on bloque le menu d'appui long.
  let wheelResetHold=null,wheelSuppressClickUntil=0,wheelHoldPointerId=null;
  function cancelWheelResetHold(){
    clearTimeout(wheelResetHold);
    wheelResetHold=null;
    wheelHoldPointerId=null;
  }
  function resetWheelGame(){
    if(wheelBusy)return;
    try{
      localStorage.removeItem(WHEEL_KEY);
      wheelRotation=0;
      wheelMessage='Jeu réinitialisé.';
      drawWheel();
    }catch(e){
      window.alert('La réinitialisation est indisponible dans ce navigateur.');
    }
  }
  document.addEventListener('pointerdown',e=>{
    const zone=e.target.closest('#chaos-wheel .wheel-stage');
    if(!zone||e.target.closest('a')||(e.pointerType==='mouse'&&e.button!==0))return;
    cancelWheelResetHold();
    wheelHoldPointerId=e.pointerId;
    try{zone.setPointerCapture(e.pointerId);}catch(_){}
    wheelResetHold=setTimeout(()=>{
      wheelResetHold=null;
      wheelSuppressClickUntil=Date.now()+1200;
      resetWheelGame();
      if(navigator.vibrate)navigator.vibrate(120);
    },5000);
  },true);
  document.addEventListener('pointerup',e=>{if(wheelHoldPointerId===e.pointerId)cancelWheelResetHold();},true);
  document.addEventListener('pointercancel',e=>{if(wheelHoldPointerId===e.pointerId)cancelWheelResetHold();},true);
  document.addEventListener('contextmenu',e=>{
    if(e.target.closest('#chaos-wheel .wheel-stage')){
      e.preventDefault();
    }
  },true);
  document.addEventListener('click',e=>{
    if(Date.now()<wheelSuppressClickUntil&&e.target.closest('#chaos-wheel')){
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },true);
  window.addEventListener('storage',e=>{if(e.key===WHEEL_KEY)drawWheel();});

  window.HellCode={render(){code='';lit='';notice='';app.innerHTML='<section id="digicode" aria-label="Jeu du digicode"></section><section id="chaos-wheel" aria-label="Roue du Chaos"></section>';draw();drawWheel();}};
})();