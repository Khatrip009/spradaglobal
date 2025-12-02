// src/lib/api.js
// API helpers for the frontend (uses credentials: include)
// Default backend: http://localhost:4200

const DEFAULT_BACKEND = 'https://apisprada.exotech.co.in';
const RAW_BASE = (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL)) || DEFAULT_BACKEND;
export const BASE = RAW_BASE.replace(/\/+$/, ''); // remove trailing slash
// Optional uploads base for rewritten uploads paths. Allow env override.
export const UPLOADS_BASE = ((import.meta.env.VITE_UPLOADS_BASE_URL || '') || (BASE + '/uploads')).replace(/\/+$/, '');
const DEFAULT_TIMEOUT = 15000; // ms

/* -----------------------------------------------------
   IN-MEMORY CACHE (very lightweight)
----------------------------------------------------- */
const _cache = {
  home: { ts: 0, ttl: 60000, data: null }, // 60 seconds
  pushPublicKey: { ts: 0, ttl: 600000, data: null } // 10 minutes
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
   URL BUILDER
----------------------------------------------------- */
export function buildUrl(path, qs = {}) {
  const url = `${BASE}${path}`;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(qs || {})) {
    if (v === undefined || v === null) continue;
    params.set(k, String(v));
  }
  return params.toString() ? `${url}?${params.toString()}` : url;
}

export async function request(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const timeout = typeof opts.timeout === 'number' ? opts.timeout : DEFAULT_TIMEOUT;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(opts.headers || {})
      },
      signal: controller.signal,
      ...opts
    });

    const text = await res.text().catch(() => '');
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
    if (err.name === 'AbortError') {
      const e = new Error('timeout');
      e.status = 0;
      e.body = { message: 'request_timeout' };
      throw e;
    }

    if (!err.status) {
      const e = new Error('network_error');
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
   Convenience Helpers (NEW)
----------------------------------------------------- */

export async function apiGet(path, qs = {}, opts = {}) {
  const url = (qs && Object.keys(qs).length) ? buildUrl(path, qs) : path;
  return await request(url, { method: 'GET', ...opts });
}

export async function apiPost(path, body = {}, opts = {}) {
  return await request(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...opts
  });
}

export async function apiPut(path, body = {}, opts = {}) {
  return await request(path, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...opts
  });
}

export async function apiDelete(path, body = null, opts = {}) {
  const payload = body ? { body: JSON.stringify(body) } : {};
  return await request(path, {
    method: 'DELETE',
    ...payload,
    ...opts
  });
}

/* -----------------------------------------------------
   HOME API (cached)
----------------------------------------------------- */
export async function getHome() {
  const cached = cacheGet('home');
  if (cached) return cached;

  const data = await apiGet('/api/home');
  cacheSet('home', data);
  return data;
}

/* -----------------------------------------------------
   PUSH PUBLIC KEY (cached)
----------------------------------------------------- */
export async function getPushPublicKey() {
  const cached = cacheGet('pushPublicKey');
  if (cached) return cached;

  const data = await apiGet('/api/push/public');
  cacheSet('pushPublicKey', data);
  return data;
}

/* -----------------------------------------------------
   PRODUCTS
   Backend endpoints:
     - GET /api/products?category_slug=...&page=&limit=&q=&trade_type=&order=
     - GET /api/products/:slug
----------------------------------------------------- */
export async function getProducts(opts = {}) {
  const qs = {};
  if (opts.page) qs.page = opts.page;
  if (opts.limit) qs.limit = opts.limit;
  if (opts.q) qs.q = opts.q;
  if (opts.category_id) qs.category_id = opts.category_id;
  if (opts.category_slug) qs.category_slug = opts.category_slug;
  if (opts.trade_type) qs.trade_type = opts.trade_type;
  if (opts.order) qs.order = opts.order;

  const r = await apiGet('/api/products', qs);
  // backend returns { products, page, limit, total, total_pages } usually
  return {
    products: r.products || r.items || [],
    page: r.page || opts.page || 1,
    limit: r.limit || opts.limit || (Array.isArray(r.products) ? r.products.length : null),
    total: r.total ?? r.total_count ?? null,
    total_pages: r.total_pages ?? null
  };
}

export async function getProductBySlug(slug) {
  const r = await apiGet(`/api/products/${encodeURIComponent(slug)}`);
  return r.product || r;
}

/* -----------------------------------------------------
   CATEGORIES
   Backend endpoints:
     - GET /api/categories?include_counts=true&page=&limit=&q=&trade_type=
     - GET /api/categories/:id
----------------------------------------------------- */
export async function getCategories(opts = {}) {
  const qs = {};
  if (opts.page) qs.page = opts.page;
  if (opts.limit) qs.limit = opts.limit;
  if (opts.q) qs.q = opts.q;
  if (opts.include_counts) qs.include_counts = opts.include_counts;
  if (opts.trade_type) qs.trade_type = opts.trade_type;

  const r = await apiGet('/api/categories', qs);

  // server returns { categories, page, limit, total, total_pages } when paginated
  if (Array.isArray(r)) {
    return { categories: r, page: opts.page || 1, limit: opts.limit || r.length, total: null, total_pages: null };
  }

  return {
    categories: r.categories || [],
    page: r.page || opts.page || 1,
    limit: r.limit || opts.limit || (Array.isArray(r.categories) ? r.categories.length : null),
    total: r.total ?? null,
    total_pages: r.total_pages ?? null
  };
}

