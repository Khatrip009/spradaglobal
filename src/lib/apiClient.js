// src/lib/apiClient.js
// Lightweight, production-safe API client for token-based endpoints
// Env priority: VITE_API_URL → VITE_API_BASE_URL → fallback

/* ======================================================
   CONFIG
====================================================== */

const FALLBACK_BACKEND = "https://apisprada.exotech.co.in";

const RAW_BASE =
  (import.meta.env.VITE_API_URL &&
    String(import.meta.env.VITE_API_URL).trim()) ||
  (import.meta.env.VITE_API_BASE_URL &&
    String(import.meta.env.VITE_API_BASE_URL).trim()) ||
  FALLBACK_BACKEND;

/** Normalized API base (no trailing slash) */
export const BASE = String(RAW_BASE).replace(/\/+$/, "");

/* ======================================================
   TOKEN HANDLING
====================================================== */

/** Safe accessToken getter (SSR-safe) */
function getAccessToken() {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage?.getItem("accessToken") || null;
  } catch {
    return null;
  }
}

/* ======================================================
   PATH HELPERS
====================================================== */

/** Normalize relative API paths */
function normalizePath(path) {
  if (!path) return "/";
  if (/^https?:\/\//i.test(path)) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

/* ======================================================
   CORE REQUEST
====================================================== */

/**
 * request()
 *
 * @param {string} path - API path or full absolute URL
 * @param {object} options
 *   method        HTTP method
 *   body          Request body
 *   headers       Custom headers
 *   skipAuth      Disable Authorization header
 *   timeout       Timeout in ms (default 15s)
 *   credentials   'include' | 'same-origin' | 'omit'
 */
async function request(
  path,
  {
    method = "GET",
    body = null,
    headers = {},
    skipAuth = false,
    timeout = 15000,
    credentials = "include",
  } = {}
) {
  const url = /^https?:\/\//i.test(path)
    ? path
    : `${BASE}${normalizePath(path)}`;

  const init = {
    method,
    headers: { ...headers },
    credentials,
  };

  /* ---------------------------------------------
     Auth header
  --------------------------------------------- */
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      init.headers.Authorization = `Bearer ${token}`;
    }
  }

  /* ---------------------------------------------
     Body handling
  --------------------------------------------- */
  if (body != null) {
    if (body instanceof FormData) {
      init.body = body; // browser sets boundary
    } else {
      init.headers["Content-Type"] =
        init.headers["Content-Type"] || "application/json";
      init.body = typeof body === "string" ? body : JSON.stringify(body);
    }
  }

  /* ---------------------------------------------
     Timeout handling
  --------------------------------------------- */
  const controller = new AbortController();
  init.signal = controller.signal;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, init);
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    } else {
      data = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const error = new Error(
        (data && data.error) ||
          (data && data.message) ||
          res.statusText ||
          `API Error ${res.status}`
      );
      error.status = res.status;
      error.body = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err?.name === "AbortError") {
      const e = new Error("request_timeout");
      e.status = 0;
      e.body = { message: "request_timeout" };
      throw e;
    }

    if (!err?.status) {
      const e = new Error("network_error");
      e.status = 0;
      e.body = { message: err?.message || String(err) };
      throw e;
    }

    throw err;
  }
}

/* ======================================================
   PUBLIC API
====================================================== */

export default {
  get: (path, opts = {}) =>
    request(path, { ...opts, method: "GET" }),

  post: (path, body, opts = {}) =>
    request(path, { ...opts, method: "POST", body }),

  put: (path, body, opts = {}) =>
    request(path, { ...opts, method: "PUT", body }),

  del: (path, opts = {}) =>
    request(path, { ...opts, method: "DELETE" }),

  rawRequest: request,
};
