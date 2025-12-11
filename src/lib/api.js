// src/lib/api.js
// API helpers for the frontend (uses credentials: include)
// Default backend: http://localhost:4200

// API helpers for the frontend (uses credentials: include)
// Backend is ALWAYS controlled by .env → VITE_API_URL

const FALLBACK_BACKEND = "http://localhost:4200";

// If Vite env is defined, use it. If not, fallback.
const RAW_BASE =
  (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) ||
  (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim()) ||
  FALLBACK_BACKEND;

export const BASE = RAW_BASE.replace(/\/+$/, "");

// Uploads URL is also controlled by .env, fallback to BASE:/uploads
export const UPLOADS_BASE = (
  import.meta.env.VITE_UPLOADS_BASE_URL ||
  `${BASE}/uploads`
).replace(/\/+$/, "");

// Optional uploads base for rewritten uploads paths. Allow env override.

const DEFAULT_TIMEOUT = 15000; // ms


// get reviews for about entity
export async function getReviewsFor(about_type, about_id, opts = {}) {
  if (!about_type || !about_id) throw new Error('missing about_type or about_id');
  const qs = { about_type, about_id };
  if (opts.page) qs.page = opts.page;
  if (opts.limit) qs.limit = opts.limit;
  if (opts.only_published !== undefined) qs.only_published = opts.only_published;
  const r = await apiGet('/api/reviews', qs);
  return r; // { ok, reviews, page, limit, total, total_pages }
}

// helpful
export async function postReviewHelpful(reviewId, { voter_key = null } = {}) {
  if (!reviewId) throw new Error('missing_review_id');
  return await apiPost(`/api/reviews/${encodeURIComponent(reviewId)}/helpful`, { voter_key });
}

/* -----------------------------------------------------
   FEATURED & CERTIFICATIONS
   Small helpers that many pages expect.
----------------------------------------------------- */

/**
 * getFeatured()
 * Returns an array of featured items (if available).
 * Tries several common API shapes for robustness.
 */
export async function getFeatured(opts = {}) {
  // allow getFeatured() or getFeatured({ limit: 6 })
  const qs = {};
  if (opts && typeof opts === "object") {
    if (opts.limit != null) qs.limit = opts.limit;
    if (opts.page != null) qs.page = opts.page;
  }

  const r = await apiGet("/api/featured", qs).catch(async (err) => {
    // some backends expose /api/home.featured inside /api/home - try fallback
    try {
      const home = await apiGet("/api/home");
      if (home && Array.isArray(home.featured)) return home.featured;
      if (home && Array.isArray(home.featuredItems)) return home.featuredItems;
    } catch (e) {}
    throw err;
  });

  // Normalize common shapes
  if (!r) return [];
  if (Array.isArray(r)) return r;
  if (Array.isArray(r.featured)) return r.featured;
  if (Array.isArray(r.items)) return r.items;
  if (Array.isArray(r.data)) return r.data;

  return [];
}

/**
 * getCertifications(opts = {})
 * Fetch list of certifications / trust badges
 */
export async function getCertifications(opts = {}) {
  const qs = {};
  if (opts && typeof opts === "object") {
    if (opts.limit != null) qs.limit = opts.limit;
    if (opts.page != null) qs.page = opts.page;
  }

  const r = await apiGet("/api/certifications", qs).catch(async (err) => {
    // fallback: some APIs serve certs at /api/meta/certifications or /api/home
    try {
      const home = await apiGet("/api/home");
      if (home && Array.isArray(home.certifications)) return home.certifications;
    } catch (e) {}
    throw err;
  });

  if (!r) return [];
  if (Array.isArray(r)) return r;
  if (Array.isArray(r.certifications)) return r.certifications;
  if (Array.isArray(r.items)) return r.items;
  if (Array.isArray(r.data)) return r.data;

  return [];
}



// ---------- Image URL normalizer (client) ----------
/**
 * toAbsoluteImageUrl(url)
 * - returns null for empty/falsy
 * - leaves http(s) absolute URLs unchanged
 * - converts paths starting with /uploads or uploads/ to UPLOADS_BASE + path
 * - converts bare filenames to UPLOADS_BASE/<filename>
 * - for local FS paths (like /mnt/data/...) tries to extract filename and return UPLOADS_BASE/<filename>
 */
