const CACHE_NAME = 'mragenda-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  // The JS files are loaded dynamically via modules, they will be cached by the fetch handler.
];

// Install event: open cache and add core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('ServiceWorker: Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('ServiceWorker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        // Return response from cache if available
        if (response) {
          return response;
        }

        // Otherwise, fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Add the new response to the cache
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
