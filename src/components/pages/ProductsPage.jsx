// src/components/pages/ProductsPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image } from '../ui/image';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Package,
  Shield,
  Award,
  CheckCircle,
  ArrowRight,
  FileText,
  Truck,
  Search,
  Box,
  Container
} from 'lucide-react';

import * as api from '../../lib/api';

const fallbackProducts = [
  { id: 1, title: "Peanuts", description: "Premium groundnuts in various grades", image: "https://static.wixstatic.com/media/a92b5b_062c18c7afda4cce9d104b22566f08d1~mv2.png", varieties: "Bold, Java, Spanish, Valencia", metadata: {} },
  { id: 2, title: "Peanut Butter", description: "Natural and processed peanut butter", image: "https://static.wixstatic.com/media/a92b5b_a530b17c40f84aa7a73b4548329020e8~mv2.png", varieties: "Smooth, Crunchy, Organic", metadata: {} },
  { id: 3, title: "Onion Powder", description: "Dehydrated onion powder with superior flavor", image: "https://static.wixstatic.com/media/a92b5b_4375efd9ba4e40da81e6cae43079c3ef~mv2.png", varieties: "White, Pink, Red", metadata: {} },
];

const packagingOptions = [
  { icon: Box, title: "Bulk Packaging", description: "25kg, 50kg jute", details: "Best for wholesale" },
  { icon: Container, title: "Container Loading", description: "20ft & 40ft optimization", details: "Efficient loading" },
  { icon: Package, title: "Custom Packaging", description: "Private labeling", details: "Retail-ready packs" },
  { icon: Shield, title: "Vacuum Sealed", description: "Extended shelf life", details: "Preserves freshness" }
];

const certifications = [
  { name: "IEC", fullName: "Import Export Code" },
  { name: "MSME", fullName: "MSME Registration" },
  { name: "RCMC", fullName: "Registration Cum Membership Certificate" },
  { name: "GST", fullName: "Goods & Services Tax" },
  { name: "FSSAI", fullName: "Food Safety Authority" }
];

const orderSteps = [
  { step: "01", title: "Inquiry", description: "Tell us your requirements", icon: Search },
  { step: "02", title: "Sample & Quote", description: "Samples and pricing", icon: FileText },
  { step: "03", title: "Order & Delivery", description: "Confirm & ship", icon: Truck }
];