export function toAbsoluteImageUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Already absolute
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // If it's a protocol-relative //example...
  if (/^\/\//.test(trimmed)) return `${window.location.protocol}${trimmed}`;

  // If it looks like a server-root uploads path: /uploads/...
  if (/^\/(?:src\/)?uploads\//i.test(trimmed)) {
    // ensure single slash separation
    return `${UPLOADS_BASE}${trimmed.replace(/^\/+/, "/")}`;
  }

  // If it looks like relative uploads path: uploads/...
  if (/^(?:src\/)?uploads\//i.test(trimmed)) {
    return `${UPLOADS_BASE}/${trimmed.replace(/^\/+/, "")}`;
  }

  // If it's a local filesystem stray path (best-effort)
  // e.g. /mnt/data/..., C:\path\to\file.jpg
  // Extract basename and assume it lives under uploads
  const fsMatch = trimmed.match(/([^\\/]+)\.(jpe?g|png|gif|webp|svg|bmp)$/i);
  if (fsMatch) {
    const filename = fsMatch[0];
    return `${UPLOADS_BASE}/${encodeURIComponent(filename)}`;
  }

  // Bare filename fallback (e.g. '1764492415427-xxx.jpg' or 'file.jpg')
  if (!trimmed.startsWith("/")) {
    return `${UPLOADS_BASE}/${trimmed.replace(/^\/+/, "")}`;
  }

  // Fallback: prefix with BASE
  return `${BASE}${trimmed}`;
}


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
// Robust getReviews: accepts either a number (limit) or an options object { limit, page }
export async function getReviews(opts = {}) {
  // allow calling getReviews(10) or getReviews({ limit: 10, page: 1 })
  let options = {};
  if (typeof opts === "number") {
    options.limit = opts;
  } else if (opts && typeof opts === "object") {
    options = { ...opts };
  }

  const qs = {};
  if (options.limit != null) qs.limit = options.limit;
  if (options.page != null) qs.page = options.page;

  const r = await apiGet("/api/reviews", qs);

  if (!r) return [];

  // If backend returned an array directly
  if (Array.isArray(r)) {
    return r.map(normalizeReview);
  }

  // If backend returned { reviews: [...] } or { data: { reviews: [...] } }
  if (Array.isArray(r.reviews)) return r.reviews.map(normalizeReview);
  if (Array.isArray(r.data?.reviews)) return r.data.reviews.map(normalizeReview);

  // Some APIs return { items: [...] } or { data: [...] }
  if (Array.isArray(r.items)) return r.items.map(normalizeReview);
  if (Array.isArray(r.data)) return r.data.map(normalizeReview);

  // fallback: maybe the API returned { results: [...] } or a single object
  if (Array.isArray(r.results)) return r.results.map(normalizeReview);

  // Not an array — try to extract single review object
  if (r && typeof r === "object") {
    // If object looks like a single review, normalize and return as single-element array
    const maybeReview = r.review || r.item || r.data || null;
    if (maybeReview && typeof maybeReview === "object" && !Array.isArray(maybeReview)) {
      return [normalizeReview(maybeReview)];
    }
  }

  // give up and return empty array
  return [];
}

/**
 * normalizeReview(raw)
 * - returns a consistent review object:
 *   { id, author, author_title, rating, body, avatar, created_at, raw }
 */
function normalizeReview(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id || raw._id || raw.review_id || null;
  const author = raw.author || raw.author_name || raw.name || raw.reviewer || raw.user || "Anonymous";
  const author_title = raw.company || raw.title || raw.author_title || null;
  const rating = raw.rating != null ? Number(raw.rating) : (raw.stars != null ? Number(raw.stars) : null);
  const body = raw.body || raw.text || raw.testimonial || raw.content || raw.comment || "";
  const avatar = raw.avatar || raw.author_avatar || raw.photo || raw.customer_photo || null;
  const created_at = raw.created_at || raw.createdAt || raw.timestamp || null;

  return {
    id,
    author,
    author_title,
    rating,
    body,
    avatar,
    created_at,
    raw: raw
  };
}


export async function getReviewStats() {
  return await apiGet('/api/reviews/stats');
}

/* -----------------------------------------------------
   BLOGS
----------------------------------------------------- */
/* -----------------------------------------------------
   BLOGS (with image normalization using toAbsoluteImageUrl)
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

function normalizeBlogImages(b) {
  if (!b || typeof b !== "object") return b;

  // top-level image fields
  if (b.og_image) b.og_image = toAbsoluteImageUrl(b.og_image);
  if (b.image) b.image = toAbsoluteImageUrl(b.image);
  if (b.thumbnail) b.thumbnail = toAbsoluteImageUrl(b.thumbnail);

  // author avatar
  if (b.author && b.author.avatar) {
    b.author.avatar = toAbsoluteImageUrl(b.author.avatar);
  }

  // content -> lead -> hero_image
  if (b.content && b.content.lead && b.content.lead.hero_image && b.content.lead.hero_image.url) {
    b.content.lead.hero_image.url = toAbsoluteImageUrl(b.content.lead.hero_image.url);
  }

  // content.blocks images / galleries
  if (b.content && Array.isArray(b.content.blocks)) {
    b.content.blocks = b.content.blocks.map(block => {
      if (!block || typeof block !== "object") return block;
      if (block.type === "image" && block.url) {
        return { ...block, url: toAbsoluteImageUrl(block.url) };
      }
      if (block.type === "gallery" && Array.isArray(block.items)) {
        return {
          ...block,
          items: block.items.map(it => ({ ...it, url: toAbsoluteImageUrl(it.url) }))
        };
      }
      return block;
    });
  }

  // images array (if backend returns explicit images)
  if (Array.isArray(b.images)) {
    b.images = b.images.map(i => ({ ...i, url: toAbsoluteImageUrl(i.url) }));
  }

  return b;
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
      blogs: r.map(b => normalizeBlogImages({ ...b, category: normalizeCategory(b.category) })),
      total: r.length,
      page: opts.page || 1,
      limit: opts.limit || r.length
    };
  }

  // CASE B: backend returned { blogs: [...], total, ... }
  const blogs = r.blogs || r.items || [];

  return {
    blogs: blogs.map(b => normalizeBlogImages({ ...b, category: normalizeCategory(b.category) })),
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

    return normalizeBlogImages({
      ...blog,
      category: normalizeCategory(blog.category)
    });
  } catch {
    // Fallback: search by q=slug
    try {
      const fallback = await apiGet('/api/blogs', { q: slug, limit: 1 });

      let b = null;

      if (Array.isArray(fallback) && fallback.length) b = fallback[0];
      else if (fallback.blogs?.length) b = fallback.blogs[0];

      if (!b) return null;

      return normalizeBlogImages({
        ...b,
        category: normalizeCategory(b.category)
      });
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
