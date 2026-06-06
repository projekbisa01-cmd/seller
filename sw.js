const CACHE_NAME = 'projekgo-mitra-v1';
const urlsToCache = [
    '/',
    '/index.html'
];

// Install Service Worker dan simpan cache awal
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Aktivasi dan hapus cache lama jika ada update
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
    self.clients.claim();
});

// Fetch data: Strategi Cache-First dengan Network Fallback
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Mengembalikan respons dari cache jika ada
                if (response) {
                    return response;
                }
                // Jika tidak ada di cache, ambil dari jaringan
                return fetch(event.request);
            }).catch(() => {
                // Fallback offline (opsional)
                // Jika ingin menampilkan halaman offline khusus, bisa diarahkan ke sini
            })
    );
});
