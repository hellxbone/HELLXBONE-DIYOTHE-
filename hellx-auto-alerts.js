/* HELLXBONE — abonnement push automatique lorsque le navigateur a déjà reçu l'autorisation. */
(function(){
'use strict';
async function syncPush(){
 if(!('Notification' in window)||Notification.permission!=='granted'||!('serviceWorker' in navigator)||!('PushManager' in window))return;
 const config=window.HELLXBONE_LEADERBOARD;
 if(!config||!config.url)return;
 try{
  const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
  const endpoint=config.url+'/functions/v1/hellx-push';
  const response=await fetch(endpoint+'?action=config');
  if(!response.ok)throw Error('Configuration push indisponible');
  const settings=await response.json();
  if(!settings.publicKey)return;
  let subscription=await reg.pushManager.getSubscription();
  if(!subscription){
   const str=atob(settings.publicKey.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(settings.publicKey.length/4)*4,'='));
   subscription=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(str,c=>c.charCodeAt(0))});
  }
  const save=await fetch(endpoint+'?action=subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription:subscription.toJSON()})});
  if(!save.ok)throw Error('Synchronisation push indisponible');
  localStorage.setItem('hellx-alerts-enabled','yes');
 }catch(e){console.warn('HELLXBONE : synchronisation automatique des alertes impossible',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncPush,{once:true});else syncPush();
})();
