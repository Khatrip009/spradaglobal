// public/sw.js
/* Minimal Service Worker
 * - listens for 'push' and shows a notification with data payload (title, body, icon, url)
 * - handles notificationclick to open or focus the url
 * - falls back to a simple offline fetch handler (pass-through)
 */

self.addEventListener('install', (event) => {
  // Activate immediately
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
    const icon = data.icon || '/images/SPRADA_LOGO.png';
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
      // try to focus an open client
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      // else open a new window
      if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
    })()
  );
});

// simple fetch pass-through (you can extend offline caching here)
self.addEventListener('fetch', (event) => {
  // For navigation requests we could respond with an offline page - keeping simple pass-through:
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
