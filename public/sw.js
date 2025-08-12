// Service Worker for caching static assets
const CACHE_NAME = 'project-lens-v1'
const STATIC_CACHE = 'static-v1'
const IMAGE_CACHE = 'images-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && 
                     cacheName !== STATIC_CACHE && 
                     cacheName !== IMAGE_CACHE
            })
            .map((cacheName) => caches.delete(cacheName))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle different types of requests
  if (request.destination === 'image') {
    // Image caching strategy
    event.respondWith(
      caches.open(IMAGE_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              if (response) {
                return response
              }
              
              return fetch(request)
                .then((fetchResponse) => {
                  // Only cache successful responses
                  if (fetchResponse.status === 200) {
                    cache.put(request, fetchResponse.clone())
                  }
                  return fetchResponse
                })
                .catch(() => {
                  // Return a placeholder image if network fails
                  return new Response(
                    '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image not available</text></svg>',
                    { headers: { 'Content-Type': 'image/svg+xml' } }
                  )
                })
            })
        })
    )
  } else if (request.destination === 'script' || request.destination === 'style') {
    // Static assets caching strategy
    event.respondWith(
      caches.open(STATIC_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              return response || fetch(request)
                .then((fetchResponse) => {
                  if (fetchResponse.status === 200) {
                    cache.put(request, fetchResponse.clone())
                  }
                  return fetchResponse
                })
            })
        })
    )
  } else if (url.origin === location.origin) {
    // Same-origin requests - cache first, then network
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request)
            .then((fetchResponse) => {
              // Don't cache API responses or dynamic content
              if (fetchResponse.status === 200 && 
                  !request.url.includes('/api/') &&
                  !request.url.includes('_next/static/chunks/pages')) {
                const responseClone = fetchResponse.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, responseClone))
              }
              return fetchResponse
            })
        })
    )
  }
})

// Background sync for offline actions (if needed)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('Background sync triggered')
    )
  }
})

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
      })
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/')
  )
})