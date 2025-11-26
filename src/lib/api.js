// src/lib/api.js
const DEFAULT_BACKEND = 'http://localhost:4200';
const BASE = (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).replace(/\/$/, '')) || DEFAULT_BACKEND;
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
  const now = Date.now();
  if (now - c.ts < c.ttl) return c.data;
  return null;
}

function cacheSet(key, value) {
  if (!_cache[key]) return;
  _cache[key].data = value;
  _cache[key].ts = Date.now();
}

/* -----------------------------------------------------
   REQUEST HANDLER WITH TIMEOUT
   - Uses BASE (absolute) by default
   - credentials: include so cookie/session auth works
   ----------------------------------------------------- */
function buildUrl(path, qs = {}) {
  const url = `${BASE}${path}`;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(qs || {})) {
    if (v === undefined || v === null) continue;
    params.set(k, String(v));
  }
  return params.toString() ? `${url}?${params.toString()}` : url;
}

async function request(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const timeout = typeof opts.timeout === 'number' ? opts.timeout : DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      signal: controller.signal,
      ...opts,
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
      e.body = { message: "request_timeout" };
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
   HOME API (cached)
   ----------------------------------------------------- */
export async function getHome() {
  const cached = cacheGet("home");
  if (cached) return cached;

  const data = await request("/api/home");
  cacheSet("home", data);
  return data;
}

/* -----------------------------------------------------
   PUSH PUBLIC KEY (cached)
   ----------------------------------------------------- */
export async function getPushPublicKey() {
  const cached = cacheGet("pushPublicKey");
  if (cached) return cached;

  const data = await request("/api/push/public");
  cacheSet("pushPublicKey", data);
  return data;
}

/* -----------------------------------------------------
   PRODUCTS, BLOGS, REVIEWS, VISITORS, PUSH, METRICS
   ----------------------------------------------------- */

export async function getProducts(opts = {}) {
  const qs = {};
  if (opts.page) qs.page = opts.page;
  if (opts.limit) qs.limit = opts.limit;
  const url = buildUrl("/api/products", qs);
  const r = await request(url);
  return r.products || r.items || [];
}

export async function getProductBySlug(slug) {
  const r = await request(`/api/products/${encodeURIComponent(slug)}`);
  return r.product || r;
}

export async function getCategories() {
  return await request("/api/categories");
}

export async function getProductsByCategorySlug(slug, opts = {}) {
  const qs = {};
  if (opts.page) qs.page = opts.page;
  if (opts.limit) qs.limit = opts.limit;

  const url = buildUrl(
    `/api/categories/${encodeURIComponent(slug)}/products`,
    qs
  );
  const r = await request(url);

  if (Array.isArray(r))
    return {
      products: r,
      total: null,
      category: { slug },
      page: opts.page || 1,
      limit: opts.limit || 12,
    };

  return r;
}

/* Visitors */
export async function postVisitorIdentify(sessionId, ip = null, ua = null, meta = {}) {
  return await request("/api/visitors/identify", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, ip, ua, meta }),
  });
}

export async function postVisitorEvent(visitorId, eventType, eventProps = {}) {
  const payload = { event_type: eventType, event_props: eventProps };
  if (visitorId) payload.visitor_id = visitorId;

  return await request("/api/visitors/event", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* Reviews */
export async function getReviews(limit = 5) {
  const url = buildUrl("/api/reviews", { limit });
  const r = await request(url);
  // backend might return { reviews: [...] } or { reviews: { ... } } or an array directly
  if (!r) return [];
  if (Array.isArray(r)) return r;
  if (Array.isArray(r.reviews)) return r.reviews;
  // older shape: r.reviews might be nested in a data object
  if (r.data && Array.isArray(r.data.reviews)) return r.data.reviews;
  return [];
}


export async function getReviewStats() {
  return await request("/api/reviews/stats");
}

/* Blogs (listing) */
export async function getBlogs(opts = {}) {
  const qs = {};
  if (opts.q) qs.q = opts.q;
  if (opts.page) qs.page = opts.page;
  if (opts.limit) qs.limit = opts.limit;

  const url = buildUrl("/api/blogs", qs);
  const r = await request(url);

  if (Array.isArray(r)) return { blogs: r, total: null };

  return {
    blogs: r.blogs || [],
    total: r.total || r.total_count || null,
  };
}

// --------------------
// safe getBlogBySlug
// --------------------
export async function getBlogBySlug(slug) {
  // Defensive: do nothing for falsy/invalid slugs
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    // Return null so callers can render "not found" or loading state without network errors
    return null;
  }

  // try canonical route first
  try {
    const r = await request(`/api/blogs/${encodeURIComponent(slug)}`);
    return r.blog || r;
  } catch (e) {
    // If the direct route fails, try a search-by-slug fallback (but only if the error is not 4xx/404)
    try {
      const fallback = await request(`/api/blogs?q=${encodeURIComponent(slug)}&limit=1`);
      if (Array.isArray(fallback) && fallback.length) return fallback[0];
      if (fallback.blogs && fallback.blogs.length) return fallback.blogs[0];
      return null;
    } catch (err) {
      return null;
    }
  }
}

/* -----------------------------------------------------
   Blog likes & comments helpers (fixed to use request())
   (request() uses BASE and includes credentials & timeout)
   ----------------------------------------------------- */

// likeBlog: POST to server using request() so it goes to BASE (not vite origin)
export async function likeBlog(blogId) {
  if (!blogId) throw new Error('missing_blog_id');
  // request() will throw on non-2xx and includes credentials
  return await request(`/api/blogs/${encodeURIComponent(blogId)}/like`, { method: 'POST', body: JSON.stringify({}) });
}

export async function getLikes(blogId) {
  if (!blogId) throw new Error('missing_blog_id');
  return await request(`/api/blogs/${encodeURIComponent(blogId)}/likes`);
}

export async function postComment(blogId, { body, rating = null, name = null, email = null, publish = false } = {}) {
  if (!blogId) throw new Error('missing_blog_id');
  if (!body || String(body).trim() === '') throw new Error('missing_body');
  const payload = { body, rating, name, email, publish };
  return await request(`/api/blogs/${encodeURIComponent(blogId)}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getComments(blogId) {
  if (!blogId) throw new Error('missing_blog_id');
  return await request(`/api/blogs/${encodeURIComponent(blogId)}/comments`);
}

/* Push notifications */
export async function postPushSubscribe(visitorId, subscription, browser) {
  return await request("/api/push/subscribe", {
    method: "POST",
    body: JSON.stringify({ visitor_id: visitorId, subscription, browser }),
  });
}

export async function getPushList(opts = {}) {
  const url = buildUrl("/api/push/list", opts);
  return await request(url, { timeout: 60000 });
}

/* Metrics */
export async function getMetricsVisitorsSummary() {
  return await request("/api/metrics/visitors/summary");
}

/* Export default */
export default {
  request,
  getHome,
  getPushPublicKey,
  getProducts,
  getProductBySlug,
  getCategories,
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
};