export async function getCategoryById(id) {
  if (!id) throw new Error('missing_category_id');
  const r = await apiGet(`/api/categories/${encodeURIComponent(id)}`);
  return r.category || r;
}

/* -----------------------------------------------------
   Convenience: products by category slug
   Uses /api/products?category_slug=...
----------------------------------------------------- */
export async function getProductsByCategorySlug(slug, opts = {}) {
  const qs = {};
  if (!slug) throw new Error('missing_category_slug');
  qs.category_slug = slug;
  if (opts.page) qs.page = opts.page;
  if (opts.limit) qs.limit = opts.limit;
  if (opts.q) qs.q = opts.q;
  if (opts.trade_type) qs.trade_type = opts.trade_type;
  if (opts.order) qs.order = opts.order;

  const r = await apiGet('/api/products', qs);
  return {
    products: r.products || r.items || [],
    page: r.page || opts.page || 1,
    limit: r.limit || opts.limit || (Array.isArray(r.products) ? r.products.length : null),
    total: r.total ?? null,
    total_pages: r.total_pages ?? null,
    category: { slug }
  };
}

/* -----------------------------------------------------
   VISITORS
----------------------------------------------------- */
export async function postVisitorIdentify(sessionId, ip = null, ua = null, meta = {}) {
  return await apiPost('/api/visitors/identify', { session_id: sessionId, ip, ua, meta });
}

export async function postVisitorEvent(visitorId, eventType, eventProps = {}) {
  const payload = { event_type: eventType, event_props: eventProps };
  if (visitorId) payload.visitor_id = visitorId;
  return await apiPost('/api/visitors/event', payload);
}

/* -----------------------------------------------------
   REVIEWS
----------------------------------------------------- */
export async function getReviews(opts = {}) {
  const qs = {};
  if (opts.limit) qs.limit = opts.limit;
  if (opts.page) qs.page = opts.page;
  const r = await apiGet('/api/reviews', qs);
  if (!r) return [];
  if (Array.isArray(r)) return r;
  if (Array.isArray(r.reviews)) return r.reviews;
  return r.data?.reviews || [];
}

export async function getReviewStats() {
  return await apiGet('/api/reviews/stats');
}

/* -----------------------------------------------------
   BLOGS
----------------------------------------------------- */
function normalizeCategory(cat) {
  if (!cat) return null;
  if (typeof cat === "string") return { name: cat };
  if (typeof cat === "object") {
    return {
      id: cat.id || null,
      name: cat.name || cat.slug || cat.title || null
    };
  }
  return null;
}

export async function getBlogs(opts = {}) {
  const qs = {};
  if (opts.q) qs.q = opts.q;
  if (opts.page) qs.page = opts.page;
  if (opts.limit) qs.limit = opts.limit;

  const r = await apiGet('/api/blogs', qs);

  // CASE A: backend returned array
  if (Array.isArray(r)) {
    return {
      blogs: r.map(b => ({
        ...b,
        category: normalizeCategory(b.category)
      })),
      total: r.length,
      page: opts.page || 1,
      limit: opts.limit || r.length
    };
  }

  // CASE B: backend returned { blogs: [...], total, ... }
  const blogs = r.blogs || r.items || [];

  return {
    blogs: blogs.map(b => ({
      ...b,
      category: normalizeCategory(b.category)
    })),
    total: r.total ?? r.total_count ?? blogs.length ?? null,
    page: r.page || opts.page || 1,
    limit: r.limit || opts.limit || blogs.length || null
  };
}

export async function getBlogBySlug(slug) {
  if (!slug || typeof slug !== "string") return null;

  try {
    const r = await apiGet(`/api/blogs/${encodeURIComponent(slug)}`);
    const blog = r.blog || r;

    if (!blog) return null;

    return {
      ...blog,
      category: normalizeCategory(blog.category)
    };
  } catch {
    // Fallback: search by q=slug
    try {
      const fallback = await apiGet('/api/blogs', { q: slug, limit: 1 });

      let b = null;

      if (Array.isArray(fallback) && fallback.length) b = fallback[0];
      else if (fallback.blogs?.length) b = fallback.blogs[0];

      if (!b) return null;

      return {
        ...b,
        category: normalizeCategory(b.category)
      };
    } catch {
      return null;
    }
  }
}
/**
 * Toggle like for a blog post.
 * Calls POST /api/blogs/:id/like
 * Normalizes response to include:
 *   - blog_id
 *   - likes (number|null)
 *   - user_liked (boolean|null)  // true when the action results in a 'liked' message, false when 'unliked'
 */
