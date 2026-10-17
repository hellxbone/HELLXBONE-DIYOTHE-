const MODEL='@cf/meta/llama-3.1-8b-instruct-fp8';
const SYSTEM='Tu es HELLX, chatbot du HELLXBONE CLUB, univers metal et rock. Tu réponds en français sur tous les sujets, naturellement, avec une pointe d’humour noir sympathique et sans forcer. Tu ne prétends pas connaître des informations en temps réel sans accès. Ne demande pas de données sensibles. Sois concis et pertinent.';
export default {async fetch(request,env){
const origin=request.headers.get('Origin')||'',allowed=env.ALLOWED_ORIGIN||'';
const h={'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','Cache-Control':'no-store'};
if(!allowed||origin!==allowed)return Response.json({error:'Origine interdite'},{status:403});
if(request.method==='OPTIONS')return new Response(null,{status:204,headers:h});
if(request.method!=='POST')return Response.json({error:'Méthode interdite'},{status:405,headers:h});
try{if(Number(request.headers.get('Content-Length')||0)>15000)return Response.json({error:'Trop long'},{status:413,headers:h});
const data=await request.json(),messages=data.messages;
if(!Array.isArray(messages)||!messages.length||messages.length>12||messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>1200)||messages.at(-1).role!=='user')return Response.json({error:'Messages invalides'},{status:400,headers:h});
const answer=await env.AI.run(MODEL,{messages:[{role:'system',content:SYSTEM},...messages],max_tokens:280,temperature:0.75});
return Response.json({reply:String(answer.response||'').slice(0,1800)},{headers:h});
}catch(e){const quota=/quota|limit|neurons|exceeded/i.test(String(e));return Response.json({error:quota?'Quota atteint':'IA temporairement indisponible'},{status:quota?429:503,headers:h})}
}};