const CACHE_NAME = 'solarlion-v1';
const ASSETS = [
  '/solarlionapps/',
  '/solarlionapps/index.html',
  '/solarlionapps/calculadora-ganancias.html',
  '/solarlionapps/manifest.json',
  '/solarlionapps/icon-192.png',
  '/solarlionapps/icon-512.png'
];

// Instalar: guarda archivos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar: elimina cachés viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: sirve desde caché, si no hay conexión
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Guarda en caché solo respuestas válidas
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => caches.match('/solarlionapps/index.html'));
    })
  );
});
