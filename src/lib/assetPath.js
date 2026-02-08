// src/lib/assetPath.js
// Safe asset resolver for Vite (supports base path, CDN, absolute URLs)

export function assetPath(path) {
  if (!path) return "";

  const p = String(path).trim();
  if (!p) return "";

  /* ---------------------------------------------
     Absolute URLs (http, https)
  --------------------------------------------- */
  if (/^https?:\/\//i.test(p)) {
    return p;
  }

  /* ---------------------------------------------
     Protocol-relative URLs (//cdn...)
  --------------------------------------------- */
  if (p.startsWith("//")) {
    return p;
  }

  /* ---------------------------------------------
     Vite base URL (guaranteed trailing slash)
  --------------------------------------------- */
  const base = import.meta.env.BASE_URL || "/";

  /* ---------------------------------------------
     Avoid double-prefixing base path
  --------------------------------------------- */
  if (p.startsWith(base)) {
    return p;
  }

  /* ---------------------------------------------
     Normalize slashes and join
  --------------------------------------------- */
  return `${base}${p.replace(/^\/+/, "")}`;
}

export default assetPath;
