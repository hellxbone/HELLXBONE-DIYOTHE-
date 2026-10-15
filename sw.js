const CACHE_VERSION='hellxbone-neon-icon-20261015-v2';
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match(event.request)));
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
