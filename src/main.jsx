// src/main.jsx
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";
import "./App.css";
import "./components/ui/toast.css";

// --- API base ---
const DEFAULT_API = "https://apisprada.exotech.co.in";
const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API).replace(/\/$/, "");

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
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

// --- HTTP helper ---
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

// --- Analytics: visitor id + page view ---
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
      localStorage.setItem(LS_VISITOR_ID, vid);
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

// --- Service worker registration ---
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
