const CACHE_NAME = 'tech-board-v1'
const urlsToCache = [
  '/',
  '/popular',
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 존재하는 리소스만 캐싱 (실패해도 계속 진행)
      return Promise.allSettled(
        urlsToCache.map(url => 
          fetch(url)
            .then(response => {
              if (response.ok) {
                return cache.put(url, response)
              }
            })
            .catch(err => {
              console.warn(`Failed to cache ${url}:`, err)
            })
        )
      )
    }).catch(err => {
      console.error('Cache installation failed:', err)
    })
  )
  // Service Worker가 즉시 활성화되도록
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  let data = {}
  
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = { title: '알림', body: event.data.text() }
    }
  }

  const options = {
    title: data.title || '알림',
    body: data.body || '새로운 알림이 있습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: data.data || {},
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data || {}
  let url = '/'

  if (data.postId) {
    url = `/posts/${data.postId}`
  }

  event.waitUntil(
    clients.openWindow(url)
  )
})

