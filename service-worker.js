const CACHE_NAME = 'barber-dolocal-v1';
const urlsToCache = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',

  'img/barba.png',
  'img/blower.jpg',
  'img/buzz cut.png',
    'img/cejas.png',
    'img/corte Varonil con 1 y 2.png',
    'img/dady yankee.png',
  'img/high fade.png',
  'img/icon_app.png',
  'img/low fade.jpg',
  'img/mid fade.jpg',
   'img/mullet.png',
  'img/mohicano.png',
  'img/pompadour.png',
  'img/varonil con cero.jpg',
  
];

// Instala el service worker y cachea los recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activa el SW y limpia caches viejos si existen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// Intercepta peticiones y responde desde la caché si está disponible
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
