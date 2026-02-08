// src/lib/urlHelpers.js
// Utilities to build absolute URLs for API and assets
// Production-ready and safe for Supabase + legacy uploads

/* ======================================================
   CONSTANTS
====================================================== */

const FALLBACK_API = "https://apisprada.exotech.co.in";

/**
 * Supabase public storage base
 * NOTE:
 *  - Do NOT include bucket name here
 *  - Project ref MUST match backend exactly
 */
const SUPABASE_STORAGE_BASE =
  "https://kwthxsumqqssiywdcevx.supabase.co/storage/v1/object/public";

/** Supabase bucket name */
const SUPABASE_BUCKET = "sprada_storage";

/* ======================================================
   API BASE
====================================================== */

/**
 * Get normalized API base (no trailing slash).
 * Priority:
 *  1) VITE_API_URL
 *  2) VITE_API_BASE_URL
 *  3) FALLBACK_API
 */
export function getApiBase() {
  const raw =
    (import.meta.env.VITE_API_URL &&
      String(import.meta.env.VITE_API_URL).trim()) ||
    (import.meta.env.VITE_API_BASE_URL &&
      String(import.meta.env.VITE_API_BASE_URL).trim()) ||
    FALLBACK_API;

  return raw.replace(/\/+$/, "");
}

/* ======================================================
   UPLOADS BASE
====================================================== */

/**
 * Get normalized uploads base (no trailing slash).
 *
 * Priority:
 *  1) VITE_UPLOADS_BASE_URL (explicit override)
 *  2) <API_BASE>/uploads   (legacy backend uploads)
 */
export function getUploadsBase() {
  const uploadsRaw =
    import.meta.env.VITE_UPLOADS_BASE_URL &&
    String(import.meta.env.VITE_UPLOADS_BASE_URL).trim();

  if (uploadsRaw) {
    return uploadsRaw.replace(/\/+$/, "");
  }

  return `${getApiBase()}/uploads`;
}

/* ======================================================
   URL NORMALIZER
====================================================== */

/**
 * Convert a possibly-relative URL into an absolute URL.
 *
 * Rules:
 * - null / empty → null
 * - Absolute http(s) → returned as-is
 * - Supabase relative paths (products/, blogs/, categories/)
 *   → Supabase public storage URL
 * - uploads/* → legacy uploads base
 * - Bare filename (img.jpg) → uploads base
 * - Everything else → API base
 */
export function makeAbsoluteUrl(url) {
  if (!url) return null;
  if (typeof url !== "string") url = String(url);

  const trimmed = url.trim();
  if (!trimmed) return null;

  /* ---------------------------------------------
     Absolute URLs (Supabase / CDN / External)
  --------------------------------------------- */
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  /* ---------------------------------------------
     Supabase relative storage paths
     e.g. products/x.jpg
  --------------------------------------------- */
  if (/^(products|blogs|categories)\//i.test(trimmed)) {
    return `${SUPABASE_STORAGE_BASE}/${SUPABASE_BUCKET}/${trimmed}`;
  }

  /* ---------------------------------------------
     Legacy uploads paths
     e.g. uploads/x.jpg or /uploads/x.jpg
  --------------------------------------------- */
  if (/^\/?uploads\//i.test(trimmed)) {
    return `${getUploadsBase()}/${trimmed.replace(/^\/?uploads\//, "")}`;
  }

  /* ---------------------------------------------
     Bare image filename
     e.g. x.jpg, image.png
  --------------------------------------------- */
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(trimmed)) {
    return `${getUploadsBase()}/${trimmed}`;
  }

  /* ---------------------------------------------
     Final fallback → API base
  --------------------------------------------- */
  return `${getApiBase()}/${trimmed.replace(/^\/+/, "")}`;
}

/* ======================================================
   EXPORTS
====================================================== */

export default {
  getApiBase,
  getUploadsBase,
  makeAbsoluteUrl,
};
