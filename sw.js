const CACHE_NAME = 'projekgo-mitra-v2';
// Tambahkan halaman offline ke dalam cache
const OFFLINE_URL = '/offline.html';

const urlsToCache = [
    '/',
    '/index.html',
    OFFLINE_URL
];

// Install Service Worker dan simpan cache awal
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
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
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Strategi Cache yang disukai PWA Builder: 
// Network first untuk HTML, dengan Offline Fallback. Cache first untuk aset lainnya.
self.addEventListener('fetch', event => {
    // Hanya tangani request navigasi (pindah halaman HTML)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    // Coba ambil dari jaringan terlebih dahulu
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    // Jika jaringan gagal (offline), kembalikan halaman offline.html dari cache
                    const cache = await caches.open(CACHE_NAME);
                    const cachedResponse = await cache.match(OFFLINE_URL);
                    return cachedResponse;
                }
            })()
        );
    } else {
        // Untuk aset lainnya (gambar, css, js), gunakan strategi Cache First, lalu Network
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});
