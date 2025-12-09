// src/lib/urlHelpers.js
// Utilities to build absolute URLs for API and assets
// Production-ready: prefers VITE_API_URL / VITE_API_BASE_URL and VITE_UPLOADS_BASE_URL.

const FALLBACK_API = "https://apisprada.exotech.co.in";

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

  return String(raw).replace(/\/+$/, "");
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

  // Already absolute (http / https)
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Protocol-relative URLs (//cdn.example.com/...)
  if (/^\/\//.test(trimmed)) {
    const proto = typeof window !== "undefined" && window.location && window.location.protocol
      ? window.location.protocol
      : "https:";
    return `${proto}${trimmed}`;
  }

  const apiBase = getApiBase();
  const uploadsBase = getUploadsBase();

  // If it's a server-root uploads path: /uploads/...
  if (/^\/(?:src\/)?uploads\//i.test(trimmed)) {
    return `${uploadsBase}${trimmed.replace(/^\/+/, "/")}`;
  }

  // Relative uploads path: uploads/...
  if (/^(?:src\/)?uploads\//i.test(trimmed)) {
    return `${uploadsBase}/${trimmed.replace(/^\/+/, "")}`;
  }

  // Local filesystem stray path or bare filename with image extension -> map to uploads base
  // Matches ".../filename.ext" or "filename.ext"
  const fileMatch = trimmed.match(/([^\\/]+)\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i);
  if (fileMatch) {
    const filename = fileMatch[0];
    return `${uploadsBase}/${encodeURIComponent(filename)}`;
  }

  // If it starts with a slash (non-uploads), prefix with API base
  if (trimmed.startsWith("/")) {
    return `${apiBase}${trimmed}`;
  }

  // Default: join with API base
  return `${apiBase}/${trimmed}`;
}

export default {
  getApiBase,
  getUploadsBase,
  makeAbsoluteUrl,
};
