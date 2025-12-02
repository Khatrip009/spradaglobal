// src/lib/urlHelpers.js
// Utility to make image URLs absolute using VITE_API_URL or default backend.

export function getApiBase() {
  // prefer explicit env, fallback same default used by api.js
  return (import.meta.env.VITE_API_URL || 'http://localhost:4200').replace(/\/+$/, '');
}

/**
 * Convert a URL that might be relative (/uploads/...) or bare filename
 * into an absolute URL using the API base. If the url is already absolute,
 * return it unchanged.
 *
 * Examples:
 *   /uploads/img.jpg -> http://localhost:4200/uploads/img.jpg
 *   uploads/img.jpg  -> http://localhost:4200/uploads/img.jpg
 *   https://cdn/x.png -> https://cdn/x.png
 */
export function makeAbsoluteUrl(url) {
  if (!url) return null;
  if (typeof url !== 'string') return String(url);

  const trimmed = url.trim();
  if (!trimmed) return null;

  // already absolute
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = getApiBase();

  // leading slash -> base + path
  if (trimmed.startsWith('/')) return `${base}${trimmed}`;

  // otherwise just join with slash
  return `${base}/${trimmed}`;
}
