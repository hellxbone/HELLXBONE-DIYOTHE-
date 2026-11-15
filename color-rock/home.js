const drawings=COLOR_ROCK_DRAWINGS.map(d=>({...d,colors:d.colors.length}));
let filter='all',current=0,visible=[],timer,scrollLock=false,unlock;
const $=s=>document.querySelector(s);
function progress(d){try{return Math.min(d.zones,new Set(JSON.parse(localStorage.getItem(d.key)||'[]')).size)}catch{return 0}}
function details(){let d=visible[current];if(!d)return;let done=progress(d),percent=Math.round(done/d.zones*100);$('#details').innerHTML='<h1>'+d.name+'</h1><p>'+d.zones+' zones · '+d.colors+' couleurs</p><small>'+(done?percent===100?'Terminé · Prêt à télécharger':percent+' % colorié · Continue ta création':'À toi de lui donner vie')+'</small>';$('#paint').href=d.url;document.querySelectorAll('.card').forEach((c,i)=>c.classList.toggle('active',i===current));document.querySelectorAll('#dots button').forEach((b,i)=>b.setAttribute('aria-current',i===current))}
function select(i,smooth=true){if(!visible.length)return;scrollLock=true;clearTimeout(unlock);unlock=setTimeout(()=>scrollLock=false,800);current=(i+visible.length)%visible.length;let c=$('#carousel').children[current];$('#carousel').scrollTo({left:c.offsetLeft-$('#carousel').offsetLeft-($('#carousel').clientWidth-c.clientWidth)/2,behavior:smooth?'smooth':'instant'});details()}
function render(){visible=drawings.filter(d=>filter==='all'||(filter==='done'?progress(d)===d.zones:progress(d)>0&&progress(d)<d.zones));current=0;let empty=!visible.length;
['.stage','#dots','#details','#paint','#caption'].forEach(s=>$(s).hidden=empty);$('#empty').hidden=!empty;$('#empty').textContent=filter==='done'?'Tes dessins terminés apparaîtront ici. À toi de jouer !':'Commence un coloriage : tu pourras le retrouver ici.';
$('#carousel').innerHTML=visible.map(d=>'<article class="card" tabindex="0" role="button" aria-label="Colorier '+d.name+'"><img src="'+d.src+'" alt="'+d.name+' — dessin HELLXBONE" draggable="false"></article>').join('');
$('#dots').innerHTML=visible.map((d,i)=>'<button aria-label="Voir '+d.name+'" aria-current="'+(i===0)+'"></button>').join('');
$('#carousel').querySelectorAll('.card').forEach((c,i)=>{c.onclick=()=>{if(current===i)location.href=visible[i].url;else select(i)};c.onkeydown=e=>{if(e.key==='Enter')location.href=visible[i].url}});
$('#dots').querySelectorAll('button').forEach((b,i)=>b.onclick=()=>select(i));requestAnimationFrame(()=>select(0,false));
document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-selected',b.dataset.filter===filter))}
$('.prev').onclick=()=>select(current-1);$('.next').onclick=()=>select(current+1);
$('#carousel').onscroll=()=>{if(scrollLock)return;clearTimeout(timer);timer=setTimeout(()=>{const r=$('#carousel').getBoundingClientRect();let best=0,dist=Infinity;[...$('#carousel').children].forEach((c,i)=>{let a=c.getBoundingClientRect(),d=Math.abs(a.left+a.width/2-r.left-r.width/2);if(d<dist){dist=d;best=i}});current=best;details()},100)};
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render()});window.addEventListener('pageshow',render);render();
