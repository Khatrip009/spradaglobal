// src/components/pages/CategoryPage.jsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image } from '../ui/image';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, X } from 'lucide-react';
import * as api from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';

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
   Sample Modal (uses supabase directly)
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
      const { error } = await supabase
        .from('leads')
        .insert({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone || null,
          company: form.company || null,
          country: form.country || null,
          message: form.message || null,
          product_interest: form.product_interest || null,
          status: 'new',
        });
      if (error) throw error;
      setResult({ ok: true, message: 'Request submitted successfully.' });
      setTimeout(onClose, 1200);
    } catch (err) {
      setResult({ ok: false, message: err.message || 'Submission failed.' });
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
   Category Page – robust handling with explicit array extraction
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

      try {
        // 1. Fetch categories
        const result = await api.getCategories({ limit: 500 });
        console.log('[CategoryPage] Raw getCategories result:', result);

        // 2. Extract categories array – SAFE approach
        let categories = [];

        // Case: result is an array
        if (Array.isArray(result)) {
          categories = result;
        }
        // Case: result is an object with a 'categories' array
        else if (result && typeof result === 'object' && Array.isArray(result.categories)) {
          categories = result.categories;
        }
        // Case: result has a 'data' array
        else if (result && typeof result === 'object' && Array.isArray(result.data)) {
          categories = result.data;
        }
        // Case: result has an 'items' array
        else if (result && typeof result === 'object' && Array.isArray(result.items)) {
          categories = result.items;
        }
        // Case: result is something else – fallback to empty array
        else {
          console.warn('[CategoryPage] Unexpected response shape, using empty array.');
          categories = [];
        }

        // Final safety – force array
        if (!Array.isArray(categories)) {
          console.warn('[CategoryPage] categories is not an array, forcing empty array.');
          categories = [];
        }

        console.log('[CategoryPage] Extracted categories (length):', categories.length);

        // 3. Find the category by slug
        let found = null;
        if (slug && categories.length > 0) {
          found = categories.find(c => c.slug === slug) || null;
        }
        setCategory(found);

        // 4. Fetch products for this category
        const prodResult = await api.getProducts({
          category_slug: slug,
          page,
          limit
        });
        setProducts(prodResult.products || []);
        setTotal(prodResult.total || null);
      } catch (err) {
        console.error('[CategoryPage] load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
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

        {/* Category image */}
        {category?.image && (
          <div className="mt-6 mb-10 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={api.toAbsoluteImageUrl(category.image)}
              alt={category.name}
              width={1600}
              className="w-full h-[320px] object-cover"
            />
          </div>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <div className="h-56 overflow-hidden">
                  <Image
                    src={api.toAbsoluteImageUrl(product.primary_image)}
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