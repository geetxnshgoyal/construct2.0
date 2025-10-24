const CACHE_NAME = 'construct-v7';
const ASSETS = [
  '/',
  '/index.html',
  '/registration.html',
  '/admin.html',
  '/css/styles.css',
  '/css/ui-enhancements.css',
  '/assets/js/animations.js',
  '/assets/js/register.js',
  '/assets/js/analytics.js',
  '/assets/logos/nst-logo.png',
  '/assets/logos/tpf-logo.png',
  '/assets/logos/emergent-logo-new-black.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => { if (k !== CACHE_NAME) return caches.delete(k); })))
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
