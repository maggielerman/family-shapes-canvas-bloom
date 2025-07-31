const CACHE_NAME = 'family-shapes-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

// Cache versions for easy updates
const CACHE_VERSION = 1;
const CACHE_WHITELIST = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];

// Files to cache immediately - expanded list
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/placeholder.svg',
];

// Cache strategies
const CACHE_STRATEGIES = {
  cacheFirst: (request, cacheName = DYNAMIC_CACHE) => {
    return caches.match(request)
      .then(response => {
        if (response) {
          // Return from cache but also update in background
          fetch(request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(cacheName)
                  .then(cache => cache.put(request, networkResponse.clone()));
              }
            })
            .catch(() => {}); // Silently fail background update
          return response;
        }
        return fetch(request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(cacheName)
              .then(cache => cache.put(request, responseToCache));
            return response;
          });
      });
  },
  
  networkFirst: (request, cacheName = DYNAMIC_CACHE, timeout = 3000) => {
    return Promise.race([
      fetch(request)
        .then(response => {
          if (!response || response.status !== 200) {
            throw new Error('Network response was not ok');
          }
          const responseToCache = response.clone();
          caches.open(cacheName)
            .then(cache => cache.put(request, responseToCache));
          return response;
        }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), timeout)
      )
    ])
    .catch(() => caches.match(request));
  },
  
  staleWhileRevalidate: (request, cacheName = DYNAMIC_CACHE) => {
    return caches.match(request)
      .then(cachedResponse => {
        const fetchPromise = fetch(request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(cacheName)
                .then(cache => cache.put(request, networkResponse.clone()));
            }
            return networkResponse;
          });
        return cachedResponse || fetchPromise;
      });
  }
};

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!CACHE_WHITELIST.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different resource types with appropriate strategies
  
  // API requests - network first with timeout
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request, DYNAMIC_CACHE, 5000));
    return;
  }

  // Images - cache first
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // JavaScript and CSS - stale while revalidate
  if (/\.(js|css)$/i.test(url.pathname)) {
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // HTML pages - network first with quick timeout
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request, DYNAMIC_CACHE, 2000));
    return;
  }

  // Default - stale while revalidate
  event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Handle any pending offline actions
    console.log('Performing background sync');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Family Shapes',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Family Shapes', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});