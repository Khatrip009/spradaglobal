// src/components/NotificationModal.jsx
import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { subscribeForPush, registerServiceWorker } from '../../lib/push';

/**
 * NotificationModal
 *
 * - Renders a subtle bell icon suitable for header placement.
 * - Also renders a small floating CTA (bottom-right) if not subscribed.
 * - When user clicks "Enable", it asks for permission and subscribes via server-provided VAPID key.
 *
 * Usage:
 *  - import NotificationModal from '../NotificationModal';
 *  - Place <NotificationModal /> in Header.jsx (it will render bell icon).
 *  - The floating CTA appears automatically if user hasn't subscribed yet.
 */

const STORAGE_KEY = 'push_subscribed';
const VISITOR_KEY = 'visitor_id';

function readSubscribedFlag() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1' || Notification.permission === 'granted';
  } catch (e) {
    return false;
  }
}

async function ensureVisitorId() {
  // try to read previously stored visitor id
  try {
    const stored = localStorage.getItem(VISITOR_KEY);
    if (stored) return stored;
  } catch (e) {
    // noop
  }

  // best-effort: create a temporary visitor id on the server
  try {
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || '';
    const tempSession = `client-${Math.random().toString(36).slice(2)}`;
    const res = await fetch(base + '/api/visitors/identify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: tempSession, ua: navigator.userAgent, meta: { source: 'push-opt-in' } })
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    const vid = (json && (json.visitor_id || json.visitorId || json.id)) || null;
    if (vid) {
      try { localStorage.setItem(VISITOR_KEY, vid); } catch (e) { /* ignore */ }
      return vid;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export default function NotificationModal() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null); // 'subscribed' | 'denied' | 'error' | null
  const [subscribed, setSubscribed] = useState(() => readSubscribedFlag());
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    // Quietly register service worker (non-subscribing) so client is ready for push later.
    // If sw registration fails, we still allow user to try subscribe on click.
    if ('serviceWorker' in navigator) {
      registerServiceWorker().catch(() => {});
    }

    // Decide whether to show floating CTA:
    // Show if not subscribed and not denied.
    const shouldShow = !readSubscribedFlag() && Notification.permission !== 'denied';
    setShowFloating(shouldShow);
  }, []);

  useEffect(() => {
    // persist status for UI across reloads
    if (status === 'subscribed') {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
      setSubscribed(true);
      setShowFloating(false);
    } else if (status === 'denied') {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      setSubscribed(false);
      setShowFloating(false);
    }
  }, [status]);

  async function handleEnable() {
    setBusy(true);
    setStatus(null);
    try {
      // ensure we have a visitor id (best-effort)
      const visitorId = await ensureVisitorId();
      if (!visitorId) {
        // still allow subscribe even if visitorId missing — backend may accept anonymous subscriptions in your setup
      }

      // subscribeForPush will:
      //  - fetch /api/push/vapid
      //  - register service worker if needed
      //  - request permission if required
      //  - subscribe and POST to /api/push/subscribe
      await subscribeForPush(visitorId);
      setStatus('subscribed');
    } catch (err) {
      // Map friendly messages
      const m = (err && err.message) || String(err);
      if (m.includes('permission')) {
        setStatus('denied');
      } else if (m.includes('vapid')) {
        setStatus('error');
      } else {
        setStatus('error');
      }
      console.error('push subscribe failed', err);
    } finally {
      setBusy(false);
      // close modal after a short delay so user sees the status
      setTimeout(() => setOpen(false), 900);
    }
  }

  const smallBellButton = (
    <button
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      aria-label={subscribed ? 'Manage notifications' : 'Enable notifications'}
      className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-[#D7B15B]/10 transition"
      title={subscribed ? 'Notifications enabled' : 'Enable notifications'}
    >
      {subscribed ? <Bell className="w-5 h-5 text-[#33504F]" /> : <BellOff className="w-5 h-5 text-[#33504F]" />}
      {/* small badge when not subscribed */}
      {!subscribed && Notification.permission !== 'denied' && (
        <span className="absolute inline-block w-2 h-2 bg-[#D7B15B] rounded-full -translate-x-1 translate-y-2 ml-3" />
      )}
    </button>
  );

  const floatingCTA = showFloating ? (
    <button
      aria-label="Enable notifications"
      onClick={() => setOpen(true)}
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border-2 border-[#D7B15B] hover:shadow-2xl transition"
      title="Enable notifications"
    >
      <Bell className="w-5 h-5 text-[#33504F]" />
    </button>
  ) : null;

  return (
    <>
      {/* Header bell control (compact) */}
      <div className="relative">{smallBellButton}</div>

      {/* Floating CTA (central UI location for opt-in) */}
      {floatingCTA}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#08302b]">Enable browser notifications</h3>
                <p className="text-sm text-[#566] mt-1">
                  Receive product updates, shipment alerts and important announcements. We'll only show relevant and occasional messages — you can revoke this anytime from your browser settings.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-[#667]" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleEnable}
                disabled={busy || Notification.permission === 'denied'}
                className="bg-[#D7B15B] text-[#08302b] px-4 py-2 rounded-md font-medium disabled:opacity-60"
              >
                {busy ? 'Please wait...' : (subscribed ? 'Manage notifications' : 'Enable notifications')}
              </button>

              <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-md border">
                Cancel
              </button>
            </div>

            <div className="mt-4 text-sm">
              {status === 'subscribed' && <div className="text-green-600">Subscribed — you'll receive notifications.</div>}
              {status === 'denied' && <div className="text-red-600">Permission denied. Please allow notifications in your browser settings.</div>}
              {status === 'error' && <div className="text-red-600">Subscription failed. Check console or contact admin.</div>}
              {!status && Notification.permission === 'denied' && <div className="text-sm text-red-600">You have blocked notifications. Enable them in browser settings to receive updates.</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
