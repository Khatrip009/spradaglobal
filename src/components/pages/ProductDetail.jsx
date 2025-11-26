// src/components/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image } from '../ui/image';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import * as api from '../../lib/api';


const ProductDetail = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setProduct(null);

    api.getProductBySlug(slug)
      .then((p) => {
        if (!mounted) return;
        setProduct(p);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err && err.status === 404) setError('Product not found');
        else setError(err.message || 'Failed to load product');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => { mounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-[#666]">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-[#33504F] mb-4">Error</h2>
          <p className="text-sm text-[#666] mb-6">{error}</p>
          <Link to="/products"><Button variant="outline">Back to products</Button></Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // gallery array (primary + metadata images)
  const gallery = [
    product.primary_image,
    product.og_image,
    product.image,
    ...(product.metadata && Array.isArray(product.metadata.images) ? product.metadata.images : []),
    ...(product.metadata && Array.isArray(product.metadata.gallery) ? product.metadata.gallery : [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      
      <div className="max-w-[100rem] mx-auto px-6 lg:px-12 py-10">
        <div className="mb-6">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-[#33504F]">
            <ArrowLeft className="w-4 h-4" /> Back to products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: gallery + details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="w-full h-[420px] bg-white flex items-center justify-center overflow-hidden">
                <Image
                  src={gallery[0] || '/images/placeholder.png'}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  width={1200}
                />
              </div>

              {gallery.length > 1 && (
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-3">
                    {gallery.map((g, i) => (
                      <motion.div key={i} whileHover={{ scale: 1.02 }} className="h-20 overflow-hidden rounded-md cursor-pointer">
                        <Image src={g} alt={`${product.title} ${i}`} className="w-full h-full object-cover" width={400} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <div className="space-y-4">
              <h1 className="text-2xl font-heading font-semibold text-[#33504F]">{product.title}</h1>
              <div className="text-sm text-[#666]">{product.short_description || product.description || '—'}</div>

              {product.metadata && product.metadata.specifications && (
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="text-lg font-semibold text-[#33504F] mb-2">Specifications</h4>
                  <ul className="space-y-2">
                    {Array.isArray(product.metadata.specifications)
                      ? product.metadata.specifications.map((s, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-[#666]">
                            <CheckCircle className="w-4 h-4 text-[#D7B15B] mt-1" />
                            <span>{s}</span>
                          </li>
                        ))
                      : <li className="text-sm text-[#666]">Specifications available on request.</li>}
                  </ul>
                </div>
              )}

              {product.metadata && product.metadata.details && (
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="text-lg font-semibold text-[#33504F] mb-2">Details</h4>
                  <div className="text-sm text-[#666]">{product.metadata.details}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: summary / CTA */}
          <aside className="space-y-4">
            <Card className="p-6 sticky top-24">
              <CardContent className="p-0">
                <div className="mb-4">
                  <div className="text-sm text-[#666]">Price</div>
                  <div className="text-2xl font-semibold text-[#33504F]">
                    {product.price != null ? `${product.currency || 'USD'} ${product.price}` : 'Price on request'}
                  </div>
                  {product.moq ? <div className="text-xs text-[#666] mt-1">MOQ: {product.moq}</div> : null}
                </div>

                {product.category && (
                  <div className="mb-4">
                    <div className="text-sm text-[#666]">Category</div>
                    <Link to={`/products/category/${product.category.slug}`} className="text-sm text-[#33504F] font-medium">{product.category.name}</Link>
                  </div>
                )}

                <div className="mb-4">
                  <Button className="w-full bg-[#33504F] text-white py-2 rounded" onClick={() => window.alert('Request sample flow — integrate form or modal here')}>
                    Request Sample
                  </Button>
                </div>

                <div className="text-sm text-[#666]">
                  <div>Availability: {product.available_qty == null ? 'Check' : product.available_qty > 0 ? `${product.available_qty} units` : 'Out of stock'}</div>
                  <div className="mt-2">SKU: {product.sku || '—'}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="p-0 text-sm text-[#666]">
                <div className="mb-2 font-semibold text-[#33504F]">Packaging & Shipping</div>
                <div>We support bulk packaging, container optimization and private labeling. Contact us for shipping quotes.</div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      
    </div>
  );
};

export default ProductDetail;
