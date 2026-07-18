// src/lib/api.js – Supabase‑only API client
// All image URLs are normalized to absolute Supabase public URLs.

import { supabase } from './supabaseClient';
import auth from './auth';

// -------------------------------------------------------------
// Image URL Normalizer
// -------------------------------------------------------------
export function toAbsoluteImageUrl(path) {
  if (!path) return null;
  if (path.includes('/storage/v1/object/public/sprada_storage')) return path;
  if (path.startsWith('data:')) return path;

  let cleanPath = path;
  if (/^https?:\/\//i.test(cleanPath)) {
    // Extract after '/uploads/'
    const parts = cleanPath.split('/uploads/');
    if (parts.length > 1) {
      cleanPath = parts.slice(1).join('/uploads/');
    } else {
      return null; // unknown absolute URL
    }
  } else {
    cleanPath = cleanPath.replace(/^\/+/, '');
    if (cleanPath.startsWith('uploads/')) {
      cleanPath = cleanPath.substring('uploads/'.length);
    }
  }

  const { data } = supabase.storage.from('sprada_storage').getPublicUrl(cleanPath);
  return data.publicUrl;
}

// -------------------------------------------------------------
// Constants (legacy compatibility)
// -------------------------------------------------------------
export const BASE = '';
export const API_BASE = '';
export const API_ORIGIN = '';
export const UPLOAD_STRATEGY = 's3';

// -------------------------------------------------------------
// Legacy stubs (throw helpful errors)
// -------------------------------------------------------------
export function request() {
  throw new Error('request() is not supported. Use dedicated Supabase functions.');
}
export function buildUrl() {
  throw new Error('buildUrl() is not supported.');
}
export const apiGet = () => { throw new Error('apiGet is not supported. Use getProducts() etc.'); };
export const apiPost = () => { throw new Error('apiPost is not supported.'); };
export const apiPut = () => { throw new Error('apiPut is not supported.'); };
export const apiDelete = () => { throw new Error('apiDelete is not supported.'); };

// -------------------------------------------------------------
// 1. Authentication
// -------------------------------------------------------------
export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { user, session } = data;
  await auth.loginWithTokens({
    accessToken: session?.access_token,
    refreshToken: session?.refresh_token,
    user,
  });
  return { user, session };
};

export const signUp = async (payload) => {
  const { email, password, full_name, ...rest } = payload;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, ...rest } },
  });
  if (error) throw error;
  if (data.user) {
    const { error: insertErr } = await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email,
      full_name: full_name || null,
      role_id: 3,
      is_active: true,
    });
    if (insertErr) console.warn('Failed to insert into custom users table:', insertErr);
  }
  return data;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const user = data.user;
  if (!user) return null;
  const { data: userData, error: userErr } = await supabase
    .from('users')
    .select('role_id, full_name, is_active')
    .eq('id', user.id)
    .single();
  if (!userErr && userData) {
    return { ...user, ...userData };
  }
  return user;
};

export const logout = async () => {
  await supabase.auth.signOut();
  await auth.logout();
};

export const getUsers = async (opts = {}) => {
  let query = supabase.from('users').select('*');
  if (opts.q) query = query.ilike('email', `%${opts.q}%`);
  if (opts.limit) query = query.limit(opts.limit);
  if (opts.page) query = query.range((opts.page - 1) * (opts.limit || 10), opts.page * (opts.limit || 10) - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { users: data, total: count || data.length };
};

// -------------------------------------------------------------
// 2. Home / Meta
// -------------------------------------------------------------
export const getHome = async () => {
  const [products, blogs, categories] = await Promise.all([
    getProducts({ limit: 6 }),
    getBlogs({ limit: 3 }),
    getCategories({ limit: 10 }),
  ]);
  return {
    products: products.products || [],
    blogs: blogs.blogs || [],
    categories: categories.categories || [],
  };
};

export const getPushPublicKey = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'push_public_key')
    .single();
  if (error) return null;
  return data?.value || null;
};

