const CACHE_VERSION='hellxbone-signal-offline-20261105-stable-v11';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_VERSION).then(cache=>cache.addAll(['./hellx-signal.html','./assets/6626.jpg'])).catch(()=>{}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('hellxbone-signal-offline-')&&key!==CACHE_VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 // External radio streams and Supabase API calls are handled by the browser.
 if(url.origin!==self.location.origin)return;
 if(!url.pathname.endsWith('/hellx-signal.html'))return;
 // Show the already-cached emergency page immediately and refresh it safely
 // in the background. This keeps SOS responsive on a poor connection.
 event.respondWith((async()=>{
  const cached=await caches.match('./hellx-signal.html');
  const refresh=fetch(event.request,{cache:'no-cache'}).then(async response=>{
   if(response.ok){
    try{const cache=await caches.open(CACHE_VERSION);await cache.put('./hellx-signal.html',response.clone())}catch(e){}
   }
   return response;
  });
  if(cached){
   event.waitUntil(refresh.catch(()=>{}));
   return cached;
  }
  try{return await refresh}catch(e){return Response.error()}
 })());
});
self.addEventListener('push',event=>{
 let data={};
 try{data=event.data?.json()||{}}catch{data={body:event.data?.text()||''}}
 const title=String(data.title||'HELLXBONE — L’enfer a du nouveau pour toi !').slice(0,120);
 const url=new URL(data.url||'./hellx-live.html',self.registration.scope);
 if(url.origin!==self.location.origin)url.href=new URL('./hellx-live.html',self.registration.scope).href;
 event.waitUntil(self.registration.showNotification(title,{
  body:String(data.body||'Une nouvelle actualité metal t’attend.').slice(0,240),
  icon:new URL('./icon-192.png',self.registration.scope).href,badge:new URL('./notification-badge.png',self.registration.scope).href,tag:String(data.tag||'hellxbone-news'),
  data:{url:url.href}
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=event.notification.data?.url||new URL('./hellx-live.html',self.registration.scope).href;
 event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{
  for(const tab of windows){if(tab.url.startsWith(self.registration.scope)){await tab.focus();if(tab.navigate)await tab.navigate(target);return}}
  await clients.openWindow(target);
 }));
});
