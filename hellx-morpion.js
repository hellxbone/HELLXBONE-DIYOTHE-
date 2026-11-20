/* HELLXBONE — morpion contre HELLX. Jeu local, sans impact sur MEGA RIFF. */
(function(){
'use strict';
const ROOT='hellx-morpion';
const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let board=Array(9).fill(''),ended=false,thinking=false,round=0;
function outcome(b){for(const l of lines){if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[1]]===b[l[2]])return {winner:b[l[0]],line:l}}return b.every(Boolean)?{winner:'draw',line:[]}:null}
function bestMove(b){
 const free=b.map((v,i)=>v?-1:i).filter(i=>i>=0);
 function solve(state,hellxTurn,depth){
  const end=outcome(state);
  if(end)return end.winner==='O'?10-depth:end.winner==='X'?depth-10:0;
  let best=hellxTurn?-Infinity:Infinity;
  for(const i of [4,0,2,6,8,1,3,5,7]){
   if(state[i])continue;
   state[i]=hellxTurn?'O':'X';
   const score=solve(state,!hellxTurn,depth+1);
   state[i]='';
   best=hellxTurn?Math.max(best,score):Math.min(best,score);
  }
  return best;
 }
 let score=-Infinity,candidates=[];
 for(const i of free){b[i]='O';const s=solve(b,false,1);b[i]='';if(s>score){score=s;candidates=[i]}else if(s===score)candidates.push(i)}
 if(Math.random()<0.75 && free.length>1){const alternatives=free.filter(i=>!candidates.includes(i));if(alternatives.length)return alternatives[Math.floor(Math.random()*alternatives.length)];}
 return candidates[Math.floor(Math.random()*candidates.length)];
}
function status(text){const el=document.getElementById('hellx-morpion-status');if(el)el.textContent=text}
function draw(){
 const root=document.getElementById(ROOT);if(!root)return;
 root.querySelectorAll('[data-hx-morpion-cell]').forEach(el=>{
  const i=Number(el.dataset.hxMorpionCell);
  el.replaceChildren();if(board[i]){const img=document.createElement('img');img.src=board[i]==='X'?'morpion-croix-griffe.png':'morpion-rond-demoniaque.png';img.alt=board[i];img.style.cssText='display:block;width:94%;height:94%;object-fit:contain;margin:auto;pointer-events:none;position:relative;z-index:5;filter:drop-shadow(0 0 4px #f33)';el.append(img)}el.disabled=ended||thinking||!!board[i];
  el.classList.toggle('hx-o',board[i]==='O');el.classList.toggle('hx-x',board[i]==='X');
 });
 const end=outcome(board);root.querySelectorAll('.hx-morpion-cell').forEach(x=>x.classList.remove('hx-win'));
 if(end?.line)end.line.forEach(i=>root.querySelector('[data-hx-morpion-cell="'+i+'"]')?.classList.add('hx-win'));
}
function finish(){
 const end=outcome(board);if(!end)return false;
 ended=true;thinking=false;
 status(end.winner==='X'?'TU AS BATTU HELLX !':end.winner==='O'?'HELLX T’A ÉCRASÉ !':'MATCH NUL — HELLX VEUT SA REVANCHE');
 draw();return true;
}
function play(i){
 if(ended||thinking||board[i])return;
 board[i]='X';if(finish())return;
 thinking=true;status('HELLX RÉFLÉCHIT À SON COUP…');draw();
 const current=round;
 setTimeout(()=>{
  if(round!==current||!document.getElementById(ROOT))return;
  const move=bestMove(board);if(move===undefined)return;
  board[move]='O';thinking=false;
  if(!finish()){status('À TOI DE JOUER !');draw()}
 },1000);
}
function reset(){round++;board=Array(9).fill('');ended=false;thinking=false;status('À TOI DE JOUER !');draw()}
function mount(){
 const root=document.getElementById(ROOT);if(!root||root.dataset.hxReady)return;
 root.dataset.hxReady='1';
 const resetButton=root.querySelector('[data-hx-morpion-reset]');if(resetButton)root.appendChild(resetButton);
 root.querySelectorAll('[data-hx-morpion-cell]').forEach(cell=>cell.addEventListener('click',()=>play(Number(cell.dataset.hxMorpionCell))));
 root.querySelector('[data-hx-morpion-reset]')?.addEventListener('click',reset);
 reset();
}
const observer=new MutationObserver(()=>{if(document.getElementById(ROOT))mount()});
observer.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();