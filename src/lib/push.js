// src/lib/push.js
// Frontend helper to register SW and subscribe for push.
// API endpoints: /api/push/vapid and /api/push/subscribe
// These can be implemented as Supabase Edge Functions.

// -------------------------------------------------------------
// Config – read from environment
// -------------------------------------------------------------
const API_BASE =
  (import.meta.env.VITE_PUSH_API_URL ||
   import.meta.env.VITE_API_URL ||
   '').replace(/\/$/, '');

// If you want to use Supabase Edge Functions, set VITE_PUSH_API_URL
// to your function URL, e.g.: https://<project>.supabase.co/functions/v1

// -------------------------------------------------------------
// Utilities
// -------------------------------------------------------------
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// -------------------------------------------------------------
// Public API
// -------------------------------------------------------------

/**
 * Register the service worker (if not already)
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('serviceWorker_not_supported');
  }
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;
  return reg;
}

/**
 * Subscribe for push notifications.
 * @param {string} visitorId - Optional visitor ID to associate with subscription.
 * @returns {Promise<PushSubscription>}
 */
export async function subscribeForPush(visitorId) {
  // Check browser support
  if (!('PushManager' in window)) {
    throw new Error('push_not_supported');
  }

  // 1. Fetch VAPID public key from server
  const vapidUrl = API_BASE ? `${API_BASE}/api/push/vapid` : '/api/push/vapid';
  const vapidRes = await fetch(vapidUrl, { credentials: 'include' });
  if (!vapidRes.ok) {
    const body = await vapidRes.text().catch(() => '');
    throw new Error(`vapid_fetch_failed: ${vapidRes.status} ${body}`);
  }
  const vapidJson = await vapidRes.json();
  const publicKey = vapidJson && vapidJson.publicKey;
  if (!publicKey) {
    throw new Error('vapid_key_missing');
  }

  // 2. Register service worker
  const registration = await registerServiceWorker();

  // 3. Request notification permission (if not already granted)
  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      throw new Error('permission_denied');
    }
  }
  if (Notification.permission !== 'granted') {
    throw new Error('permission_not_granted');
  }

  // 4. Check if already subscribed
  let subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    // Inform backend about existing subscription (best-effort)
    try {
      await fetch(API_BASE + '/api/push/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          subscription: subscription.toJSON(),
          browser: navigator.userAgent,
        }),
      });
    } catch (e) {
      console.warn('inform existing subscription failed', e);
    }
    return subscription;
  }

  // 5. Create new subscription
  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  // 6. Send subscription to backend
  const subscribeUrl = API_BASE ? `${API_BASE}/api/push/subscribe` : '/api/push/subscribe';
  const resp = await fetch(subscribeUrl, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitor_id: visitorId,
      subscription: subscription.toJSON(),
      browser: navigator.userAgent,
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`subscribe_post_failed: ${resp.status} ${txt}`);
  }

  return subscription;
} 