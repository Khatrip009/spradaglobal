import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image } from '../ui/image';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, CheckCircle, X } from 'lucide-react';
import * as api from '../../lib/api';

const TRADE_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'import', label: 'Import' },
  { key: 'export', label: 'Export' },
  { key: 'both', label: 'Both' }
];

function initialsFromName(name = '') {
  return name.split(/\s+/).map(s => s[0]).filter(Boolean).slice(0,2).join('').toUpperCase();
}

function makeAbsoluteImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^\/\//.test(url)) return `${window.location.protocol}${url}`;
  if (url.startsWith('/')) return `${api.BASE}${url}`;
  return `${api.BASE}/${url}`;
}

/* SampleModal embedded (same as earlier) */
function SampleModal({ open, onClose, productTitle = '', productSlug = '' }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', country: '', message: '', product_interest: productTitle || productSlug || '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const firstInput = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInput.current?.focus?.(), 40);
      setResult(null);
      setSubmitting(false);
      setForm(f => ({ ...f, product_interest: productTitle || productSlug || f.product_interest }));
    }
  }, [open, productTitle, productSlug]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!form.email.trim()) return 'Please enter your email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Please enter a valid email address.';
    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const v = validate();
    if (v) { setResult({ ok: false, message: v }); return; }
    setSubmitting(true); setResult(null);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        country: form.country.trim() || null,
        product_interest: (form.product_interest || productTitle || productSlug) || null,
        message: form.message.trim() || null
      };
      const res = await api.apiPost('/api/leads', payload);
      if (res && res.ok) {
        setResult({ ok: true, message: 'Request submitted. We will contact you shortly.' });
        setForm({ name: '', email: '', phone: '', company: '', country: '', message: '', product_interest: productTitle || productSlug || '' });
        setTimeout(() => onClose(), 1400);
      } else {
        setResult({ ok: false, message: (res && res.error) ? res.error : 'Submission failed.' });
      }
    } catch (err) {
      console.error('[SampleModal] submit error', err);
      setResult({ ok: false, message: err?.body?.message || err?.message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={`Request sample for ${productTitle || productSlug || 'product'}`} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-lg w-full max-w-xl mx-auto shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-[#33504F]">Request Sample</h3>
          <button aria-label="Close sample request" onClick={onClose} className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5 text-[#333]" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="text-sm text-[#666]">Requesting sample for: <strong className="text-[#33504F]">{productTitle || productSlug}</strong></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#444]">Name *</label>
              <input ref={firstInput} required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div>
              <label className="text-xs text-[#444]">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div>
              <label className="text-xs text-[#444]">Phone</label>
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div>
              <label className="text-xs text-[#444]">Company</label>
              <input value={form.company} onChange={(e) => update('company', e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-[#444]">Country</label>
              <input value={form.country} onChange={(e) => update('country', e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-[#444]">Message (optional)</label>
              <textarea value={form.message} onChange={(e) => update('message', e.target.value)} rows={4} className="w-full mt-1 p-2 border rounded" />
            </div>
          </div>

          {result && (<div className={`text-sm p-2 rounded ${result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{result.message}</div>)}

          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#33504F] text-white" disabled={submitting}>{submitting ? 'Submitting...' : 'Send Request'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(null);

  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleProduct, setSampleProduct] = useState({ title: '', slug: '' });

  const page = useMemo(() => Math.max(1, Number(searchParams.get('page') || 1)), [searchParams]);
  const limit = useMemo(() => Math.max(1, Math.min(100, Number(searchParams.get('limit') || 12))), [searchParams]);
  const tradeType = useMemo(() => {
    const t = searchParams.get('trade_type');
    return t === null ? '' : String(t).trim().toLowerCase();
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchProducts = async () => {
      try {
        const qs = { page, limit, category_slug: slug };
        if (tradeType) qs.trade_type = tradeType;
        const res = await api.apiGet('/api/products', qs);
        let fetchedProducts = [];
        let fetchedTotal = null;
        if (!res) fetchedProducts = [];
        else if (Array.isArray(res)) fetchedProducts = res;
        else {
          fetchedProducts = res.products || res.items || [];
          fetchedTotal = Number.isFinite(Number(res.total)) ? Number(res.total) : (res.total_count ?? null);
        }
        if (!mounted) return;
        setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
        setTotal(fetchedTotal);
      } catch (err) {
        console.warn('[CategoryPage] fetchProducts error', err);
        if (!mounted) return;
        setError(err && err.message ? err.message : 'Failed to load products');
        setProducts([]); setTotal(null);
      }
    };

    const fetchCategory = async () => {
      try {
        const catsRes = await api.apiGet('/api/categories', { include_counts: true, page: 1, limit: 500 });
        let list = [];
        if (!catsRes) list = [];
        else if (Array.isArray(catsRes)) list = catsRes;
        else if (Array.isArray(catsRes.categories)) list = catsRes.categories;
        else if (Array.isArray(catsRes.data)) list = catsRes.data;
        else list = [];

        if (!mounted) return;

        const found = list.find((c) => {
          if (!c) return false;
          if (String(c.slug) === String(slug)) return true;
          if (c.name && String(c.name).toLowerCase().replace(/\s+/g, '-') === String(slug).toLowerCase()) return true;
          return false;
        });

        if (found) {
          setCategory(found);
          if (total == null && (found.product_count || found.product_count === 0)) {
            setTotal(Number(found.product_count));
          }
        } else {
          setCategory({ slug, name: slug ? String(slug).replace(/-/g, ' ') : 'Category' });
        }
      } catch (err) {
        console.warn('[CategoryPage] fetchCategory error', err);
        if (!mounted) return;
        setCategory({ slug, name: slug ? String(slug).replace(/-/g, ' ') : 'Category' });
      }
    };

    (async () => {
      await Promise.all([fetchProducts(), fetchCategory()]);
      if (!mounted) return;
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, [slug, page, limit, tradeType, total]);

  const goToPage = (p) => {
    const next = Math.max(1, p);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev.toString());
      nextParams.set('page', next);
      nextParams.set('limit', limit);
      if (tradeType) nextParams.set('trade_type', tradeType);
      return nextParams;
    });
  };

  const handlePrev = () => goToPage(page - 1);
  const handleNext = () => goToPage(page + 1);

  const openSampleFor = (product) => {
    const title = product?.title || product?.name || '';
    const slugVal = product?.slug || product?.id || '';
    setSampleProduct({ title, slug: slugVal });
    setSampleOpen(true);
  };

  const goToProduct = (product) => {
    const s = product.slug || (product.title || '').replace(/\s+/g, '-').toLowerCase();
    try { navigate(`/products/${s}`); } catch (e) { try { window.location.href = `/products/${s}`; } catch { window.location.hash = `#product-${s}`; } }
  };

  return (
    <div className="min-h-screen bg-[#E8E9E2]">
      <section className="py-12 lg:py-20">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="mb-6">
            <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 text-sm text-[#33504F]">← Back to products</button>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-[#33504F]">{category?.name || (slug ? slug.replace(/-/g, ' ') : 'Category')}</h2>
            { (category?.trade_type || category?.description) && (
              <div className="text-sm text-[#4a5568] mt-2">
                {category?.trade_type ? <span className="mr-4"><strong>Category trade type:</strong> {String(category.trade_type)}</span> : null}
                {category?.description ? <span className="block md:inline">{category.description}</span> : null}
              </div>
            )}
          </div>

          <div className="max-w-[100rem] mx-auto px-6 lg:px-12 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-[#666]">Showing products in <strong className="text-[#33504F]">{category?.name || (slug ? slug.replace(/-/g, ' ') : 'Category')}</strong></div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-[#666]">Trade type:</label>
              <select value={tradeType} onChange={(e) => {
                const np = new URLSearchParams(searchParams.toString());
                if (e.target.value) np.set('trade_type', e.target.value); else np.delete('trade_type');
                np.set('page', '1');
                setSearchParams(np);
              }} className="p-2 border rounded text-sm">
                {TRADE_OPTIONS.map(o => <option key={o.key || 'all'} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading && <div className="text-center text-sm text-[#666] py-8">Loading products...</div>}
          {error && <div className="text-center text-sm text-red-600 py-4">{error}</div>}

          {!loading && !error && (
            <>
              {(!products || products.length === 0) ? (
                <div className="text-center text-sm text-[#666] py-8">No products found in this category.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product, i) => (
                    <motion.div key={product.id || product.slug || i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: i * 0.02 }}>
                      <Card className="h-full bg-white shadow-md hover:shadow-xl transition-all overflow-hidden">
                        <div className="relative overflow-hidden h-56 sm:h-64">
                          <Image src={product.primary_image || product.og_image || product.image || (product.metadata && product.metadata.image) || '/images/placeholder.png'} alt={product.title || product.name || 'Product'} width={800} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>

                        <CardContent className="p-6">
                          <h4 className="text-lg font-semibold text-[#33504F] mb-2">{product.title || product.name || 'Untitled'}</h4>
                          <p className="text-sm text-[#666666] mb-3">{product.short_description || product.description || '—'}</p>

                          <div className="mb-3 text-xs text-[#555]">
                            {product.trade_type || product.tradeType ? <span>Trade: {product.trade_type || product.tradeType}</span> : category?.trade_type || category?.tradeType ? <span>Trade: {category.trade_type || category.tradeType}</span> : null}
                          </div>

                          <div className="flex gap-3">
                            <Button className="bg-[#33504F] text-white py-2 rounded flex items-center gap-2" onClick={() => goToProduct(product)}>
                              View Details <ArrowRight className="w-4 h-4" />
                            </Button>

                            <Button variant="ghost" className="border rounded px-3 py-2" onClick={() => openSampleFor(product)}>Request Sample</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="text-sm text-[#666]">
                  {total != null ? (<>Showing page {page} — {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</>) : (<>Page {page}</>)}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" className="px-3 py-2" disabled={page <= 1} onClick={handlePrev}>Prev</Button>
                  <div className="text-sm">Page {page}</div>
                  <Button variant="outline" className="px-3 py-2" onClick={handleNext} disabled={products.length < limit && (total == null || products.length === 0)}>Next</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <SampleModal open={sampleOpen} onClose={() => setSampleOpen(false)} productTitle={sampleProduct.title} productSlug={sampleProduct.slug} />
    </div>
  );
};

export default CategoryPage;
