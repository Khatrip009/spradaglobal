// src/components/CookieBanner.jsx
import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const COOKIE_NAME = 'exotech_sid';

function getSid() {
  const m = (document.cookie || '').split('; ').find(c => c.startsWith(COOKIE_NAME + '='));
  return m ? m.split('=')[1] : null;
}

export default function CookieBanner() {
  const [seen, setSeen] = useState(() => !!localStorage.getItem('cookie_consent_seen'));
  const [agreeAll, setAgreeAll] = useState(false);

  useEffect(() => {
    if (seen) return;
    // optionally show banner
  }, [seen]);

  if (seen) return null;

  const onAccept = async () => {
    const visitor_id = getSid();
    const consent = { analytics: true, marketing: true, personalization: true };
    try {
      if (visitor_id) await api.postCookieConsent(visitor_id, consent);
    } catch (e) {
      console.warn('cookie consent post failed', e);
    }
    localStorage.setItem('cookie_consent_seen', '1');
    setSeen(true);
  };

  const onDecline = async () => {
    const visitor_id = getSid();
    const consent = { analytics: false, marketing: false, personalization: false };
    try {
      if (visitor_id) await api.postCookieConsent(visitor_id, consent);
    } catch (e) {
      console.warn('cookie consent post failed', e);
    }
    localStorage.setItem('cookie_consent_seen', '1');
    setSeen(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto bg-white rounded-xl p-4 shadow-lg z-50 flex flex-col sm:flex-row items-center gap-4">
      <div className="flex-1 text-sm text-[#333]">
        We use cookies for analytics and to improve your experience. Manage your preferences or accept to continue.
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-2 border rounded" onClick={onDecline}>Decline</button>
        <button className="px-3 py-2 bg-[#D7B15B] rounded" onClick={onAccept}>Accept</button>
      </div>
    </div>
  );
}