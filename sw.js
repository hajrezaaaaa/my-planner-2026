const CACHE = "my-planner-pwa-v1";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil((async()=> {
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if(event.request.method!=="GET") return;
  event.respondWith(caches.match(event.request).then(cached=>cached || fetch(event.request).then(response=>{
    const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy)); return response;
  }).catch(()=>caches.match("./index.html"))));
});
self.addEventListener("message", event => {
  if(event.data?.type==="SHOW_NOTIFICATION"){
    const {title,body,tag}=event.data;
    event.waitUntil(self.registration.showNotification(title,{body,tag,icon:"./icon.svg",badge:"./icon.svg"}));
  }
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of windows){if("focus" in client){await client.focus();return;}}
    if(self.clients.openWindow) await self.clients.openWindow("./");
  })());
});
