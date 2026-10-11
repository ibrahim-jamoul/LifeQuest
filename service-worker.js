// PWA d'essai. L'installation et l'orientation dépendent des capacités du navigateur.
const CACHE_PREFIX='lifequest-v3-portrait-local-';
const CACHE=`${CACHE_PREFIX}20261011-3`;
const ASSETS=['./','./index.html','./app.css','./app.js','./manifest.webmanifest','./core/model.js','./data/catalogue.js','./data/activities.js','./assets/robot.svg','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 // Les requêtes Range des vidéos sont laissées au serveur pour préserver l'avance/lecture.
 if(req.headers.has('range'))return;
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{if(response.ok&&!req.url.includes('/media/')){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(req,clone))}return response}).catch(()=>req.mode==='navigate'?caches.match('./index.html'):Promise.reject(new Error('Ressource hors ligne indisponible')))))});
