// src/lib/push.js
// Frontend helper to register SW and subscribe for push using server-provided VAPID key.

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || '';

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

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) throw new Error('serviceWorker_not_supported');
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;
  return reg;
}

/**
 * subscribeForPush(visitorId)
 * - fetches /api/push/vapid for server-side VAPID public key
 * - registers/gets SW registration and subscribes
 * - posts subscription to /api/push/subscribe
 */
export async function subscribeForPush(visitorId) {
  if (!('PushManager' in window)) throw new Error('push_not_supported');
  // get vapid key from server
  const vapidRes = await fetch((API_BASE || '') + '/api/push/vapid', { credentials: 'include' });
  if (!vapidRes.ok) {
    const body = await vapidRes.text().catch(() => '');
    throw new Error(`vapid_fetch_failed: ${vapidRes.status} ${body}`);
  }
  const vapidJson = await vapidRes.json();
  const publicKey = vapidJson && vapidJson.publicKey;
  if (!publicKey) throw new Error('vapid_key_missing');

  // register sw
  const registration = await registerServiceWorker();
  // ensure permission
  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('permission_denied');
  }
  if (Notification.permission !== 'granted') throw new Error('permission_not_granted');

  // get existing subscription or create new
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    // inform backend about existing subscription (best-effort)
    try {
      await fetch((API_BASE || '') + '/api/push/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: visitorId, subscription: existing.toJSON(), browser: navigator.userAgent })
      });
    } catch (e) {
      console.warn('inform existing subscription failed', e);
    }
    return existing;
  }

  // subscribe
  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });

  // send to backend
  const resp = await fetch((API_BASE || '') + '/api/push/subscribe', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitor_id: visitorId, subscription: sub.toJSON(), browser: navigator.userAgent })
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`subscribe_post_failed: ${resp.status} ${txt}`);
  }
  return sub;
}
