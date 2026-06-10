const CACHE_NAME = 'newruput-v2.0.0';
const ASSETS = [
  'index.html',
  'order.html',
  'manifest.json',
  'manifest-order.json',
  'LOGO.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-192.png',
  'icon-maskable-512.png'
];

// Install: cache semua asset
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: hapus semua cache lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  e.waitUntil(clients.claim());
});

// Fetch: Network First → fallback ke cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
