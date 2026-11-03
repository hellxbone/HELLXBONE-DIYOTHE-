import {play,LIMIT} from "./engine.js";
const root=Deno.env.get("SUPABASE_URL")||"",secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const headers={"apikey":secret,"Authorization":"Bearer "+secret,"Content-Type":"application/json"};
const cors={"Access-Control-Allow-Origin":"https://hellxbone.github.io","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"content-type,authorization,apikey"};
const reply=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers:{...cors,"Content-Type":"application/json"}});
const day=()=>new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Paris"});
async function db(table:string,opts:RequestInit={},q=""){
 const r=await fetch(root+"/rest/v1/"+table+q,{...opts,headers:{...headers,...opts.headers}});
 if(!r.ok)throw Error("DB "+table+" "+r.status);
 if(r.status===204)return null;const t=await r.text();return t?JSON.parse(t):null;
}
async function leaderboard(d:string){
 const rows=await db("hellx_daily_riff_scores",{},"?select=member_id,score,finished_at&challenge_day=eq."+d+"&score=not.is.null&order=score.desc,finished_at.asc&limit=10");
 if(!rows?.length)return [];
 const ids=rows.map((e:any)=>e.member_id).filter(Boolean);
 const names=await db("hellx_club_members",{},"?select=member_id,pseudo&member_id=in.("+ids.join(",")+")");
 const map=new Map((names||[]).map((e:any)=>[e.member_id,e.pseudo]));
 return rows.map((e:any,i:number)=>({rank:i+1,name:map.get(e.member_id)||"METALLEUX",score:e.score}));
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{headers:cors});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 if(req.headers.get("origin")!=="https://hellxbone.github.io")return reply({error:"Forbidden origin"},403);
 if(!root||!secret)return reply({error:"Unavailable"},503);
 try{
  const action=new URL(req.url).searchParams.get("action");
  const d=day();
  if(action==="top")return reply({day:d,top:await leaderboard(d)});
  const data=await req.json(),member_id=String(data.member_id||"");
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(member_id))return reply({error:"Member ID invalid"},400);
  const members=await db("hellx_club_members",{},"?select=member_id&member_id=eq."+member_id+"&limit=1");
  if(!members?.length)return reply({error:"Club member not registered"},403);
  if(action==="begin"){
   await db("hellx_daily_riff_scores",{method:"POST",headers:{Prefer:"resolution=ignore-duplicates,return=minimal"},body:JSON.stringify({challenge_day:d,member_id})});
   const rows=await db("hellx_daily_riff_scores",{},"?select=score,finished_at&challenge_day=eq."+d+"&member_id=eq."+member_id+"&limit=1");
   return reply({day:d,complete:!!rows?.[0]?.finished_at,score:rows?.[0]?.score,limit:LIMIT,top:await leaderboard(d)});
  }
  if(action==="finish"){
   const moves=data.moves;
   if(!Array.isArray(moves)||moves.length>LIMIT)return reply({error:"Invalid moves"},400);
   const result=play(d,moves);
   const rows=await db("hellx_daily_riff_scores",{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({moves,score:result.score,finished_at:new Date().toISOString()})},"?challenge_day=eq."+d+"&member_id=eq."+member_id+"&finished_at=is.null&select=score");
   if(!rows?.length)return reply({error:"Attempt already submitted or not started"},409);
   return reply({day:d,score:result.score,top:await leaderboard(d)});
  }
  return reply({error:"Unknown action"},404);
 }catch(e){console.error("daily-riff",String(e).slice(0,180));return reply({error:"Temporary server error"},500)}
});