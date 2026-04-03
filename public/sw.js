const serviceWorkerUrl = new URL(self.location.href)
const appVersion = serviceWorkerUrl.searchParams.get('appVersion') ?? 'dev'
const CACHE_NAME = `foodie-shell-${appVersion}`
const OFFLINE_FALLBACK_URL = '/'
const APP_SHELL = [OFFLINE_FALLBACK_URL, '/manifest.webmanifest', '/favicon.svg']

const isNavigationRequest = (request) =>
  request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')

const cacheResponse = async (request, response) => {
  if (!response || !response.ok) {
    return response
  }

  const cache = await caches.open(CACHE_NAME)
  await cache.put(request, response.clone())
  return response
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(request.url)

  if (requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith('/api/')) {
    return
  }

  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => cacheResponse(request, networkResponse))
        .catch(async () => {
          const cachedResponse = await caches.match(request)
          return cachedResponse ?? caches.match(OFFLINE_FALLBACK_URL)
        }),
    )

    return
  }

  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      try {
        const networkResponse = await fetch(request)
        return await cacheResponse(request, networkResponse)
      } catch {
        return cachedResponse ?? Response.error()
      }
    }),
  )
})