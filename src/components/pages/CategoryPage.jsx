// src/components/pages/CategoryPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image } from '../ui/image';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import * as api from '../../lib/api';

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(null);

  // derive page & limit from URLSearchParams (avoid setState within effect)
  const page = useMemo(() => Math.max(1, Number(searchParams.get('page') || 1)), [searchParams]);
  const limit = useMemo(() => Math.max(1, Math.min(100, Number(searchParams.get('limit') || 12))), [searchParams]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    api.getProductsByCategorySlug(slug, { page, limit }).then((res) => {
      if (!mounted) return;
      if (!res) {
        setProducts([]);
        setCategory({ slug });
        setTotal(null);
        return;
      }
      // handle both array and object responses
      if (Array.isArray(res)) {
        setProducts(res);
        setCategory({ slug });
        setTotal(null);
      } else {
        setProducts(res.products || res.items || []);
        setCategory(res.category || { slug });
        setTotal(res.total == null ? null : Number(res.total));
      }
    }).catch((err) => {
      if (!mounted) return;
      if (err && err.status === 404) setError('Category not found');
      else setError(err.message || 'Failed to load category products');
      setProducts([]);
      setCategory({ slug });
    }).finally(() => {
      if (!mounted) return;
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [slug, page, limit]);

  const goToPage = (p) => {
    const next = Math.max(1, p);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev.toString());
      nextParams.set('page', next);
      nextParams.set('limit', limit);
      return nextParams;
    });
  };

  const handlePrev = () => goToPage(page - 1);
  const handleNext = () => goToPage(page + 1);

  return (
    <div className="min-h-screen bg-[#E8E9E2]">
      <section className="py-12 lg:py-20">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="mb-6">
            <Link to="/products" className="inline-flex items-center gap-2 text-sm text-[#33504F]">← Back to products</Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-[#33504F]">
              {category?.name || (slug ? slug.replace(/-/g, ' ') : 'Category')}
            </h2>
            {category?.description && <p className="text-sm text-[#666] mt-2 max-w-2xl mx-auto">{category.description}</p>}
          </div>

          {loading && <div className="text-center text-sm text-[#666] py-8">Loading products...</div>}
          {error && <div className="text-center text-sm text-red-600 py-4">{error}</div>}

          {!loading && !error && (
            <>
              {products.length === 0 ? (
                <div className="text-center text-sm text-[#666] py-8">No products found in this category.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product, i) => (
                    <motion.div key={product.id || product.slug || i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: i * 0.02 }}>
                      <Card className="h-full bg-white shadow-md hover:shadow-xl transition-all overflow-hidden">
                        <div className="relative overflow-hidden h-56 sm:h-64">
                          <Image
                            src={product.primary_image || product.og_image || product.image || (product.metadata && product.metadata.image) || '/images/placeholder.png'}
                            alt={product.title}
                            width={800}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                        <CardContent className="p-6">
                          <h4 className="text-lg font-semibold text-[#33504F] mb-2">{product.title}</h4>
                          <p className="text-sm text-[#666666] mb-3">{product.short_description || product.description || '—'}</p>
                          <div className="flex gap-3">
                            <Link to={`/product/${product.slug || product.id}`}>
                              <Button className="bg-[#33504F] text-white py-2 rounded flex items-center gap-2">
                                View Details <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" className="border rounded px-3 py-2" onClick={() => window.alert('Request sample flow - integrate as needed')}>Request Sample</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="text-sm text-[#666]">
                  {total != null ? (
                    <>Showing page {page} — {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</>
                  ) : (
                    <>Page {page}</>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" className="px-3 py-2" disabled={page <= 1} onClick={handlePrev}>Prev</Button>
                  <div className="text-sm">Page {page}</div>
                  <Button variant="outline" className="px-3 py-2" onClick={handleNext} disabled={products.length < limit && total == null}>Next</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;
