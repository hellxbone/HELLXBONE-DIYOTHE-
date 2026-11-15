const requested=new URLSearchParams(location.search).get('dessin')||'club';
const drawing=COLOR_ROCK_DRAWINGS.find(d=>d.id===requested)||COLOR_ROCK_DRAWINGS[0],base=drawing.base;
const $=s=>document.querySelector(s),canvas=$('#art'),ctx=canvas.getContext('2d'),colors=drawing.colors,names=drawing.names,key=drawing.key;
let revealFrame=0,animating=false;
let data,original,pixels,map,filled=new Set(),history=[],selected=1,model=false,hint=0,zoom=false,ready=false;
try{filled=new Set(JSON.parse(localStorage.getItem(key)||'[]'))}catch{}
function msg(t){$('#message').textContent=t}
function persist(){try{localStorage.setItem(key,JSON.stringify([...filled]))}catch{msg('La sauvegarde est indisponible dans ce navigateur.')}}
const load=src=>new Promise((resolve,reject)=>{let i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src});
async function init(){try{
data=await (await fetch(base+'zones.json')).json();[original,map]=await Promise.all([load(base+'art.webp'),load(base+'map.png')]);
canvas.width=data.width;canvas.height=data.height;ctx.drawImage(original,0,0);pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
ctx.drawImage(map,0,0);map=ctx.getImageData(0,0,canvas.width,canvas.height).data;
filled=new Set([...filled].filter(i=>data.zones.some(z=>z.id===i)));ready=true;render();if(filled.size<data.zones.length)msg('Choisis une couleur, puis touche le même numéro.');
}catch(e){msg('Le dessin ne peut pas charger. Recharge la page pour réessayer.')}}
function draw(numbers=true){
cancelAnimationFrame(revealFrame);animating=false;
if(!ready)return;
let image=new ImageData(new Uint8ClampedArray(pixels.data),canvas.width,canvas.height),a=image.data;
if(!model)for(let i=0;i<a.length;i+=4){let id=map[i]+map[i+1]*256;if(id&&!filled.has(id)){let lum=Math.max(a[i],a[i+1],a[i+2]);let v=drawing.lightBackground?205+(lum/255)*40:(lum<65?lum:238+(lum/255)*17);a[i]=v;a[i+1]=v;a[i+2]=v}}
ctx.putImageData(image,0,0);
if(!model&&numbers)for(let z of data.zones){if(filled.has(z.id))continue;let radius=z.id===hint?17:10;
ctx.beginPath();ctx.arc(z.x,z.y,radius,0,Math.PI*2);ctx.fillStyle=z.id===hint?'#f0c78b':'#fff';ctx.fill();ctx.strokeStyle=z.id===hint?'#ba3027':'#444';ctx.lineWidth=z.id===hint?4:1;ctx.stroke();
ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#181818';ctx.fillText(z.n,z.x,z.y)}
}
function render(){if(!ready)return;draw();let p=Math.round(filled.size/data.zones.length*100);$('#count').textContent=p+' %';$('#progress').value=p;
$('#palette').innerHTML=colors.map((c,i)=>{let left=data.zones.filter(z=>z.n===i+1&&!filled.has(z.id)).length;return '<button class="swatch '+(selected===i+1?'active':'')+'" data-color="'+(i+1)+'" style="background:'+c+';color:'+((parseInt(c.slice(1,3),16)*.299+parseInt(c.slice(3,5),16)*.587+parseInt(c.slice(5,7),16)*.114)<120?'#fff4dc':'#17191b')+'" aria-label="'+(i+1)+' '+names[i]+', '+left+' zones restantes" aria-pressed="'+(selected===i+1)+'">'+(left?i+1:'✓')+'<em>'+left+'</em></button>'}).join('');
$('#selection').textContent=selected+' · '+names[selected-1];$('#model').textContent=model?'◉ Colorier':'◉ Modèle';if(p===100)msg('🤘 Terminé ! Ton dessin HELLXBONE est prêt à être enregistré.')}
canvas.onclick=e=>{if(!ready||model||animating)return;let rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)*canvas.width/rect.width,y=(e.clientY-rect.top)*canvas.height/rect.height;
let px=Math.max(0,Math.min(canvas.width-1,Math.round(x))),py=Math.max(0,Math.min(canvas.height-1,Math.round(y))),offset=(py*canvas.width+px)*4,id=map[offset]+map[offset+1]*256;
let near=data.zones.filter(z=>!filled.has(z.id)&&Math.hypot(z.x-x,z.y-y)<14).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(near)id=near.id;
let z=data.zones.find(z=>z.id===id);if(!z||filled.has(id))return;if(z.n!==selected)return msg('Choisis la couleur '+z.n+' pour cette zone.');
const before=document.createElement('canvas');before.width=canvas.width;before.height=canvas.height;before.getContext('2d').drawImage(canvas,0,0);
filled.add(id);history.push(id);hint=0;persist();render();revealZone(before,x,y);
if(!data.zones.some(z=>z.n===selected&&!filled.has(z.id))){document.querySelector('[data-color="'+selected+'"]')?.classList.add('color-finished');RockFX.burst(e.clientX,e.clientY,12)}
if(filled.size===data.zones.length)RockFX.celebrate();if(filled.size<data.zones.length)msg('Bien joué ! '+filled.size+' / '+data.zones.length+' zones coloriées.')};
$('#palette').onclick=e=>{let b=e.target.closest('[data-color]');if(b){selected=+b.dataset.color;hint=0;render();msg('Touche les zones portant le numéro '+selected+'.')}};
$('#zoom').onclick=()=>{zoom=!zoom;canvas.style.width=zoom?'250%':'100%';$('#zoom').textContent=zoom?'− Zoom':'＋ Zoom'};
$('#model').onclick=()=>{model=!model;render();msg(model?'Voici ton dessin original en couleurs.':'Choisis une couleur, puis touche le même numéro.')};
$('#hint').onclick=()=>{if(!ready)return;model=false;let z=data.zones.find(z=>z.n===selected&&!filled.has(z.id));if(!z)return msg('Cette couleur est terminée !');hint=z.id;render();let paper=$('#paper');paper.scrollTo({left:z.x/canvas.width*canvas.clientWidth-paper.clientWidth/2,top:z.y/canvas.height*canvas.clientHeight-paper.clientHeight/2,behavior:'smooth'});msg('La pastille dorée indique une zone du numéro '+selected+'.')};
$('#undo').onclick=()=>{let id=history.pop();if(!id)return msg('Aucune action à annuler.');filled.delete(id);persist();render();msg('Dernière couleur annulée.')};
$('#reset').onclick=()=>{if(confirm('Effacer la progression de ce dessin ?')){filled.clear();history=[];hint=0;persist();render();msg('À toi de jouer !')}};
$('#save').onclick=()=>{if(!ready)return;let previous=model;model=false;draw(false);canvas.toBlob(b=>{model=previous;draw();if(!b)return;let a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='HELLXBONE-'+drawing.id+'-coloriage.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);msg('Ton coloriage est prêt dans les téléchargements. Les numéros sont retirés de l’image.')})};
document.querySelector('h2').textContent=drawing.name;

msg('Chargement de ton dessin…');init();

function revealZone(before,x,y){
if(RockFX.reduced.matches)return;
const after=document.createElement('canvas');after.width=canvas.width;after.height=canvas.height;after.getContext('2d').drawImage(canvas,0,0);
const radius=Math.hypot(Math.max(x,canvas.width-x),Math.max(y,canvas.height-y));let start;
animating=true;
function frame(t){if(start===undefined)start=t;let p=Math.min(1,(t-start)/480),ease=1-Math.pow(1-p,3);
ctx.drawImage(before,0,0);ctx.save();ctx.beginPath();ctx.arc(x,y,radius*ease,0,Math.PI*2);ctx.clip();ctx.drawImage(after,0,0);ctx.restore();
if(p<1)revealFrame=requestAnimationFrame(frame);else{animating=false;ctx.drawImage(after,0,0)}}
revealFrame=requestAnimationFrame(frame);
}
