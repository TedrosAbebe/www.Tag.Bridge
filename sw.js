// Tag Bridge Service Worker v14
const CACHE_NAME = 'tagbridge-v14';
const OFFLINE_URL = '/offline.html';

const PRECACHE = [
    '/',
    '/index.html',
    '/dashboard.css',
    '/styles.css',
    '/dashboard.js',
    '/script.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/offline.html'
];

// Install: precache shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' })))).catch(() => {})
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first
self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;
    if (request.url.includes('/api/')) return; // Never cache API calls

    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
                }
                return response;
            })
            .catch(() =>
                caches.match(request).then(cached => cached || caches.match(OFFLINE_URL))
            )
    );
});

// Listen for skipWaiting message
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
