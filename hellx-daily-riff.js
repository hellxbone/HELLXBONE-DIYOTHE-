/* HELLXBONE — défi quotidien avec score recalculé et enregistré côté serveur. */
(()=>{'use strict';if(window.HellxDaily)return;
const API='https://ldibykpitjutratyqqax.supabase.co/functions/v1/hellx-daily-riff';
const symbols=['💀','🎸','🔥','🤘','⚡','☠️'];
const RIFF_DAILY_ICON_FILES=['crane.png','guitare.png','flamme.png','cornes-metal.png','eclair.png','os-croises.png'];let engine=null,day='',trace=[],chosen=null,member='',pending=false,complete=false;
const css=document.createElement('style');css.textContent=`
#hx-daily-overlay{position:fixed;inset:0;z-index:2147483000;background:#030504f5;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:10px;color:#e8ffed;font:14px system-ui}
#hx-daily-overlay[hidden]{display:none!important}
#hx-daily-box{width:min(100%,460px);max-height:96dvh;overflow:auto;background:#070e09;border:2px solid #68f681;border-radius:15px;padding:15px;box-sizing:border-box;text-align:center}
#hx-daily-box h2{color:#92ff99;margin:6px 0;font-size:24px}
#hx-daily-box p{margin:7px 0 12px}
#hx-daily-board{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;max-width:410px;margin:10px auto}
#hx-daily-board button{font-size:clamp(16px,5vw,27px);aspect-ratio:1;border:1px solid #3f7450;background:#0d2212;color:#fff;border-radius:5px;padding:0;min-width:0;cursor:pointer}
#hx-daily-board button[aria-pressed=true]{outline:3px solid #ddff65;background:#315638}
#hx-daily-box .hx-daily-btn{min-height:42px;background:#53e775;color:#061b0b;border:0;border-radius:8px;padding:8px 13px;margin:6px;font-weight:900}
#hx-daily-score{font-size:19px;color:#9aff9b;font-weight:900}
#hx-daily-top{font-size:13px;text-align:left;margin:8px auto;max-width:310px}
`;document.head.append(css);
let root=null;
function el(name,text){const n=document.createElement(name);if(text!==undefined)n.textContent=text;return n}
function label(str){const n=root?.querySelector('#hx-daily-status');if(n)n.textContent=str}
function openShell(){
 if(root)return;root=el('section');root.id='hx-daily-overlay';root.hidden=true;
 root.innerHTML='<div id="hx-daily-box" role="dialog" aria-modal="true" aria-label="Défi MEGA RIFF du jour"><button id="hx-daily-close" type="button" class="hx-daily-btn" style="float:right">FERMER</button><h2>RIFF DU JOUR</h2><p>25 coups · Une tentative par membre · Même grille de départ</p><div id="hx-daily-score">SCORE : 0 · COUPS : 25</div><p id="hx-daily-status" role="status">Connexion…</p><div id="hx-daily-board" role="grid" aria-label="Grille quotidienne"></div><button class="hx-daily-btn" id="hx-daily-finish">VALIDER MON SCORE</button><h3>TOP 10 DU JOUR</h3><ol id="hx-daily-top"></ol></div>';document.body.append(root);
 root.querySelector('#hx-daily-close').onclick=close;
 root.querySelector('#hx-daily-finish').onclick=finish;
 root.querySelector('#hx-daily-board').addEventListener('click',async e=>{
  const cell=e.target.closest('button[data-i]');if(!cell||complete||pending||!engine)return;
  const idx=Number(cell.dataset.i);if(chosen===null){chosen=idx;draw();return}
  if(idx===chosen){chosen=null;draw();return}
  const adjacent=Math.abs(Math.floor(idx/7)-Math.floor(chosen/7))+Math.abs(idx%7-chosen%7)===1;
  if(!adjacent){chosen=idx;draw();return}
  trace.push([chosen,idx]);chosen=null;
  try{sessionStorage.setItem('hx-daily-trace-'+day,JSON.stringify(trace))}catch{}
  draw();if(trace.length===25)await finish();
 });
}
async function call(action,body={}){const r=await fetch(API+'?action='+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});let data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error||'Erreur HTTP '+r.status);return data}
function top(rows){const list=root.querySelector('#hx-daily-top');list.replaceChildren();(rows||[]).forEach(x=>{const li=el('li',x.name+' · '+Number(x.score).toLocaleString('fr-FR')+' points');list.append(li)});if(!list.children.length)list.append(el('li','Personne encore classé aujourd’hui'))}
function draw(){
 if(!root||!engine)return;const state=engine.play(day,trace);
 const score=root.querySelector('#hx-daily-score');score.textContent='SCORE : '+state.score.toLocaleString('fr-FR')+' · COUPS : '+state.movesRemaining;
 const board=root.querySelector('#hx-daily-board');board.replaceChildren();
 state.board.forEach((v,i)=>{const b=el('button');b.type='button';b.style.position='relative';b.style.overflow='hidden';b.innerHTML='<span style="position:absolute;inset:0;display:grid;place-items:center">'+symbols[v]+'</span><img alt="" draggable="false" style="position:relative;z-index:1;width:100%;height:100%;object-fit:contain;display:none;pointer-events:none">';const img=b.querySelector('img');const fallback=b.querySelector('span');img.addEventListener('load',()=>{img.style.display='block';fallback.style.display='none'},{once:true});img.addEventListener('error',()=>img.remove(),{once:true});img.src=new URL(RIFF_DAILY_ICON_FILES[v],document.baseURI).href;b.dataset.i=i;b.setAttribute('role','gridcell');b.setAttribute('aria-label','Case '+(i+1)+', '+symbols[v]);b.setAttribute('aria-pressed',String(chosen===i));b.disabled=complete;board.append(b)});
 root.querySelector('#hx-daily-finish').hidden=complete;
}
async function finish(){
 if(pending||complete||!root)return;pending=true;label('Validation du score par le serveur…');
 try{const result=await call('finish',{member_id:member,moves:trace});complete=true;top(result.top);label('Score officiel validé : '+Number(result.score).toLocaleString('fr-FR')+' points. Reviens demain !');try{sessionStorage.removeItem('hx-daily-trace-'+day)}catch{};draw();}
 catch(e){label('Validation impossible : '+e.message+'. Réessaie.')}
 finally{pending=false}
}
async function open(){
 openShell();root.hidden=false;document.body.style.overflow='hidden';complete=false;pending=true;label('Chargement du défi…');
 member=localStorage.getItem('hellx-club-device-v1')||'';
 if(!member){label('Inscris d’abord ton pseudo sur HELLXBONE.');pending=false;return}
 try{
  if(!engine)engine=await import('./hellx-daily-engine.js?v=20261103-verified');
  const result=await call('begin',{member_id:member});day=result.day;complete=result.complete;
  trace=[];if(!complete){try{const saved=JSON.parse(sessionStorage.getItem('hx-daily-trace-'+day)||'[]');if(Array.isArray(saved)&&saved.length<=25)trace=saved}catch{}}
  chosen=null;top(result.top);draw();
  if(complete){root.querySelector('#hx-daily-score').textContent='SCORE OFFICIEL : '+Number(result.score||0).toLocaleString('fr-FR');label('Tu as déjà joué aujourd’hui. Retour demain !')}
  else label('Sélectionne deux cases voisines pour tenter un alignement.');
 }catch(e){label('Défi indisponible : '+e.message)}finally{pending=false}
}
function close(){if(!root)return;root.hidden=true;document.body.style.overflow=''}
window.HellxDaily={open,close};
})();