export async function likeBlog(blogId) {
  if (!blogId) throw new Error("missing_blog_id");

  const r = await apiPost(`/api/blogs/${encodeURIComponent(blogId)}/like`, {});

  // router currently returns { ok: true, message: 'liked'|'unliked', likes_count: N }
  return {
    blog_id: blogId,
    ok: r.ok ?? true,
    message: r.message ?? null,
    likes: (r.likes_count ?? r.likes ?? r.total_likes) != null
      ? Number(r.likes_count ?? r.likes ?? r.total_likes)
      : null,
    user_liked:
      // try explicit flag first, otherwise infer from message
      (typeof r.user_liked === "boolean" ? r.user_liked : null) ??
      (r.message ? r.message === "liked" : null)
  };
}

/**
 * Get likes for a blog post.
 * Tries GET /api/blogs/:id/likes first (newer route that may return user_liked),
 * falls back to GET /api/blogs/:id/count (public count-only) when /likes is not available.
 *
 * Normalized return:
 *   - blog_id
 *   - likes (number)
 *   - user_liked (boolean)  // false when not provided by server
 */
export async function getLikes(blogId) {
  if (!blogId) throw new Error("missing_blog_id");

  const id = encodeURIComponent(blogId);

  // Try the richer /likes endpoint first for compatibility (may return user_liked)
  try {
    const r = await apiGet(`/api/blogs/${id}/likes`);
    return {
      blog_id: blogId,
      likes: Number(r.likes ?? r.total_likes ?? r.likes_count ?? 0),
      user_liked: Boolean(r.user_liked ?? false)
    };
  } catch (err) {
    // If /likes doesn't exist (404 / not_found) — fallback to count endpoint.
    // Many api helpers throw an Error object — try to detect not-found conservatively.
    const isNotFound =
      err && (err.status === 404 || err.message === "not_found" || /not found/i.test(err.message || ""));

    if (!isNotFound) {
      // rethrow other errors (network/server) so caller can handle them
      throw err;
    }

    // Fallback to public count endpoint
    const r2 = await apiGet(`/api/blogs/${id}/count`);
    return {
      blog_id: blogId,
      likes: Number(r2.likes_count ?? r2.likes ?? 0),
      user_liked: false // can't know from count-only endpoint
    };
  }
}


export async function postComment(
  blogId,
  { body, rating = null, name = null, email = null, publish = false } = {}
) {
  if (!blogId) throw new Error("missing_blog_id");
  if (!body) throw new Error("missing_body");

  const r = await apiPost(`/api/blogs/${encodeURIComponent(blogId)}/comments`, {
    body,
    rating,
    name,
    email,
    publish
  });

  return {
    comment: r.comment || r,
    ok: r.ok ?? true
  };
}

export async function getComments(blogId) {
  if (!blogId) throw new Error("missing_blog_id");

  const r = await apiGet(`/api/blogs/${encodeURIComponent(blogId)}/comments`);

  if (Array.isArray(r)) return r;

  return r.comments || r.items || [];
}

/* -----------------------------------------------------
   PUSH NOTIFICATIONS
----------------------------------------------------- */
export async function postPushSubscribe(visitorId, subscription, browser) {
  return await apiPost('/api/push/subscribe', { visitor_id: visitorId, subscription, browser });
}

export async function getPushList(opts = {}) {
  return await apiGet('/api/push/list', opts);
}

/* -----------------------------------------------------
   METRICS
----------------------------------------------------- */
export async function getMetricsVisitorsSummary() {
  return await apiGet('/api/metrics/visitors/summary');
}

/* -----------------------------------------------------
   OTHER / ADMIN endpoints (helpers you may use)
----------------------------------------------------- */
export async function signUp(payload) {
  return await apiPost('/api/auth/signup', payload);
}
export async function login(payload) {
  return await apiPost('/api/auth/login', payload);
}
export async function getCurrentUser() {
  return await apiGet('/api/users/me');
}
export async function getUsers(opts = {}) {
  return await apiGet('/api/users', opts);
}

/* -----------------------------------------------------
   DEFAULT EXPORT (backwards compatible)
----------------------------------------------------- */
export default {
  request,
  buildUrl,
  BASE,
  getHome,
  getPushPublicKey,

  getProducts,
  getProductBySlug,
  getCategories,
  getCategoryById,
  getProductsByCategorySlug,

  postVisitorIdentify,
  postVisitorEvent,

  getReviews,
  getReviewStats,

  getBlogs,
  getBlogBySlug,
  likeBlog,
  getLikes,
  postComment,
  getComments,

  postPushSubscribe,
  getPushList,
  getMetricsVisitorsSummary,

  // NEW
  apiGet,
  apiPost,
  apiPut,
  apiDelete,

  // convenience auth/admin helpers
  signUp,
  login,
  getCurrentUser,
  getUsers
};
