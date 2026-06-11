// Cache name berubah otomatis setiap menit — SW lama langsung diganti saat deploy
const CACHE_NAME = 'order-v' + Date.now();

const ASSETS = [
  './order.html',
  './manifest-order.json',
  './LOGO.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  // Network-first: selalu ambil dari server, cache hanya fallback offline
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(res => {
        // Hanya cache response yang valid
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Langsung aktif saat ada versi baru (dipanggil dari halaman)
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
