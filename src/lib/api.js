// src/lib/api.js
// API helpers for the frontend (credentials included)
// Backend base is controlled ONLY by .env → VITE_API_URL

const FALLBACK_BACKEND = "http://localhost:4200";

const SUPABASE_STORAGE_BASE =
  "https://kwthxsumqqssiywdcexv.supabase.co/storage/v1/object/public";
/* -----------------------------------------------------
   BASE URL
----------------------------------------------------- */

const RAW_BASE =
  (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) ||
  (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim()) ||
  FALLBACK_BACKEND;

export const BASE = RAW_BASE.replace(/\/+$/, "");

// Legacy uploads base (ONLY for backward compatibility)
const UPLOADS_BASE = `${BASE}/uploads`;

const DEFAULT_TIMEOUT = 15000;


/* -----------------------------------------------------
   IMAGE URL NORMALIZER (SAFE FOR SUPABASE)
----------------------------------------------------- */

/**
 * Converts stored image path to a usable public URL
 *
 * Stored in DB as:
 *   blogs/filename.jpg
 *   products/filename.webp
 *
 * Returns:
 *   https://<project>.supabase.co/storage/v1/object/public/sprada_storage/...
 */
export function toAbsoluteImageUrl(path) {
  if (!path) return null;

  // already absolute
  if (path.startsWith("http")) return path;

  // normalize (remove accidental leading slash)
  const clean = path.replace(/^\/+/, "");

  return `${SUPABASE_STORAGE_BASE}/sprada_storage/${clean}`;
}

/* -----------------------------------------------------
   REQUEST CORE
----------------------------------------------------- */

export async function request(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const timeout = typeof opts.timeout === "number" ? opts.timeout : DEFAULT_TIMEOUT;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers || {})
      },
      signal: controller.signal,
      ...opts
    });

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
  } catch (err) {
    if (err.name === "AbortError") {
      const e = new Error("timeout");
      e.status = 0;
      throw e;
    }
    if (!err.status) {
      const e = new Error("network_error");
      e.status = 0;
      e.body = { message: err.message || String(err) };
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

/* -----------------------------------------------------
   URL BUILDER
----------------------------------------------------- */

export function buildUrl(path, qs = {}) {
  const url = `${BASE}${path}`;
  const params = new URLSearchParams();
  Object.entries(qs || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, String(v));
  });
  return params.toString() ? `${url}?${params}` : url;
}

/* -----------------------------------------------------
   HTTP HELPERS
----------------------------------------------------- */

export const apiGet = (path, qs = {}, opts = {}) =>
  request(buildUrl(path, qs), { method: "GET", ...opts });

export const apiPost = (path, body = {}, opts = {}) =>
  request(path, { method: "POST", body: JSON.stringify(body), ...opts });

export const apiPut = (path, body = {}, opts = {}) =>
  request(path, { method: "PUT", body: JSON.stringify(body), ...opts });

export const apiDelete = (path, body = null, opts = {}) =>
  request(path, { method: "DELETE", ...(body ? { body: JSON.stringify(body) } : {}), ...opts });

/* -----------------------------------------------------
   CACHE
----------------------------------------------------- */

const _cache = {
  home: { ts: 0, ttl: 60000, data: null },
  pushPublicKey: { ts: 0, ttl: 600000, data: null }
};

function cacheGet(key) {
  const c = _cache[key];
  if (!c) return null;
  if (Date.now() - c.ts < c.ttl) return c.data;
  return null;
}
function cacheSet(key, value) {
  if (!_cache[key]) return;
  _cache[key].data = value;
  _cache[key].ts = Date.now();
}

/* -----------------------------------------------------
   HOME / META
----------------------------------------------------- */

export async function getHome() {
  const cached = cacheGet("home");
  if (cached) return cached;
  const data = await apiGet("/api/home");
  cacheSet("home", data);
  return data;
}

export async function getPushPublicKey() {
  const cached = cacheGet("pushPublicKey");
  if (cached) return cached;
  const data = await apiGet("/api/push/public");
  cacheSet("pushPublicKey", data);
  return data;
}

/* -----------------------------------------------------
   PRODUCTS
----------------------------------------------------- */

export async function getProducts(opts = {}) {
  const r = await apiGet("/api/products", opts);
  return {
    products: r.products || r.items || [],
    page: r.page || 1,
    limit: r.limit || null,
    total: r.total ?? null,
    total_pages: r.total_pages ?? null
  };
}

export async function getProductBySlug(slug) {
  const r = await apiGet(`/api/products/${encodeURIComponent(slug)}`);
  return r.product || r;
}

export async function getProductImages(productId) {
  if (!productId) throw new Error("missing_product_id");
  const r = await apiGet("/api/product-images", { product_id: productId });
  return r.items || r.images || r || [];
}

