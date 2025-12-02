// src/main.jsx
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./App.css";
import "./components/ui/toast.css";

// --- API base (do NOT hit :5173 for API in production)
const DEFAULT_API = 'http://localhost:4200';
export const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API).replace(/\/$/, "");

// Vite base URL for assets / service worker (handles GitHub Pages subpaths)
const RAW_BASE_URL = import.meta.env.BASE_URL || "/";
export const BASE_URL = RAW_BASE_URL.replace(/\/$/, "") + "/"; // ends with a single slash

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
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
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

  const text = await res.text().catch(() => "");
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

// --- Visitor registration & analytics (left as you had it) ---
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
    const ip = null;
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
      } catch {}
      return vid;
    }
  } catch (e) {
    console.warn("visitor identify failed", e && e.body ? e.body : e);
  }

  return null;
}

async function sendPageView(visitorId) {
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

async function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    // register relative to BASE_URL so it works on project subpaths (GitHub Pages)
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
  } catch (e) {}

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
