// public/sw.js
// Minimal robust Service Worker for Sprada
// - safe push handling
// - notification click opens/focuses URL
// - fetch handler always returns a Response (no more "Failed to convert value to 'Response'")

const CACHE_NAME = 'sprada-static-v1';
const PRECACHE_URLS = [
  // you can add critical assets to pre-cache if you want, e.g.:
  // '/', 'index.html', 'assets/index-xxxx.js'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(PRECACHE_URLS);
      } catch (e) {
        // ignore missing assets at install time
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    // Claim clients so the SW is active immediately
    await self.clients.claim();
    // Optionally remove old caches here
    const keys = await caches.keys();
    await Promise.all(
      keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))
    );
  })());
});

self.addEventListener('push', (ev) => {
  ev.waitUntil((async () => {
    try {
      // Prefer JSON payload; fall back to text
      let data = {};
      if (ev.data) {
        try { data = ev.data.json(); }
        catch { 
          try { data = JSON.parse(ev.data.text()); }
          catch { data = {}; }
        }
      }

      const title = data.title || data.heading || 'Notification';
      const body = data.body || data.message || '';
      // Resolve icon relative to the SW scope so it works on subpaths (GitHub Pages)
      const icon = data.icon ? new URL(data.icon, self.registration.scope).href
                            : new URL('images/SPRADA_LOGO.png', self.registration.scope).href;
      const url = data.url ? new URL(data.url, self.registration.scope).href : self.registration.scope;
      const tag = data.tag || 'general';

      const options = {
        body,
        icon,
        badge: icon,
        data: { url },
        tag,
        renotify: true
      };

      await self.registration.showNotification(title, options);
    } catch (err) {
      console.error('push event error', err);
    }
  })());
});

self.addEventListener('notificationclick', (ev) => {
  ev.notification.close();
  const urlToOpen = (ev.notification.data && ev.notification.data.url) || self.registration.scope;

  ev.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      // If a client tab already open to the URL, focus it
      if (client.url === urlToOpen && 'focus' in client) {
        return client.focus();
      }
    }
    // Otherwise open a new window/tab
    if (self.clients.openWindow) {
      return self.clients.openWindow(urlToOpen);
    }
  })());
});

// Robust fetch handler:
// - try network first
// - fallback to cache match
// - if cache miss, return a sensible Response (HTML for navigation or empty/503 for other requests)
self.addEventListener('fetch', (ev) => {
  const req = ev.request;

  ev.respondWith((async () => {
    // Bypass SW for special schemes (browser extensions etc.)
    if (!req || !req.url || req.url.startsWith('chrome-extension:')) {
      return fetch(req);
    }

    try {
      // Try network first for fresh content (you can change to cache-first for static assets)
      const networkResp = await fetch(req);
      // Optionally cache GET responses for future (not applied here to keep simple)
      return networkResp;
    } catch (networkErr) {
      // Network failed; try cache
      const cached = await caches.match(req);
      if (cached) return cached;

      // Nothing in cache: craft a fallback Response depending on request type
      if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
        // Navigation requests -> return a small offline HTML page
        const offlineHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Offline</title></head><body><h1>Offline</h1><p>The application is offline.</p></body></html>`;
        return new Response(offlineHtml, { headers: { 'Content-Type': 'text/html' }, status: 503 });
      }

      if (req.destination === 'image') {
        // Try placeholder image from cache, otherwise return an empty response
        const placeholder = await caches.match(new URL('images/placeholder.png', self.registration.scope).href);
        if (placeholder) return placeholder;
        return new Response('', { status: 503 });
      }

      // Generic fallback for other types
      return new Response('', { status: 503 });
    }
  })());
});