/* -----------------------------------------------------
   CATEGORIES
----------------------------------------------------- */

export async function getCategories(opts = {}) {
  const r = await apiGet("/api/categories", opts);
  return r.categories || r || [];
}

export async function getCategoryById(id) {
  const r = await apiGet(`/api/categories/${encodeURIComponent(id)}`);
  return r.category || r;
}

export async function getProductsByCategorySlug(slug, opts = {}) {
  return getProducts({ ...opts, category_slug: slug });
}

/* -----------------------------------------------------
   REVIEWS
----------------------------------------------------- */

export async function getReviews(opts = {}) {
  const r = await apiGet("/api/reviews", opts);
  return r.reviews || r.items || r || [];
}

export async function getReviewsFor(about_type, about_id, opts = {}) {
  return apiGet("/api/reviews", { about_type, about_id, ...opts });
}

export async function postReviewHelpful(reviewId, payload = {}) {
  return apiPost(`/api/reviews/${encodeURIComponent(reviewId)}/helpful`, payload);
}

export async function getReviewStats() {
  return apiGet("/api/reviews/stats");
}

/* -----------------------------------------------------
   BLOGS
----------------------------------------------------- */

function normalizeCategory(cat) {
  if (!cat) return null;
  if (typeof cat === "string") return { name: cat };
  return {
    id: cat.id || null,
    name: cat.name || cat.slug || null
  };
}

function normalizeBlogImages(b) {
  if (!b) return b;

  ["image", "thumbnail", "og_image"].forEach(k => {
    if (b[k]) b[k] = toAbsoluteImageUrl(b[k]);
  });

  if (b.author?.avatar) {
    b.author.avatar = toAbsoluteImageUrl(b.author.avatar);
  }

  if (Array.isArray(b.images)) {
    b.images = b.images.map(i => ({
      ...i,
      url: toAbsoluteImageUrl(i.url)
    }));
  }

  return b;
}

export async function getBlogs(opts = {}) {
  const r = await apiGet("/api/blogs", opts);
  const blogs = r.blogs || r.items || [];
  return {
    blogs: blogs.map(b => normalizeBlogImages({ ...b, category: normalizeCategory(b.category) })),
    total: r.total ?? blogs.length,
    page: r.page || 1,
    limit: r.limit || blogs.length
  };
}

export async function getBlogBySlug(slug) {
  const r = await apiGet(`/api/blogs/${encodeURIComponent(slug)}`);
  return normalizeBlogImages(r.blog || r);
}

export async function likeBlog(blogId) {
  return apiPost(`/api/blogs/${encodeURIComponent(blogId)}/like`, {});
}

export async function getLikes(blogId) {
  return apiGet(`/api/blogs/${encodeURIComponent(blogId)}/likes`);
}

export async function postComment(blogId, payload) {
  return apiPost(`/api/blogs/${encodeURIComponent(blogId)}/comments`, payload);
}

export async function getComments(blogId) {
  const r = await apiGet(`/api/blogs/${encodeURIComponent(blogId)}/comments`);
  return r.comments || r.items || r || [];
}

/* -----------------------------------------------------
   VISITORS / METRICS
----------------------------------------------------- */

export async function postVisitorIdentify(sessionId, payload = {}) {
  return apiPost("/api/visitors/identify", { session_id: sessionId, ...payload });
}

export async function postVisitorEvent(visitorId, eventType, eventProps = {}) {
  return apiPost("/api/visitors/event", { visitor_id: visitorId, event_type: eventType, event_props: eventProps });
}

export async function getMetricsVisitorsSummary() {
  return apiGet("/api/metrics/visitors/summary");
}

/* -----------------------------------------------------
   AUTH / USERS
----------------------------------------------------- */

export const signUp = payload => apiPost("/api/auth/signup", payload);
export const login = payload => apiPost("/api/auth/login", payload);
export const getCurrentUser = () => apiGet("/api/users/me");
export const getUsers = opts => apiGet("/api/users", opts);

/* -----------------------------------------------------
   DEFAULT EXPORT
----------------------------------------------------- */

export default {
  BASE,
  request,
  buildUrl,

  apiGet,
  apiPost,
  apiPut,
  apiDelete,

  getHome,
  getPushPublicKey,

  getProducts,
  getProductBySlug,
  getProductImages,
  getProductsByCategorySlug,

  getCategories,
  getCategoryById,

  getReviews,
  getReviewsFor,
  postReviewHelpful,
  getReviewStats,

  getBlogs,
  getBlogBySlug,
  likeBlog,
  getLikes,
  postComment,
  getComments,

  postVisitorIdentify,
  postVisitorEvent,
  getMetricsVisitorsSummary,

  signUp,
  login,
  getCurrentUser,
  getUsers
};
