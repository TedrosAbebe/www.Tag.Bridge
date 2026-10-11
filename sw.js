const CACHE = 'tagbridge-v9';

// Clear ALL old caches immediately
self.addEventListener('install', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => caches.delete(k)))
        ).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
        .then(() => self.clients.matchAll({ includeUncontrolled: true }))
        .then(clients => clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' })))
    );
});

// Always network first — never serve stale cache
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
