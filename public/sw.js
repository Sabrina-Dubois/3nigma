const CACHE = '3nigma-v2'
const PRECACHE_URLS = ['/', '/index.html', '/pwa-192.png', '/pwa-512.png']

// INSTALL
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)))
})

// ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => (key !== CACHE ? caches.delete(key) : null))),
      )
      .then(() => clients.claim()),
  )
})

// FETCH
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
          return res
        })
        .catch(() => caches.match('/index.html'))
    }),
  )
})