const ProductsPage = () => {
  
  // data
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // categories derived from products
  const [categories, setCategories] = useState([]); // { id, slug, name, count, thumb }
  const [selectedCategory, setSelectedCategory] = useState(null); // category object



  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    api.getProducts().then((list) => {
      if (!mounted) return;
      if (!Array.isArray(list) || list.length === 0) {
        // fallback to local sample
        setProducts(fallbackProducts);
        setFeatured(fallbackProducts[0]);
        // derive categories from fallback (simple grouping)
        const fallbackCats = [{ id: 'fallback', slug: 'general', name: 'General', count: fallbackProducts.length, thumb: fallbackProducts[0].image }];
        setCategories(fallbackCats);
        setSelectedCategory(null);
      } else {
        // transform list to expected product shape (compatibility)
        const normalized = list.map(p => ({
          ...p,
          // image selection for older code paths
          image: p.primary_image || p.og_image || p.image || (p.metadata && p.metadata.image) || '/images/placeholder.png'
        }));
        setProducts(normalized);

        // featured selection
        const f = normalized.find(p => p.featured) || normalized[0];
        setFeatured(f || null);

        // derive categories: unique by id/slug
        const map = new Map();
        normalized.forEach((p) => {
          const cat = p.category;
          if (cat && (cat.id || cat.slug)) {
            const key = cat.id || cat.slug;
            const existing = map.get(key);
            if (existing) {
              existing.count += 1;
              // prefer primary image as thumbnail
              if (!existing.thumb && p.primary_image) existing.thumb = p.primary_image;
            } else {
              map.set(key, {
                id: cat.id || key,
                slug: cat.slug || String(cat.id || key),
                name: cat.name || 'Uncategorized',
                count: 1,
                thumb: p.primary_image || p.og_image || p.image || '/images/placeholder.png'
              });
            }
          }
        });

        const catArray = Array.from(map.values());
        setCategories(catArray);
        setSelectedCategory(null);
      }
    }).catch((err) => {
      console.warn('Failed loading products, falling back to static data', err);
      if (!mounted) return;
      setError(err.message || 'Failed to load products');
      setProducts(fallbackProducts);
      setFeatured(fallbackProducts[0]);
      setCategories([{ id: 'fallback', slug: 'general', name: 'General', count: fallbackProducts.length, thumb: fallbackProducts[0].image }]);
      setSelectedCategory(null);
    }).finally(() => {
      if (!mounted) return;
      setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const handleExplore = (product) => {
    // old behavior kept for non-router fallback
    window.location.hash = `#products-${(product.title || '').replace(/\s+/g, '-').toLowerCase()}`;
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    // update URL (without reload) for shareable link: /products/category/:slug
    try {
      const newUrl = `/products/category/${cat.slug}`;
      window.history.pushState({}, '', newUrl);
    } catch (e) {
      // ignore if pushState fails (older browsers)
    }
    // smooth scroll to category section
    setTimeout(() => {
      const el = document.getElementById('category-products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    try { window.history.pushState({}, '', '/products'); } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (product) => {
    // Try to open product detail route. Many projects use /product/:slug or /products/:slug.
    // We'll try /product/:slug first then fallback to /products/:slug, then fallback to hash.
    const slug = product.slug || (product.title || '').replace(/\s+/g, '-').toLowerCase();
    const tryRoutes = [
      `/product/${slug}`,
      `/products/${slug}`
    ];
    // Try client-side navigation by pushing state and checking if the route exists can't be detected easily here,
    // so just navigate to first path — most apps will handle it (React Router) — and fallback to hash.
    try {
      window.location.href = tryRoutes[0];
    } catch (e) {
      try {
        window.location.href = tryRoutes[1];
      } catch (e2) {
        window.location.hash = `#product-${slug}`;
      }
    }
  };

  // products filtered for selected category
  const productsForSelectedCategory = selectedCategory
    ? products.filter(p => p.category && (p.category.id === selectedCategory.id || p.category.slug === selectedCategory.slug))
    : [];

  return (
    <div className="min-h-screen bg-[#E8E9E2]">
      
      {/* Hero */}
      <section
        className="relative py-20 md:py-28 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(51,80,79,0.7), rgba(51,80,79,0.7)), url('https://static.wixstatic.com/media/a92b5b_e36323f99afc4e2a868ae33bcd7592fa~mv2.png')" }}
        aria-label="Products hero"
      >
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12 text-center text-white">
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold">Our Products</motion.h1>
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="mt-4 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">Premium agricultural products sourced and processed to meet international standards.</motion.p>
        </div>
      </section>

      {/* Loading / Error */}
      <div className="max-w-[100rem] mx-auto px-6 lg:px-12 mt-8">
        {loading && <div className="text-center text-sm text-[#666] py-6">Loading products...</div>}
        {error && <div className="text-center text-sm text-red-600 py-2">Error: {error}</div>}
      </div>

      {/* Categories */}
      <section className="py-12 lg:py-20">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-[#33504F]">Product Categories</h2>
            <p className="text-sm sm:text-base text-[#666666] mt-2">Explore our range of export-ready commodities.</p>
          </div>

          {/* categories grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.length === 0 && <div className="text-sm text-[#666]">No categories available.</div>}
            {categories.map((cat, idx) => (
              <motion.div key={cat.id || cat.slug || idx} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: idx * 0.03 }}>
                <Card className="cursor-pointer overflow-hidden hover:shadow-xl transition-shadow" onClick={() => handleCategoryClick(cat)}>
                  <div className="relative h-36 overflow-hidden">
                    <Image src={cat.thumb || '/images/placeholder.png'} alt={cat.name} width={800} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                    <div className="absolute left-4 bottom-4 text-white">
                      <div className="text-lg font-semibold">{cat.name}</div>
                      <div className="text-xs opacity-90">{cat.count} product{cat.count > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category products list (renders when a category is selected) */}
      <section id="category-products-section" className="py-8 lg:py-12 bg-[#F7F7F5]">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          {selectedCategory ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-heading font-semibold text-[#33504F]">{selectedCategory.name}</h3>
                  <p className="text-sm text-[#666]">{selectedCategory.count} product{selectedCategory.count > 1 ? 's' : ''} in this category</p>
                </div>
                <div>
                  <Button variant="outline" className="border rounded px-3 py-2" onClick={handleClearCategory}>Back to categories</Button>
                </div>
              </div>

              {productsForSelectedCategory.length === 0 ? (
                <div className="text-sm text-[#666] py-8">No products found in this category.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {productsForSelectedCategory.map((product, i) => (
                    <motion.div key={product.id || product.slug || i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: i * 0.03 }}>
                      <Card className="h-full bg-white shadow-md hover:shadow-xl transition-all overflow-hidden">
                        <div className="relative overflow-hidden h-56 sm:h-64">
                          <Image
                            src={product.primary_image || product.og_image || product.image || '/images/placeholder.png'}
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
                            <Button className="bg-[#33504F] text-white py-2 rounded flex items-center gap-2" onClick={() => handleProductClick(product)}>
                              View Details <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" className="border rounded px-3 py-2" onClick={() => window.alert('Request sample flow - integrate as needed')}>Request Sample</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>

      {/* Featured */}
      <section className="py-12 lg:py-20 bg-[#CFD0C8]">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="flex justify-center order-1 lg:order-1"
            >
              <div className="w-full max-w-[560px] rounded-2xl overflow-hidden shadow-lg z-0 bg-white">
                <Image
                  src={featured?.primary_image || featured?.og_image || featured?.image || '/images/placeholder.png'}
                  alt={featured?.title || 'Featured product'}
                  width={800}
                  className="w-full h-auto block object-contain"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative z-10 order-2 lg:order-2"
            >
              <h3 className="text-2xl font-heading font-semibold text-[#33504F] mb-3">{featured?.title || 'Featured Product'}</h3>
              <div className="w-12 h-1 bg-[#D7B15B] mb-4" />
              <p className="text-base text-[#666666] mb-6">{featured?.short_description || featured?.description || 'Explore our top quality products.'}</p>

              {featured?.metadata?.specifications ? (
                <div className="bg-white rounded-xl p-4 mb-6 shadow">
                  <h4 className="text-lg font-heading font-semibold text-[#33504F] mb-3">Specifications</h4>
                  <ul className="space-y-2">
                    {Array.isArray(featured.metadata.specifications) ? featured.metadata.specifications.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#666666]">
                        <CheckCircle className="w-5 h-5 text-[#D7B15B] mt-1 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    )) : <li className="text-sm text-[#666666]">Specifications available on request.</li>}
                  </ul>
                </div>
              ) : null}

              <Button className="bg-[#D7B15B] text-[#33504F] py-3 px-6 rounded-lg font-semibold">Request Sample</Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quality & Packaging */}
      <section className="py-12 lg:py-20">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <h3 className="text-2xl font-heading font-semibold text-[#33504F] mb-4">Quality & Grading Standards</h3>
              <p className="text-sm text-[#666666] mb-6">We maintain stringent quality control from sourcing to packaging.</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#D7B15B] rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div>
                  <span className="text-sm text-[#666666]">Rigorous QC at every stage</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#D7B15B] rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div>
                  <span className="text-sm text-[#666666]">State-of-the-art sorting</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#D7B15B] rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div>
                  <span className="text-sm text-[#666666]">Lab testing for moisture & oil</span>
                </li>
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <h4 className="text-xl font-heading font-semibold text-[#33504F] mb-4">Packaging Options</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {packagingOptions.map((opt, i) => (
                  <Card key={i} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#D7B15B]/10 rounded-full flex items-center justify-center"><opt.icon className="w-6 h-6 text-[#D7B15B]" /></div>
                        <div>
                          <h5 className="text-sm font-semibold text-[#33504F]">{opt.title}</h5>
                          <p className="text-xs text-[#666666]">{opt.description}</p>
                          <div className="text-xs text-[#D7B15B] mt-1">{opt.details}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certifications & How to Order */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="text-center mb-8">
            <h4 className="text-xl font-heading font-semibold text-[#33504F]">Certified & Compliant</h4>
            <p className="text-sm text-[#666666] mt-2">Our certifications ensure quality and compliance with global standards.</p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
            {certifications.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: i * 0.04 }}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#D7B15B]/10 rounded-full flex items-center justify-center mx-auto mb-2"><Award className="w-8 h-8 text-[#D7B15B]" /></div>
                  <div className="text-sm font-semibold text-[#33504F]">{c.name}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-[#D7B15B] transform -translate-y-1/2 z-0" />
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {orderSteps.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.06 }} className="text-center">
                  <div className="bg-white rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-lg border-4 border-[#D7B15B]"><step.icon className="w-8 h-8 text-[#33504F]" /></div>
                  <div className="bg-[#D7B15B] text-white rounded-full w-8 h-8 mx-auto mb-4 flex items-center justify-center text-sm font-bold">{step.step}</div>
                  <h5 className="text-lg font-heading font-semibold text-[#33504F] mb-2">{step.title}</h5>
                  <p className="text-sm text-[#666666]">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 lg:py-16 bg-[#33504F] text-white">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12 text-center">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-semibold mb-3">Ready to Source Premium Products?</h3>
          <p className="text-sm sm:text-base text-white/90 mb-6">Connect with us to request samples, catalogs, or quotes.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-[#D7B15B] text-[#33504F] px-6 py-2 rounded font-semibold">Request Catalog</Button>
            <Button variant="outline" className="border-2 border-white text-white px-6 py-2 rounded font-semibold">Get Quote</Button>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default ProductsPage;
