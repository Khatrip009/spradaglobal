// src/main.jsx
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";
import "./App.css";
import "./components/ui/toast.css";

// --- CONFIG / default hosts (include protocol on defaults) ---
const PROD_API = "http://localhost:4200";
const DEV_LOCAL_DEFAULT = "http://localhost:4200";

// Allow env override (Vite) - keep raw so we normalize below
const ENV_API_RAW = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// --- Vite base URL for GitHub Pages ---
const BASE_URL = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") + "/";

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

/* ---------------------------
   Helpers: normalize host to include protocol
   - If user provided "localhost:4200" or "apisprada.exotech.co.in" we add http:// by default.
   - If it already starts with http/https we keep it.
----------------------------*/
function normalizeHost(h) {
  if (!h) return null;
  const s = String(h).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s.replace(/\/+$/, ""); // already has protocol
  // default to http for local/dev hosts; keep https for prod if explicit
  return `http://${s}`.replace(/\/+$/, "");
}

/* -----------------------------------------------------------
   Quick probe helper (short timeout) — uses full URL with protocol
------------------------------------------------------------ */
async function probeUrl(url, timeout = 1200) {
  const u = url.replace(/\/$/, "");
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    // probe a lightweight public endpoint; treat any HTTP response as "reachable"
    const res = await fetch(`${u}/api/products?limit=1`, { method: "GET", mode: "cors", signal: controller.signal });
    clearTimeout(id);
    return !!res;
  } catch (err) {
    clearTimeout(id);
    return false;
  }
}

/* -----------------------------------------------------------
   Resolve API BASE:
   - Preference order:
     1) env override (VITE_API_URL/VITE_API_BASE_URL)
     2) if running on localhost try dev local (http://localhost:4200)
     3) fallback to production (https://apisprada.exotech.co.in)
   - Ensures the returned base always includes protocol and no trailing slash
   - Caches result in window.__API_BASE__ for session
------------------------------------------------------------ */
async function resolveApiBase() {
  if (typeof window !== "undefined" && window.__API_BASE__) return window.__API_BASE__;

  // 1) env override (normalize)
  const envRaw = ENV_API_RAW || "";
  if (envRaw) {
    const normalized = normalizeHost(envRaw);
    if (typeof window !== "undefined") window.__API_BASE__ = normalized;
    return normalized;
  }

  // 2) try local when running on localhost
  let chosen = normalizeHost(PROD_API); // default fallback is prod with protocol
  const localCandidate = normalizeHost(DEV_LOCAL_DEFAULT);

  try {
    const isLocalHost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (isLocalHost) {
      const ok = await probeUrl(localCandidate, 1000);
      chosen = ok ? localCandidate : normalizeHost(PROD_API);
    } else {
      // not on localhost: prefer production if reachable quickly; else try local as fallback
      const okProd = await probeUrl(normalizeHost(PROD_API), 800);
      if (okProd) chosen = normalizeHost(PROD_API);
      else {
        const okLocal = await probeUrl(localCandidate, 700);
        chosen = okLocal ? localCandidate : normalizeHost(PROD_API);
      }
    }
  } catch (err) {
    chosen = normalizeHost(PROD_API);
  }

    if (typeof window !== "undefined") {
    // show which API host was chosen (dev helpful)
    console.info('[api] resolved API base ->', chosen);
    window.__API_BASE__ = chosen;
  }
  return chosen;

}

/* -----------------------------------------------------------
   Safe URL builder: ensures we produce valid full URL strings
   - base (must already be normalized to include protocol and no trailing slash)
   - path may start with or without '/'
------------------------------------------------------------ */
function buildFullUrl(base, path) {
  if (!base) return path;
  const b = String(base).replace(/\/$/, "");
  const p = String(path || "");
  if (p.startsWith("/")) return `${b}${p}`;
  return `${b}/${p}`;
}

/* -----------------------------------------------------------
   HTTP helper (postJson) — will call resolveApiBase() and build proper URL
------------------------------------------------------------ */
async function postJson(path, body) {
  const base = await resolveApiBase();
  const url = buildFullUrl(base, path);

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
    err.body = { message: networkErr.message || String(networkErr) };
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

/* -----------------------------------------------------------
   Analytics: visitor id + page view
------------------------------------------------------------ */
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
    const meta = { source: "sprada-fe", first_path: window.location.pathname };

    const json = await postJson("/api/visitors/identify", {
      session_id: sessionId,
      ip: null,
      ua,
      meta,
    });

    const vid = json?.visitor_id || json?.visitorId || json?.id || null;
    if (vid) {
      try { localStorage.setItem(LS_VISITOR_ID, vid); } catch {}
      return vid;
    }
  } catch (e) {
    console.warn("visitor identify failed", e.body || e);
  }

  return null;
}

async function sendPageView(visitorId) {
  const payload = visitorId ? { visitor_id: visitorId } : {};
  payload.event_type = "page_view";
  payload.event_props = {
    path: window.location.pathname,
    search: window.location.search,
    referrer: document.referrer || null,
  };

  try {
    await postJson("/api/visitors/event", payload);
  } catch (e) {
    console.warn("visitor event failed", e.body || e);
  }
}

/* -----------------------------------------------------------
   Service worker registration
------------------------------------------------------------ */
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const swPath = `${BASE_URL}sw.js`;
    const reg = await navigator.serviceWorker.register(swPath);
    console.info("Service worker registered:", reg.scope || reg);
  } catch (e) {
    console.warn("SW registration failed:", e);
  }
}

async function bootstrapAnalyticsAndSW() {
  try {
    const visitorId = await ensureVisitorId();
    if (visitorId) await sendPageView(visitorId);
  } catch {}

  try {
    await registerServiceWorker();
  } catch {}
}

// Run bootstrap
if (document.readyState === "complete" || document.readyState === "interactive") {
  bootstrapAnalyticsAndSW();
} else {
  window.addEventListener("DOMContentLoaded", bootstrapAnalyticsAndSW, { once: true });
}

// Render React
const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("React root '#root' not found.");
}
