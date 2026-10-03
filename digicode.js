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
    root.innerHTML='<h2 class="code-title">LE DIGICODE</h2><div class="code-slots" aria-label="Code saisi : '+code.length+' chiffres sur 4">'+Array.from({length:4},(_,i)=>'<span>'+ (code[i]||'') +'</span>').join('')+'</div><div class="code-keys">'+[1,2,3,4,5,6,7,8,9,0].map(n=>'<button class="metal-key '+(lit===String(n)?'lit':'')+'" data-digit="'+n+'" '+(busy||code.length===4?'disabled':'')+' aria-label="Chiffre '+n+'">'+n+'</button>').join('')+'</div><div class="code-actions"><button class="code-clear" data-code-action="clear" '+(busy||!code?'disabled':'')+'>Effacer</button><button class="code-validate" data-code-action="validate" '+(busy||code.length!==4?'disabled':'')+'>'+(busy?'Vérification…':'VALIDER')+'</button></div><p class="code-caption">Trouve le code à 4 chiffres et gagne ton tee-shirt.<br>1 nouvelle chance par jour.</p><p class="code-notice" role="status">'+notice+'</p><p class="code-small">Nouvelle tentative à minuit, heure de Paris. La tentative est conservée sur cet appareil et ce navigateur. Le gain est confirmé avec moi sur Facebook.</p>';
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
  window.addEventListener('storage',e=>{if(e.key===KEY)draw();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw();});
  window.HellCode={render(){code='';lit='';notice='';app.innerHTML='<section id="digicode" aria-label="Jeu du digicode"></section>';draw();}};
})();