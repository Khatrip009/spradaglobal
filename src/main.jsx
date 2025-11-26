// src/main.jsx
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./App.css";
import "./components/ui/toast.css";
// --- API base (important: do NOT hit :5173 for API) ---
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4200").replace(/\/$/, "");

// --- Simple helpers ---
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
  // set Secure flag only on HTTPS so local dev (http://localhost) works
  const secure = location && location.protocol === "https:" ? "; Secure" : "";
  // HttpOnly cannot be set from JS; path and SameSite included
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

async function postJson(path, body) {
  const url = `${API_BASE}${path}`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
  } catch (networkErr) {
    const err = new Error("network_error");
    err.status = 0;
    err.body = { message: networkErr && networkErr.message ? networkErr.message : String(networkErr) };
    throw err;
  }

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { _raw: text };
  }
  if (!res.ok) {
    const err = new Error(json?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

// --- Visitor registration & analytics ---
const SESSION_COOKIE = "exotech_sid";
const LS_VISITOR_ID = "visitor_id";

async function ensureVisitorId() {
  // 1) generate / ensure a session id cookie
  let sessionId = getCookie(SESSION_COOKIE);
  if (!sessionId) {
    sessionId = `sess_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    setCookie(SESSION_COOKIE, sessionId);
  }

  // 2) reuse visitor id if already stored
  try {
    const stored = localStorage.getItem(LS_VISITOR_ID);
    if (stored) return stored;
  } catch {
    // ignore localStorage errors (private mode)
  }

  // 3) call backend to upsert / identify visitor
  try {
    const ip = null; // backend can infer IP
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
    const meta = { source: "sprada-fe", first_path: typeof window !== "undefined" ? window.location.pathname : null };

    const json = await postJson("/api/visitors/identify", {
      session_id: sessionId,
      ip,
      ua,
      meta,
    });

    const vid = json?.visitor_id || json?.visitorId || json?.id || null;
    if (vid) {
      try {
        localStorage.setItem(LS_VISITOR_ID, vid);
      } catch {
        // ignore
      }
      return vid;
    }
  } catch (e) {
    // keep this as a warning so analytics failures don't block app
    console.warn("visitor identify failed", e && e.body ? e.body : e);
  }

  return null;
}

async function sendPageView(visitorId) {
  // avoid sending null visitor_id to backend (some servers reject non-UUIDs)
  const payload = visitorId ? { visitor_id: visitorId } : {};
  payload.event_type = "page_view";
  payload.event_props = {
    path: typeof window !== "undefined" ? window.location.pathname : null,
    search: typeof window !== "undefined" ? window.location.search : null,
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
  };

  try {
    await postJson("/api/visitors/event", payload);
  } catch (e) {
    console.warn("visitor event failed", e && e.body ? e.body : e);
  }
}

// --- Service worker registration (no auto push subscribe here) ---
async function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    console.info("Service worker registered:", reg.scope || reg);
  } catch (e) {
    console.warn("Service worker registration failed:", e && e.message ? e.message : e);
  }
}

// --- Bootstrap logic on first load ---
async function bootstrapAnalyticsAndSW() {
  try {
    const visitorId = await ensureVisitorId();
    if (visitorId) {
      await sendPageView(visitorId);
    } else {
      // if we didn't get a visitorId, option: still send session-based event
      // but we avoid sending null visitor_id (server may reject)
      // If you'd like session-based events, send session_id instead of visitor_id.
    }
  } catch (e) {
    // already logged in helpers
  }

  // register SW *after* initial analytics call, non-blocking
  try {
    await registerServiceWorker();
  } catch {
    // already logged
  }
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
  // If root is missing, log a clear message instead of throwing
  // This can help developers during server-side rendering or dev misconfiguration
  // eslint-disable-next-line no-console
  console.error("React root element '#root' not found — App not mounted.");
}
