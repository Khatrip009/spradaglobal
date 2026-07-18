// src/main.jsx
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./App.css";
import "./components/ui/toast.css";
import { postVisitorIdentify, postVisitorEvent } from "./lib/api";

// --- Vite base URL for assets / service worker ---
const RAW_BASE_URL = import.meta.env.BASE_URL || "/";
export const BASE_URL = RAW_BASE_URL.replace(/\/$/, "") + "/"; // ends with a single slash

// --- Cookie helpers ---
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const cookies = (document.cookie || "").split("; ");
  for (let c of cookies) {
    if (c.startsWith(name + "=")) {
      return decodeURIComponent(c.split("=").slice(1).join("="));
    }
  }
  return null;
}
function setCookie(name, value, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

// --- Visitor registration & analytics (using Supabase) ---
const SESSION_COOKIE = "exotech_sid";
const LS_VISITOR_ID = "visitor_id";

async function ensureVisitorId() {
  let sessionId = getCookie(SESSION_COOKIE);
  if (!sessionId) {
    sessionId = `sess_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    setCookie(SESSION_COOKIE, sessionId);
  }

  try {
    const stored = localStorage.getItem(LS_VISITOR_ID);
    if (stored) return stored;
  } catch {}

  try {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
    const meta = { source: "sprada-fe", first_path: typeof window !== "undefined" ? window.location.pathname : null };
    // postVisitorIdentify expects { user_agent?, metadata?, session_id? }
    const visitor = await postVisitorIdentify(sessionId, { user_agent: ua, metadata: meta });
    const vid = visitor?.id || null;
    if (vid) {
      try { localStorage.setItem(LS_VISITOR_ID, vid); } catch {}
      return vid;
    }
  } catch (e) {
    console.warn("visitor identify failed", e);
  }
  return null;
}

async function sendPageView(visitorId) {
  const payload = {
    event_type: "page_view",
    event_props: {
      path: typeof window !== "undefined" ? window.location.pathname : null,
      search: typeof window !== "undefined" ? window.location.search : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
    },
  };
  try {
    await postVisitorEvent(visitorId, "page_view", payload.event_props);
  } catch (e) {
    console.warn("visitor event failed", e);
  }
}

/* -----------------------------------------------------------
  Service worker registration (unchanged)
------------------------------------------------------------ */
async function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const swPath = `${BASE_URL}sw.js`;
    const reg = await navigator.serviceWorker.register(swPath);
    console.info("Service worker registered:", reg.scope || reg);
  } catch (e) {
    console.warn("Service worker registration failed:", e && e.message ? e.message : e);
  }
}

async function bootstrapAnalyticsAndSW() {
  try {
    const visitorId = await ensureVisitorId();
    if (visitorId) {
      await sendPageView(visitorId);
    }
  } catch (e) {
    console.warn("Analytics bootstrap error:", e);
  }
  try {
    await registerServiceWorker();
  } catch {}
}

// Kick off bootstrapping once DOM is ready
if (typeof window !== "undefined") {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    bootstrapAnalyticsAndSW();
  } else {
    window.addEventListener("DOMContentLoaded", bootstrapAnalyticsAndSW, { once: true });
  }
}

// --- React root ---
const rootEl = typeof document !== "undefined" ? document.getElementById("root") : null;
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("React root element '#root' not found — App not mounted.");
}