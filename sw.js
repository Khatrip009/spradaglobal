// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// compute base path for assets: e.g. "/spradaglobal/" or "/"
const SW_BASE = (function () {
  try {
    const p = self.location.pathname || "/";
    // if path ends with /sw.js remove that part
    if (p.endsWith('/sw.js')) {
      return p.slice(0, -7) || '/';
    }
    // fallback: use root
    return '/';
  } catch (e) {
    return '/';
  }
})();

self.addEventListener('push', (event) => {
  try {
    const data = (event.data && event.data.json && event.data.json()) || (event.data && event.data.text && JSON.parse(event.data.text())) || {};
    const title = data.title || data.heading || 'Notification';
    const body = data.body || data.message || '';
    // Resolve icon relative to service worker scope so it works on subpaths
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

// fetch pass-through with safe fallback to cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
