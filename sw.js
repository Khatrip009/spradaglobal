// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  try {
    const data = (event.data && event.data.json && event.data.json()) || (event.data && event.data.text && JSON.parse(event.data.text())) || {};
    const title = data.title || data.heading || 'Notification';
    const body = data.body || data.message || '';
    // Resolve icon relative to SW scope so it works under /spradaglobal/
    const icon = data.icon || (self.registration && self.registration.scope ? new URL('images/SPRADA_LOGO.png', self.registration.scope).href : 'images/SPRADA_LOGO.png');
    const url = data.url || '/';
    const tag = data.tag || 'general';

    const options = {
      body,
      icon,
      badge: icon,
      data: { url },
      tag,
      renotify: true
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error('push event error', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
    })()
  );
});

// safer fetch pass-through with guaranteed Response
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        // attempt network first
        const netResp = await fetch(event.request);
        return netResp;
      } catch (err) {
        // network failed — try cache
        try {
          const cached = await caches.match(event.request);
          if (cached) return cached;
        } catch (cacheErr) {
          // ignore caches errors
        }
        // final fallback: return a 503 Response (so respondWith always gets a Response)
        return new Response('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });
      }
    })()
  );
});
