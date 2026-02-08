import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image } from '../ui/image';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, X } from 'lucide-react';
import * as api from '../../lib/api';

/* ------------------------------------------------------------------
   Supabase Storage Config (PUBLIC)
------------------------------------------------------------------- */
const SUPABASE_PROJECT_REF = 'kwthxsumqqssiywdcevx';
const SUPABASE_BUCKET = 'sprada_storage';
const SUPABASE_PUBLIC_BASE =
  `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET}`;

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------- */
function makeSupabaseImageUrl(path) {
  if (!path) return null;

  // already absolute (products already come like this)
  if (/^https?:\/\//i.test(path)) return path;

  // DB value like "/categories/xxx.jpg"
  return `${SUPABASE_PUBLIC_BASE}${path}`;
}

/* ------------------------------------------------------------------
   Trade options
------------------------------------------------------------------- */
const TRADE_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'import', label: 'Import' },
  { key: 'export', label: 'Export' },
  { key: 'both', label: 'Both' }
];

/* ------------------------------------------------------------------
   Sample Modal (unchanged)
------------------------------------------------------------------- */
function SampleModal({ open, onClose, productTitle = '', productSlug = '' }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    message: '',
    product_interest: productTitle || productSlug || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const firstInput = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInput.current?.focus?.(), 40);
      setResult(null);
      setSubmitting(false);
      setForm(f => ({
        ...f,
        product_interest: productTitle || productSlug || f.product_interest
      }));
    }
  }, [open, productTitle, productSlug]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setResult({ ok: false, message: 'Name and email are required.' });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await api.apiPost('/api/leads', {
        ...form,
        name: form.name.trim(),
        email: form.email.trim()
      });

      if (res?.ok) {
        setResult({ ok: true, message: 'Request submitted successfully.' });
        setTimeout(onClose, 1200);
      } else {
        setResult({ ok: false, message: res?.error || 'Submission failed.' });
      }
    } catch {
      setResult({ ok: false, message: 'Network error.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-[#33504F]">Request Sample</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <input className="w-full border p-2" placeholder="Name" value={form.name} onChange={e => update('name', e.target.value)} />
          <input className="w-full border p-2" placeholder="Email" value={form.email} onChange={e => update('email', e.target.value)} />
          <textarea className="w-full border p-2" rows={3} placeholder="Message" value={form.message} onChange={e => update('message', e.target.value)} />

          {result && <div className={result.ok ? 'text-green-600' : 'text-red-600'}>{result.message}</div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Send'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Category Page
------------------------------------------------------------------- */
const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(null);

  const page = useMemo(() => Number(searchParams.get('page') || 1), [searchParams]);
  const limit = 12;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      const [catsRes, prodRes] = await Promise.all([
        api.apiGet('/api/categories', { include_counts: true, limit: 500 }),
        api.apiGet('/api/products', { category_slug: slug, page, limit })
      ]);

      if (!mounted) return;

      const categories = catsRes?.categories || [];
      const found = categories.find(c => c.slug === slug);

      setCategory(found || null);
      setProducts(prodRes?.products || []);
      setTotal(prodRes?.total || null);
      setLoading(false);
    };

    load();
    return () => { mounted = false; };
  }, [slug, page]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#E8E9E2]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Category title */}
        <h1 className="text-3xl font-semibold text-[#33504F] text-center">
          {category?.name || slug.replace(/-/g, ' ')}
        </h1>

        {/* CATEGORY IMAGE (FROM SUPABASE) */}
        {category?.image && (
          <div className="mt-6 mb-10 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={makeSupabaseImageUrl(category.image)}
              alt={category.name}
              width={1600}
              className="w-full h-[320px] object-cover"
            />
          </div>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <div className="h-56 overflow-hidden">
                  <Image
                    src={makeSupabaseImageUrl(product.primary_image)}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />

                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-gray-600">{product.short_description}</p>

                  <Button className="mt-3" onClick={() => navigate(`/products/${product.slug}`)}>
                    View <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CategoryPage;
