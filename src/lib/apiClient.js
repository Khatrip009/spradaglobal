// src/lib/apiClient.js
// Lightweight auth client for token-based endpoints
// Uses Vite env: VITE_API_URL or VITE_API_BASE_URL
// Default fallback: https://apisprada.exotech.co.in

const FALLBACK_BACKEND = "https://apisprada.exotech.co.in";

const RAW_BASE =
  (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) ||
  (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim()) ||
  FALLBACK_BACKEND;

export const BASE = String(RAW_BASE).replace(/\/+$/, "");

/** Safe localStorage getter */
function getAccessToken() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

/** Ensure path begins with a single slash */
function normalizePath(path) {
  if (!path) return "/";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

/**
 * request
 * @param {string} path - path or full URL
 * @param {object} options
 *    method, body, headers, skipAuth, timeout (ms), credentials ('include'|'same-origin'|false)
 */
async function request(
  path,
  { method = "GET", body = null, headers = {}, skipAuth = false, timeout = 15000, credentials = "include" } = {}
) {
  // Allow full absolute URLs (if path starts with http)
  const url = /^(https?:)\/\//i.test(path) ? path : `${BASE}${normalizePath(path)}`;

  const init = {
    method,
    headers: { ...headers },
    credentials: credentials === false ? undefined : credentials, // undefined leaves default fetch behavior
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      init.headers["Authorization"] = `Bearer ${token}`;
      // If you're sending cookies + Bearer token together, that's ok; adjust based on your backend
    }
  }

  if (body && !(body instanceof FormData)) {
    init.headers["Content-Type"] = init.headers["Content-Type"] || "application/json";
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  } else if (body instanceof FormData) {
    // let browser set multipart boundary
    init.body = body;
  }

  // Timeout handling with AbortController
  const controller = new AbortController();
  const signal = controller.signal;
  init.signal = signal;

  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, init);
    clearTimeout(id);

    const contentType = res.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (e) {
        // malformed JSON fallback to text
        data = await res.text().catch(() => "");
      }
    } else {
      data = await res.text().catch(() => "");
    }

    if (!res.ok) {
      const err = new Error(
        (data && data.error) || (data && data.message) || res.statusText || `API Error ${res.status}`
      );
      err.status = res.status;
      err.body = data;
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(id);
    if (err && err.name === "AbortError") {
      const e = new Error("timeout");
      e.status = 0;
      e.body = { message: "request_timeout" };
      throw e;
    }

    // network errors or thrown errors with status should be bubbled up
    if (!err.status) {
      const e = new Error("network_error");
      e.status = 0;
      e.body = { message: err.message || String(err) };
      throw e;
    }

    throw err;
  }
}

export default {
  get: (p, opts = {}) => request(p, { ...opts, method: "GET" }),
  post: (p, b, opts = {}) => request(p, { ...opts, method: "POST", body: b }),
  put: (p, b, opts = {}) => request(p, { ...opts, method: "PUT", body: b }),
  del: (p, opts = {}) => request(p, { ...opts, method: "DELETE" }),
  rawRequest: request,
};
