// Bump the CACHE_NAME when changing assets to force clients to update.
const CACHE_NAME = 'construct-v10';
const ASSETS = [
  '/',
  '/index.html',
  '/registration.html',
  '/admin.html',
  '/css/styles.css',
  '/css/ui-enhancements.css',
  '/assets/js/animations.js',
  '/assets/js/admin-dashboard.js',
  '/assets/js/register.js',
  '/assets/js/sw-register.js',
  '/assets/js/analytics.js',
  '/favicon.svg',
  '/assets/logos/nst-logo.png',
  '/assets/logos/tpf-logo.png',
  '/assets/logos/emergent-logo-new-black.svg'
];

self.addEventListener('install', (event) => {
  // Install: pre-cache assets and immediately take control of the page on next activation.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Claim clients so the new worker becomes active immediately.
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => { if (k !== CACHE_NAME) return caches.delete(k); })))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // API calls: network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // other requests: cache-first
  event.respondWith(
    caches.match(event.request).then((r) => r || fetch(event.request).then((resp) => {
      // cache assets
      if (event.request.method === 'GET' && resp && resp.status === 200) {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
      }
      return resp;
    })).catch(() => caches.match('/index.html'))
  );
});
