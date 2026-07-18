// scripts/generate-sitemap.js
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://kwthxsumqqssiywdcevx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lZ2PN6zD84oD1jtTIlHIYg_slTNSyJQ'; // Replace with your public key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BASE_URL = 'https://sprada2globalexim.com'; // Change to your actual domain

// Static pages (known routes)
const staticPages = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/services', priority: 0.8, changefreq: 'monthly' },
  { path: '/products', priority: 0.9, changefreq: 'weekly' },
  { path: '/blog', priority: 0.9, changefreq: 'weekly' },
  { path: '/contact', priority: 0.7, changefreq: 'monthly' },
];

async function generateSitemap() {
  // Fetch published blogs
  const { data: blogs, error: blogsErr } = await supabase
    .from('blogs')
    .select('slug, updated_at')
    .eq('is_published', true);

  if (blogsErr) console.error('Blogs fetch error:', blogsErr);

  // Fetch products
  const { data: products, error: productsErr } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_published', true);

  if (productsErr) console.error('Products fetch error:', productsErr);

  // Fetch categories
  const { data: categories, error: catsErr } = await supabase
    .from('categories')
    .select('slug, updated_at');

  if (catsErr) console.error('Categories fetch error:', catsErr);

  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  staticPages.forEach(page => {
    xml += `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
  });

  // Blog pages
  if (blogs) {
    blogs.forEach(blog => {
      const lastmod = blog.updated_at ? new Date(blog.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>
    <loc>${BASE_URL}/blog/${encodeURIComponent(blog.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });
  }

  // Product pages
  if (products) {
    products.forEach(product => {
      const lastmod = product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>
    <loc>${BASE_URL}/products/${encodeURIComponent(product.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });
  }

  // Category pages
  if (categories) {
    categories.forEach(cat => {
      const lastmod = cat.updated_at ? new Date(cat.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>
    <loc>${BASE_URL}/products/category/${encodeURIComponent(cat.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
    });
  }

  xml += `</urlset>`;

  // Write to public folder
  const filePath = join(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(filePath, xml, 'utf8');
  console.log(`✅ Sitemap generated at ${filePath}`);
}

generateSitemap();