// -------------------------------------------------------------
// 3. Products
// -------------------------------------------------------------
export const getProducts = async (opts = {}) => {
  let query = supabase.from('products').select(`
    *,
    product_images ( id, url, is_primary )
  `);

  if (opts.category_id) query = query.eq('category_id', opts.category_id);
  if (opts.category_slug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', opts.category_slug)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
    else return { products: [], total: 0, page: 1, limit: opts.limit || 10 };
  }
  if (opts.q) query = query.ilike('title', `%${opts.q}%`);
  if (opts.trade_type) query = query.eq('trade_type', opts.trade_type);
  if (opts.order) {
    const [col, dir] = opts.order.split(' ');
    query = query.order(col, { ascending: dir === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  if (opts.limit) query = query.limit(opts.limit);
  if (opts.page) query = query.range((opts.page - 1) * (opts.limit || 10), opts.page * (opts.limit || 10) - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const transformed = (data || []).map(p => {
    const primary = p.product_images?.find(img => img.is_primary) || p.product_images?.[0];
    return {
      ...p,
      primary_image: primary?.url ? toAbsoluteImageUrl(primary.url) : null,
      og_image: p.og_image ? toAbsoluteImageUrl(p.og_image) : null,
      // also convert any other image fields if needed (e.g., thumbnail)
      thumbnail: p.thumbnail ? toAbsoluteImageUrl(p.thumbnail) : null,
    };
  });

  return {
    products: transformed,
    total: count || transformed.length,
    page: opts.page || 1,
    limit: opts.limit || transformed.length,
  };
};

export const getProductBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images ( id, url, is_primary )
    `)
    .eq('slug', slug)
    .single();
  if (error) throw error;
  const primary = data.product_images?.find(img => img.is_primary) || data.product_images?.[0];
  return {
    ...data,
    primary_image: primary?.url ? toAbsoluteImageUrl(primary.url) : null,
    og_image: data.og_image ? toAbsoluteImageUrl(data.og_image) : null,
    thumbnail: data.thumbnail ? toAbsoluteImageUrl(data.thumbnail) : null,
  };
};

export const getProductsByCategorySlug = (slug, opts = {}) => getProducts({ ...opts, category_slug: slug });

// -------------------------------------------------------------
// 4. Product Images CRUD
// -------------------------------------------------------------
export const getProductImages = async (product_id) => {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', product_id);
  if (error) throw error;
  // Convert all urls to absolute
  return (data || []).map(img => ({
    ...img,
    url: toAbsoluteImageUrl(img.url) || img.url,
  }));
};

export const createProductImage = async (productId, file, isPrimary = false) => {
  const filePath = `products/${Date.now()}-${file.name}`;
  const { error: uploadErr } = await supabase.storage
    .from('sprada_storage')
    .upload(filePath, file);
  if (uploadErr) throw uploadErr;
  const { data: publicUrl } = supabase.storage
    .from('sprada_storage')
    .getPublicUrl(filePath);
  const url = publicUrl.publicUrl;
  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      url,
      is_primary: isPrimary,
      filename: file.name,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProductImage = async (id) => {
  const { error } = await supabase.from('product_images').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
};

export const patchProductImage = async (id, patchObj) => {
  const { data, error } = await supabase
    .from('product_images')
    .update(patchObj)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// -------------------------------------------------------------
// 5. Categories
// -------------------------------------------------------------
export const getCategories = async (opts = {}) => {
  let query = supabase.from('categories').select('*').order('sort_order', { ascending: true });
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw error;
  // Convert category image if exists
  const converted = (data || []).map(c => ({
    ...c,
    image: c.image ? toAbsoluteImageUrl(c.image) : null,
  }));
  return { categories: converted, total: converted.length };
};

export const getCategoryById = async (id) => {
  const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
  if (error) throw error;
  return { ...data, image: data.image ? toAbsoluteImageUrl(data.image) : null };
};

// -------------------------------------------------------------
// 6. Blogs
// -------------------------------------------------------------
export const getBlogs = async (opts = {}) => {
  let query = supabase
    .from('blogs')
    .select(`
      *,
      blog_images ( id, url, caption, created_at )
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (opts.limit) query = query.limit(opts.limit);
  if (opts.page) query = query.range((opts.page - 1) * (opts.limit || 10), opts.page * (opts.limit || 10) - 1);
  if (opts.q) query = query.ilike('title', `%${opts.q}%`);

  const { data, error, count } = await query;
  if (error) throw error;

  const transformed = (data || []).map(b => {
    // Convert blog_images urls
    const images = (b.blog_images || []).map(img => ({
      ...img,
      url: toAbsoluteImageUrl(img.url) || img.url,
    }));
    const firstImage = images[0]?.url || null;
    return {
      ...b,
      blog_images: images,
      primary_image: toAbsoluteImageUrl(b.og_image || firstImage),
      og_image: b.og_image ? toAbsoluteImageUrl(b.og_image) : null,
      image: b.image ? toAbsoluteImageUrl(b.image) : null,
    };
  });

  return {
    blogs: transformed,
    total: count || transformed.length,
    page: opts.page || 1,
    limit: opts.limit || transformed.length,
  };
};

export const getBlogBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      blog_images ( id, url, caption, created_at )
    `)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('not_found');
  const images = (data.blog_images || []).map(img => ({
    ...img,
    url: toAbsoluteImageUrl(img.url) || img.url,
  }));
  const firstImage = images[0]?.url || null;
  return {
    ...data,
    blog_images: images,
    primary_image: toAbsoluteImageUrl(data.og_image || firstImage),
    og_image: data.og_image ? toAbsoluteImageUrl(data.og_image) : null,
    image: data.image ? toAbsoluteImageUrl(data.image) : null,
  };
};

// -------------------------------------------------------------
// 7. Blog Images CRUD
// -------------------------------------------------------------
export const getBlogImages = async (blog_id) => {
  const { data, error } = await supabase
    .from('blog_images')
    .select('*')
    .eq('blog_id', blog_id);
  if (error) throw error;
  return (data || []).map(img => ({
    ...img,
    url: toAbsoluteImageUrl(img.url) || img.url,
  }));
};

export const attachBlogImage = async (blogId, url, caption = null) => {
  const absUrl = toAbsoluteImageUrl(url) || url;
  const { data, error } = await supabase
    .from('blog_images')
    .insert({ blog_id: blogId, url: absUrl, caption })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteBlogImage = async (id) => {
  const { error } = await supabase.from('blog_images').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
};

// For upload (used by BlogEditor)
export const uploadBlogEditorFile = async (file) => {
  const filePath = `blogs/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('sprada_storage').upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from('sprada_storage').getPublicUrl(filePath);
  return data.publicUrl;
};

export const uploadAndAttachBlogImage = async (file, blogId, caption = null) => {
  const url = await uploadBlogEditorFile(file);
  return attachBlogImage(blogId, url, caption);
};

// -------------------------------------------------------------
// 8. Blog Interactions (Likes, Comments)
// -------------------------------------------------------------
export const likeBlog = async (blogId) => {
  const user = await auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return toggleLike(blogId, { user_id: user.id });
};

export const getLikes = async (blogId) => {
  return getLikesCount(blogId);
};

export const postComment = async (blogId, payload) => {
  const { data, error } = await supabase
    .from('blog_comments')
    .insert({ blog_id: blogId, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getComments = async (blogId) => {
  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('blog_id', blogId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateComment = async (commentId, payload) => {
  const { data, error } = await supabase
    .from('blog_comments')
    .update(payload)
    .eq('id', commentId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteComment = async (commentId) => {
  const { error } = await supabase.from('blog_comments').delete().eq('id', commentId);
  if (error) throw error;
  return { success: true };
};

export const toggleLike = async (blogId, { user_id }) => {
  const { data: existing } = await supabase
    .from('blog_likes')
    .select('*')
    .eq('blog_id', blogId)
    .eq('user_id', user_id)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase.from('blog_likes').delete().eq('blog_id', blogId).eq('user_id', user_id);
    if (error) throw error;
    return { liked: false };
  } else {
    const { error } = await supabase.from('blog_likes').insert({ blog_id: blogId, user_id });
    if (error) throw error;
    return { liked: true };
  }
};

export const getLikesCount = async (blogId) => {
  const { count, error } = await supabase
    .from('blog_likes')
    .select('*', { count: 'exact', head: true })
    .eq('blog_id', blogId);
  if (error) throw error;
  return { count };
};

// -------------------------------------------------------------
// 9. Reviews
// -------------------------------------------------------------
export const getReviews = async (opts = {}) => {
  let query = supabase.from('reviews').select('*');
  if (opts.about_type) query = query.eq('about_type', opts.about_type);
  if (opts.about_id) query = query.eq('about_id', opts.about_id);
  if (opts.limit) query = query.limit(opts.limit);
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getReviewsFor = (about_type, about_id, opts = {}) =>
  getReviews({ about_type, about_id, ...opts });

export const postReviewHelpful = async (reviewId, payload = {}) => {
  // Simple increment – we'll fetch current and update
  const { data: current } = await supabase
    .from('reviews')
    .select('helpful_count')
    .eq('id', reviewId)
    .single();
  const newCount = (current?.helpful_count || 0) + 1;
  const { data, error } = await supabase
    .from('reviews')
    .update({ helpful_count: newCount })
    .eq('id', reviewId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getReviewsStats = async () => {
  const { count, error } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  const { data: avgData, error: avgErr } = await supabase
    .from('reviews')
    .select('rating')
    .not('rating', 'is', null);
  if (avgErr) throw avgErr;
  let avg = 0;
  if (avgData && avgData.length > 0) {
    const sum = avgData.reduce((acc, r) => acc + r.rating, 0);
    avg = sum / avgData.length;
  }
  return { total: count || 0, average: avg };
};

export const getRecentReviews = async (limit = 5) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

// -------------------------------------------------------------
// 10. Visitors / Analytics
// -------------------------------------------------------------
export const postVisitorIdentify = async (sessionId, payload = {}) => {
  const { data, error } = await supabase
    .from('visitors')
    .upsert({ session_id: sessionId, ...payload }, { onConflict: 'session_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const postVisitorEvent = async (visitorId, eventType, eventProps = {}) => {
  const { data, error } = await supabase
    .from('analytics_events')
    .insert({ visitor_id: visitorId, event_type: eventType, event_props: eventProps })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getVisitorSummary = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { count: total, error: totalErr } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true });
  if (totalErr) throw totalErr;
  const { count: todayCount, error: todayErr } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', today);
  if (todayErr) throw todayErr;
  return { total: total || 0, today: todayCount || 0 };
};

export const getVisitorsList = async () => {
  const { data, error } = await supabase
    .from('visitors')
    .select('*')
    .order('last_seen', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
};

export const getVisitorSessions = getVisitorsList;

export const getMetricsVisitorsSummary = getVisitorSummary;

// -------------------------------------------------------------
// 11. Leads
// -------------------------------------------------------------
export const getLeads = async (limit = 10) => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getLeadsStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { count: total, error: totalErr } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });
  if (totalErr) throw totalErr;
  const { count: todayCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);
  const { count: weekCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo);
  const { count: monthCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthAgo);
  return {
    total: total || 0,
    today: todayCount || 0,
    week: weekCount || 0,
    month: monthCount || 0,
  };
};

export const getLeadById = async (id) => {
  const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const getLeadNotes = async (leadId) => {
  const { data, error } = await supabase
    .from('lead_notes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
};

export const addLeadNote = async (leadId, { note }) => {
  const { data: userData } = await supabase.auth.getUser();
  const author = userData?.user?.email || 'admin';
  const { data, error } = await supabase
    .from('lead_notes')
    .insert({ lead_id: leadId, note, author })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateLead = async (id, payload) => {
  const { data, error } = await supabase.from('leads').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

// -------------------------------------------------------------
// 12. Push Subscriptions
// -------------------------------------------------------------
export const getPushList = async () => {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getPushSubscriptions = getPushList;

// -------------------------------------------------------------
// 13. Upload Helpers (generic)
// -------------------------------------------------------------
export const uploadFile = async (file, { space = 'blogs' } = {}) => {
  const filePath = `${space}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('sprada_storage').upload(filePath, file);
  if (error) throw error;
  return filePath; // returns relative path; use toAbsoluteImageUrl to get public URL
};

export const presignUpload = () => null;
export const uploadFileToLocalSpace = () => { throw new Error('Use uploadFile with Supabase'); };

// -------------------------------------------------------------
// Default Export
// -------------------------------------------------------------
export default {
  // Auth
  login,
  signUp,
  logout,
  getCurrentUser,
  getUsers,

  // Home / Meta
  getHome,
  getPushPublicKey,

  // Products
  getProducts,
  getProductBySlug,
  getProductImages,
  createProductImage,
  deleteProductImage,
  patchProductImage,
  getProductsByCategorySlug,

  // Categories
  getCategories,
  getCategoryById,

  // Reviews
  getReviews,
  getReviewsFor,
  postReviewHelpful,
  getReviewsStats,
  getRecentReviews,

  // Blogs
  getBlogs,
  getBlogBySlug,
  likeBlog,
  getLikes,
  postComment,
  getComments,
  updateComment,
  deleteComment,
  toggleLike,
  getLikesCount,
  getBlogImages,
  attachBlogImage,
  deleteBlogImage,
  uploadBlogEditorFile,
  uploadAndAttachBlogImage,

  // Visitors
  postVisitorIdentify,
  postVisitorEvent,
  getVisitorSummary,
  getVisitorsList,
  getVisitorSessions,
  getMetricsVisitorsSummary,

  // Leads
  getLeads,
  getLeadsStats,
  getLeadById,
  getLeadNotes,
  addLeadNote,
  updateLead,

  // Push
  getPushList,
  getPushSubscriptions,

  // Upload
  uploadFile,
  presignUpload,
  uploadFileToLocalSpace,

  // Image helper
  toAbsoluteImageUrl,

  // Legacy stubs
  request,
  buildUrl,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};