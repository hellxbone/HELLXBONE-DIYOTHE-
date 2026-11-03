import webpush from "npm:web-push@3.6.7";
const root=Deno.env.get("SUPABASE_URL")||"";
const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const base={"apikey":secret,"Authorization":"Bearer "+secret,"Content-Type":"application/json"};
const cors={"Access-Control-Allow-Origin":"https://hellxbone.github.io","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-hellx-cron-token"};
const respond=(obj:unknown,status=200)=>new Response(JSON.stringify(obj),{status,headers:{...cors,"Content-Type":"application/json"}});
async function db(table:string,opts:RequestInit,params=""){const r=await fetch(root+"/rest/v1/"+table+params,{...opts,headers:{...base,...opts.headers}});if(!r.ok)throw Error("database "+table+" "+r.status);return r.status===204?null:await r.json().catch(()=>null)}
const norm=(v:unknown)=>String(v||"").trim().toLocaleLowerCase("fr");
const values=(v:unknown,max:number)=>Array.isArray(v)?[...new Set(v.map(x=>norm(x).slice(0,45)).filter(x=>x.length>0&&/^[\p{L}\p{N} '’/-]+$/u.test(x)))].slice(0,max):[];
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{headers:cors});
 if(req.method!=="POST")return respond({error:"Method not allowed"},405);
 if(!secret||!root)return respond({error:"Server unavailable"},503);
 try{
  const action=new URL(req.url).searchParams.get("action");
  if(action==="save"){
   if(req.headers.get("origin")!=="https://hellxbone.github.io")return respond({error:"Origin denied"},403);
   const body=await req.json(), sub=body.subscription;
   if(!sub||typeof sub.endpoint!=="string"||sub.endpoint.length>1800)return respond({error:"Invalid subscription"},400);
   const rows=await db("hellx_push_subscriptions",{method:"GET"},"?select=endpoint,subscription&endpoint=eq."+encodeURIComponent(sub.endpoint)+"&limit=1");
   if(!rows?.length||rows[0].subscription?.keys?.auth!==sub.keys?.auth||rows[0].subscription?.keys?.p256dh!==sub.keys?.p256dh)return respond({error:"Subscription mismatch"},403);
   const departments=values(body.departments,12).filter(x=>/^[0-9]{2,3}[ab]?$/.test(x));
   const genres=values(body.genres,12);
   await db("hellx_concert_alert_preferences",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({endpoint:sub.endpoint,enabled:body.enabled===true,departments,genres,updated_at:new Date().toISOString()})});
   return respond({ok:true,enabled:body.enabled===true});
  }
  if(action==="dispatch"){
   const s=(await db("hellx_push_scheduler",{method:"GET"},"?select=token&id=eq.1&limit=1"))?.[0];
   if(!s?.token||req.headers.get("x-hellx-cron-token")!==s.token)return respond({error:"Forbidden"},403);
   const now=new Date(),earlier=new Date(now.getTime()-3*86400000),later=new Date(now.getTime()+45*86400000);
   const concerts=await db("hellx_concerts",{method:"GET"},"?select=id,title,city,department,genre,event_date,created_at&published=eq.true&event_date=gte."+encodeURIComponent(now.toISOString())+"&event_date=lte."+encodeURIComponent(later.toISOString())+"&created_at=gte."+encodeURIComponent(earlier.toISOString())+"&limit=150");
   const prefs=await db("hellx_concert_alert_preferences",{method:"GET"},"?select=endpoint,enabled,departments,genres&enabled=eq.true&limit=1000");
   if(!prefs?.length||!concerts?.length)return respond({ok:true,sent:0});
   const vapid=(await db("hellx_push_keys",{method:"GET"},"?select=public_key,private_key&id=eq.1&limit=1"))?.[0];if(!vapid)return respond({error:"VAPID not configured"},503);
   webpush.setVapidDetails("mailto:contact@hellxbone.fr",vapid.public_key,vapid.private_key);
   const subs=await db("hellx_push_subscriptions",{method:"GET"},"?select=endpoint,subscription&limit=1000");
   const map=new Map((subs||[]).map((s:any)=>[s.endpoint,s.subscription]));
   let sent=0,failed=0;
   for(const pref of prefs){
    const subscription=map.get(pref.endpoint);if(!subscription)continue;
    const matches=concerts.filter((e:any)=>(!pref.departments?.length||pref.departments.includes(norm(e.department)))&&(!pref.genres?.length||pref.genres.some((g:string)=>norm(e.genre).includes(g))));
    for(const event of matches.slice(0,10)){
     const duplicate=await db("hellx_concert_alert_deliveries",{method:"GET"},"?select=concert_id&endpoint=eq."+encodeURIComponent(pref.endpoint)+"&concert_id=eq."+event.id+"&limit=1");
     if(duplicate?.length)continue;
     try{
      await webpush.sendNotification(subscription,JSON.stringify({title:"HELLXBONE · Nouveau concert",body:event.title+" · "+event.city+" · "+new Date(event.event_date).toLocaleDateString("fr-FR",{timeZone:"Europe/Paris"}),url:"./?concerts=1",tag:"hellx-concert-"+event.id}));
      await db("hellx_concert_alert_deliveries",{method:"POST",headers:{Prefer:"resolution=ignore-duplicates,return=minimal"},body:JSON.stringify({endpoint:pref.endpoint,concert_id:event.id})});sent++;
     }catch(e){failed++;console.error("concert delivery failed",String(e).slice(0,180))}
    }
   }
   return respond({ok:true,sent,failed});
  }
  return respond({error:"Unknown action"},404);
 }catch(e){console.error("hellx-concert-alerts",String(e));return respond({error:"Service temporarily unavailable"},500)}
});