// ════════════════════════════════════════════════════════════
//  SW IMAGE CACHE PATCH
//  Tempelkan kode ini ke dalam sw.js dan sw-order.js
//  di dalam event listener 'fetch' yang sudah ada.
//  Letakkan DI ATAS handler fetch yang lain.
// ════════════════════════════════════════════════════════════

const IMAGE_CACHE = 'img-cache-v1';
const IMAGE_CACHE_MAX = 150; // max jumlah gambar yang di-cache

// Tambahkan di dalam: self.addEventListener('fetch', event => {
//   ↓↓↓ paste ini di baris pertama handler ↓↓↓

  // ── Image cache: stale-while-revalidate ──
  if (event.request.destination === 'image' ||
      event.request.url.includes('/storage/v1/object/public/')) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async cache => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then(res => {
          if (res && res.status === 200) {
            cache.put(event.request, res.clone());
            // Trim cache jika terlalu besar
            cache.keys().then(keys => {
              if (keys.length > IMAGE_CACHE_MAX) {
                keys.slice(0, keys.length - IMAGE_CACHE_MAX).forEach(k => cache.delete(k));
              }
            });
          }
          return res;
        }).catch(() => cached); // fallback ke cache jika offline
        // Kalau ada di cache → langsung tampilkan, update di background
        return cached || fetchPromise;
      })
    );
    return; // ← penting: stop di sini, jangan lanjut ke handler lain
  }

// ════════════════════════════════════════════════════════════
//  CONTOH: jika sw.js-mu saat ini seperti ini:
//
//  self.addEventListener('fetch', event => {
//    // ... existing cache logic
//  });
//
//  Ubah jadi:
//
//  self.addEventListener('fetch', event => {
//    if (event.request.destination === 'image' || ...) {
//      event.respondWith(...);
//      return;
//    }
//    // ... existing cache logic tetap di bawah
//  });
// ════════════════════════════════════════════════════════════
