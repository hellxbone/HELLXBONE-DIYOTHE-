/* HELLXBONE RIFF DU JOUR — deterministic shared match-3 rules (browser/server). */
export const COLS=7,ROWS=7,LIMIT=25;
const types=6;
const seedOf=day=>{let v=2166136261;for(const c of day)v=Math.imul(v^c.charCodeAt(0),16777619)>>>0;return v};
function rng(day){let seed=seedOf(day);return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function matches(b){const found=new Set();
 for(let y=0;y<ROWS;y++){let start=0;for(let x=1;x<=COLS;x++){if(x<COLS&&b[y*COLS+x]===b[y*COLS+start])continue;if(x-start>=3&&b[y*COLS+start]!==null)for(let z=start;z<x;z++)found.add(y*COLS+z);start=x;}}
 for(let x=0;x<COLS;x++){let start=0;for(let y=1;y<=ROWS;y++){if(y<ROWS&&b[y*COLS+x]===b[start*COLS+x])continue;if(y-start>=3&&b[start*COLS+x]!==null)for(let z=start;z<y;z++)found.add(z*COLS+x);start=y;}}
 for(let y=0;y<ROWS-1;y++)for(let x=0;x<COLS-1;x++){const i=y*COLS+x,v=b[i];if(v!==null&&v===b[i+1]&&v===b[i+COLS]&&v===b[i+COLS+1]){found.add(i);found.add(i+1);found.add(i+COLS);found.add(i+COLS+1)}}
 return [...found];
}
const swap=(b,a,c)=>{[b[a],b[c]]=[b[c],b[a]]};
const adjacent=(a,b)=>Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&a<49&&b>=0&&b<49&&Math.abs(Math.floor(a/7)-Math.floor(b/7))+Math.abs(a%7-b%7)===1;
function fill(r){const b=Array(49);for(let y=0;y<7;y++)for(let x=0;x<7;x++){let v;let tries=0;do{v=Math.floor(r()*types);tries++}while(tries<80&&((x>=2&&b[y*7+x-1]===v&&b[y*7+x-2]===v)||(y>=2&&b[(y-1)*7+x]===v&&b[(y-2)*7+x]===v)));b[y*7+x]=v}return b}
function playable(b){for(let a=0;a<49;a++)for(const d of [1,7]){const c=a+d;if(c>=49||!adjacent(a,c))continue;swap(b,a,c);const yes=matches(b).length>0;swap(b,a,c);if(yes)return true}return false}
function refill(b,r){for(let x=0;x<7;x++){let w=6;for(let y=6;y>=0;y--){const v=b[y*7+x];if(v!==null){b[w*7+x]=v;w--}}while(w>=0){b[w*7+x]=Math.floor(r()*types);w--}}}
export function play(day,moves=[]){
 if(!/^20\d{2}-\d{2}-\d{2}$/.test(day)||!Array.isArray(moves)||moves.length>LIMIT)throw Error('Invalid daily challenge');
 const random=rng(day);let b=fill(random),attempts=0;while(!playable(b)&&attempts++<50)b=fill(random);
 let score=0;
 for(const move of moves){
  if(!Array.isArray(move)||move.length!==2||!adjacent(move[0],move[1]))throw Error('Invalid move');
  const [a,c]=move;swap(b,a,c);
  if(!matches(b).length){swap(b,a,c);continue}
  for(let chain=1;chain<=20;chain++){
   const m=matches(b);if(!m.length)break;
   score+=m.length*10*chain;
   for(const pos of m)b[pos]=null;
   refill(b,random);
  }
  if(!playable(b))b=fill(random);
 }
 return {board:b,score,movesRemaining:LIMIT-moves.length};
}
