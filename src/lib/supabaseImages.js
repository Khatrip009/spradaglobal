// src/lib/supabaseImages.js

const SUPABASE_PROJECT = "kwthxsumqqssiywdcevx"; // ✅ EXACT
const SUPABASE_BUCKET = "sprada_storage";

const SUPABASE_PUBLIC_BASE =
  `https://${SUPABASE_PROJECT}.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET}`;

export function resolveSupabaseImage(
  path,
  fallback = "/img/blog-placeholder.jpg"
) {
  if (!path) return fallback;

  if (/^https?:\/\//i.test(path)) return path;

  const clean = path.replace(/^\/+/, "");
  return `${SUPABASE_PUBLIC_BASE}/${clean}`;
}
