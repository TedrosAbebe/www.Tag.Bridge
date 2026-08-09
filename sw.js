const CACHE = 'tagbridge-v3';
const OFFLINE_URL = '/offline.html';

// Files to cache on install
const PRECACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/offline.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  // Remove ALL old caches immediately
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    // Always fetch fresh HTML from network first
    e.respondWith(
      fetch(e.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Network first for JS and CSS — always get latest version
  if (e.request.url.match(/\.(js|css)$/)) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // Update cache with fresh version
          var clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache first for images and other static assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
