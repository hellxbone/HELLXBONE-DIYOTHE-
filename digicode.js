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
  const WHEEL_KEY='hellxbone-wheel-v1';
  let wheelBusy=false,wheelMessage='',wheelRotation=0;
  function readWheel(){const value=JSON.parse(localStorage.getItem(WHEEL_KEY)||'null');return value&&value.day===day()?value:null;}
  function drawWheel(){
    const root=document.getElementById('chaos-wheel');if(!root)return;
    let saved=null;
    try{saved=readWheel();}catch(e){root.innerHTML='<p role="alert">Active le stockage de ton navigateur pour jouer à la Roue du Chaos.</p>';return;}
    const labels=['💀','🔥','☠️','🤘','🎁','💀','🔥','☠️'];
    root.innerHTML='<section class="wheel-zone" aria-label="Roue du Chaos"><h2 class="section-title">☠️ La Roue du Chaos</h2><p>Une seule tentative par jour. Lance la roue et tente ta chance.</p><div class="wheel-wrap"><div class="wheel-pointer" aria-hidden="true">▼</div><div class="chaos-wheel" style="transform:rotate('+wheelRotation+'deg)" aria-label="Roue de hasard">'+labels.map((x,i)=>'<span class="wheel-label w'+i+'">'+x+'</span>').join('')+'<div class="wheel-hub">HELL<br>XBONE</div></div></div><button class="button" data-wheel-action="spin" '+(wheelBusy||saved?'disabled':'')+'>'+(wheelBusy?'La roue tourne…':'🔥 Lancer la roue')+'</button><p class="wheel-result" role="status">'+(saved?(saved.won?'🎁 CHAOS ! Tu as gagné un tee-shirt HELLXBONE au choix. Contacte-moi sur Facebook.':'💀 Perdu pour aujourd’hui. Retente demain.'):(wheelMessage||''))+'</p><p class="code-small">Nouvelle chance à minuit, heure de Paris. La tentative est enregistrée sur cet appareil et ce navigateur.</p></section>';
  }
  function spinWheel(){
    if(wheelBusy)return;
    try{if(readWheel()){drawWheel();return;}}catch(e){drawWheel();return;}
    wheelBusy=true;wheelMessage='';drawWheel();
    const won=Math.floor(Math.random()*100)===0;
    const targetIndex=won?4:([0,1,2,3,5,6,7][Math.floor(Math.random()*7)]);
    const segment=45;
    const center=targetIndex*segment+segment/2;
    const turns=5+Math.floor(Math.random()*3);
    wheelRotation += turns*360 + (360-center) + (Math.random()*12-6);
    const el=document.querySelector('.chaos-wheel');
    if(el) requestAnimationFrame(()=>{el.style.transition='transform 3.8s cubic-bezier(.12,.68,.18,1)';el.style.transform='rotate('+wheelRotation+'deg)';});
    setTimeout(()=>{
      try{if(!readWheel())localStorage.setItem(WHEEL_KEY,JSON.stringify({day:day(),won}));}catch(e){}
      wheelBusy=false;wheelMessage=won?'🎁 CHAOS ! Tu as gagné un tee-shirt HELLXBONE au choix.':'💀 Perdu. Retente demain.';drawWheel();
    },3900);
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-wheel-action="spin"]');if(b&&!b.disabled)spinWheel();});
  window.addEventListener('storage',e=>{if(e.key===WHEEL_KEY)drawWheel();});

  window.HellCode={render(){code='';lit='';notice='';app.innerHTML='<section id="digicode" aria-label="Jeu du digicode"></section><section id="chaos-wheel" aria-label="Roue du Chaos"></section>';draw();drawWheel();}};
})();