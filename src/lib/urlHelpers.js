// src/lib/urlHelpers.js
// Utilities to build absolute URLs for API and assets
// Production-ready: prefers VITE_API_URL / VITE_API_BASE_URL and VITE_UPLOADS_BASE_URL.

const FALLBACK_API = "https://apisprada.exotech.co.in";

/* Supabase storage public base */
const SUPABASE_STORAGE_BASE =
  "https://kwthxsumqqssiywdcexv.supabase.co/storage/v1/object/public";
const SUPABASE_BUCKET = "sprada_storage";

/**
 * Get normalized API base (no trailing slash).
 * Preference order:
 *  1) VITE_API_URL
 *  2) VITE_API_BASE_URL
 *  3) FALLBACK_API
 */
export function getApiBase() {
  const raw =
    (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) ||
    (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim()) ||
    FALLBACK_API;

  return raw.replace(/\/+$/, "");
}

/**
 * Get normalized uploads base (no trailing slash).
 * Preference:
 *  1) VITE_UPLOADS_BASE_URL (if set)
 *  2) <API_BASE>/uploads
 */
export function getUploadsBase() {
  const uploadsRaw = import.meta.env.VITE_UPLOADS_BASE_URL && String(import.meta.env.VITE_UPLOADS_BASE_URL).trim();
  if (uploadsRaw) return uploadsRaw.replace(/\/+$/, "");
  return `${getApiBase()}/uploads`;
}

/**
 * Convert a possibly-relative URL or bare filename into an absolute URL.
 *
 * - Returns null for falsy input.
 * - Leaves absolute http(s) URLs unchanged.
 * - Handles protocol-relative URLs (//cdn...) by prefixing the current protocol (or https: in SSR).
 * - Converts paths starting with /uploads or uploads/ to UPLOADS_BASE + path.
 * - Converts bare filenames (e.g. "img.jpg") or local FS paths that end with an image extension to UPLOADS_BASE/<filename>.
 * - Otherwise prefixes with API base.
 *
 * Examples:
 *   makeAbsoluteUrl('/uploads/x.jpg') -> https://apisprada.exotech.co.in/uploads/x.jpg
 *   makeAbsoluteUrl('uploads/x.jpg')  -> https://apisprada.exotech.co.in/uploads/x.jpg
 *   makeAbsoluteUrl('x.jpg')         -> https://apisprada.exotech.co.in/uploads/x.jpg
 *   makeAbsoluteUrl('https://cdn/x') -> https://cdn/x
 */
export function makeAbsoluteUrl(url) {
  if (!url) return null;
  if (typeof url !== "string") url = String(url);

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Already absolute
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Supabase relative paths
  if (/^(blogs|products|categories)\//i.test(trimmed)) {
    return `${SUPABASE_STORAGE_BASE}/${SUPABASE_BUCKET}/${trimmed}`;
  }

  const apiBase = getApiBase();

  // Legacy uploads (keep for backward compatibility)
  if (/^\/?uploads\//i.test(trimmed)) {
    return `${apiBase}/${trimmed.replace(/^\/+/, "")}`;
  }

  // Fallback
  return `${apiBase}/${trimmed.replace(/^\/+/, "")}`;
}

export default {
  getApiBase,
  getUploadsBase,
  makeAbsoluteUrl,
};
