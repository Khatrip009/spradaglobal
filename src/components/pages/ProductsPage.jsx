// src/components/pages/ProductsPage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "../ui/image";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
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
  Container as ContainerIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as api from "../../lib/api";
import { makeAbsoluteUrl } from "../../lib/urlHelpers";

const fallbackProducts = [
  { id: 1, title: "Peanuts", description: "Premium groundnuts in various grades", image: "https://static.wixstatic.com/media/a92b5b_062c18c7afda4cce9d104b22566f08d1~mv2.png", metadata: {} },
  { id: 2, title: "Peanut Butter", description: "Natural and processed peanut butter", image: "https://static.wixstatic.com/media/a92b5b_a530b17c40f84aa7a73b4548329020e8~mv2.png", metadata: {} },
  { id: 3, title: "Onion Powder", description: "Dehydrated onion powder with superior flavor", image: "https://static.wixstatic.com/media/a92b5b_4375efd9ba4e40da81e6cae43079c3ef~mv2.png", metadata: {} },
];

const TRADE_OPTIONS = [
  { key: "", label: "All" },
  { key: "import", label: "Import" },
  { key: "export", label: "Export" },
  { key: "both", label: "Both" },
];

function initialsFromName(name = "") {
  return String(name)
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ProductsPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [selectedTradeType, setSelectedTradeType] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(24);

  // load categories once
  useEffect(() => {
    let mounted = true;
    api
      .getCategories({ include_counts: true, limit: 200 })
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.categories) ? res.categories : (Array.isArray(res) ? res : []);
        const normalized = list.map((c, idx) => {
          const name = c?.name || c?.title || c?.slug || `Category ${idx + 1}`;
          const slug =
            c?.slug || (typeof name === "string" ? name.toLowerCase().replace(/\s+/g, "-") : `${idx}`);
          const id = c?.id || slug || idx;
          const thumbRaw =
            c?.thumb || c?.image || (c?.metadata && (c.metadata.thumb || c.metadata.image)) || null;
          const thumb = thumbRaw ? makeAbsoluteUrl(thumbRaw) : null;
          return {
            id,
            slug,
            name,
            count: Number(c?.product_count ?? c?.count ?? 0),
            thumb,
            trade_type: c?.trade_type || c?.tradeType || null,
          };
        });
        setCategories(normalized);
      })
      .catch((err) => {
        console.warn("[ProductsPage] failed fetch categories", err);
        setCategories([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function fetchProductsFor(categorySlug = null, pageArg = 1, tradeType = "") {
    setLoading(true);
    setError(null);
    try {
      const opts = {};
      if (pageArg) opts.page = pageArg;
      if (limit) opts.limit = limit;
      if (categorySlug) opts.category_slug = categorySlug;
      if (tradeType) opts.trade_type = tradeType;

      const res = await api.getProducts(opts);
      const list = Array.isArray(res?.products) ? res.products : (Array.isArray(res) ? res : []);
      if (!Array.isArray(list) || list.length === 0) {
        setProducts(fallbackProducts);
        setFeatured(fallbackProducts[0]);
        if (!categories || categories.length === 0) {
          setCategories([
            {
              id: "fallback",
              slug: "general",
              name: "General",
              count: fallbackProducts.length,
              thumb: fallbackProducts[0].image,
              trade_type: "both",
            },
          ]);
        }
        setLoading(false);
        return;
      }

      const normalized = list.map((p) => {
        const raw =
          p.primary_image ||
          p.og_image ||
          p.image ||
          (p.metadata && (p.metadata.image || p.metadata.og_image)) ||
          null;
        const primary_image = raw ? makeAbsoluteUrl(raw) : null;
        const product_trade_type = p.trade_type == null ? null : String(p.trade_type);
        const effective_trade_type = p.effective_trade_type || product_trade_type || (p.category && p.category.trade_type) || "both";
        const categoryObj = p.category
          ? {
              id: p.category.id || p.category.slug || null,
              slug:
                p.category.slug || (p.category.name ? String(p.category.name).toLowerCase().replace(/\s+/g, "-") : null),
              name: p.category.name || p.category.slug || "Category",
              trade_type: p.category.trade_type || p.category.tradeType || null,
            }
          : null;

        return { ...p, primary_image, trade_type: product_trade_type, effective_trade_type, category: categoryObj };
      });

      setProducts(normalized);
      const f = normalized.find((pp) => pp.featured) || normalized[0];
      setFeatured(f || null);

      // merge category counts if needed (only when categories exist)
      try {
        const counts = {};
        normalized.forEach((p) => {
          if (p.category && (p.category.id || p.category.slug)) {
            const key = p.category.id || p.category.slug;
            counts[key] = (counts[key] || 0) + 1;
          }
        });
        setCategories((prev) => {
          if (!prev || prev.length === 0) {
            const map = new Map();
            normalized.forEach((p) => {
              if (p.category && (p.category.id || p.category.slug)) {
                const key = p.category.id || p.category.slug;
                if (!map.has(key)) {
                  map.set(key, {
                    id: key,
                    slug: p.category.slug || key,
                    name: p.category.name || p.category.slug || "Category",
                    count: 0,
                    thumb: p.primary_image || null,
                    trade_type: p.category?.trade_type || p.effective_trade_type || "both",
                  });
                }
                map.get(key).count += 1;
              }
            });
            return Array.from(map.values());
          }
          return prev.map((c) => {
            const key = c.id || c.slug;
            return {
              ...c,
              count: counts[key] != null ? counts[key] : c.count || 0,
              thumb:
                c.thumb ||
                normalized.find((p) => p.category && (p.category.id === key || p.category.slug === key))?.primary_image ||
                c.thumb,
            };
          });
        });
      } catch (mergeErr) {
        console.warn("[ProductsPage] category merge failed", mergeErr);
      }
    } catch (err) {
      console.warn("Failed loading products, falling back to static data", err);
      setError(err && err.message ? err.message : "Failed to load products");
      setProducts(fallbackProducts);
      setFeatured(fallbackProducts[0]);
      if (!categories || categories.length === 0) {
        setCategories([
          { id: "fallback", slug: "general", name: "General", count: fallbackProducts.length, thumb: fallbackProducts[0].image, trade_type: "both" },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProductsFor(selectedCategory ? selectedCategory.slug : null, page, selectedTradeType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedTradeType, selectedCategory]);

  const handleTradeTypeChange = (key) => {
    setSelectedTradeType(key);
    setPage(1);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    try {
      navigate(`/products/category/${cat.slug}`);
    } catch (e) {
      try {
        window.history.pushState({}, "", `/products/category/${cat.slug}`);
      } catch {}
    }
    setPage(1);
    setTimeout(() => {
      const el = document.getElementById("category-products-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    try {
      navigate("/products");
    } catch (e) {
      try {
        window.history.pushState({}, "", "/products");
      } catch {}
    }
    setPage(1);
  };

  const handleProductClick = (product) => {
    const slug = product.slug || (product.title || "").replace(/\s+/g, "-").toLowerCase();
    try {
      navigate(`/products/${slug}`);
    } catch (e) {
      try {
        window.location.href = `/products/${slug}`;
      } catch {
        window.location.hash = `#product-${slug}`;
      }
    }
  };

  const productsForSelectedCategory = selectedCategory
    ? products.filter((p) => p.category && (p.category.id === selectedCategory.id || p.category.slug === selectedCategory.slug))
    : [];

  const displayTradeType = (p) => p.trade_type || p.effective_trade_type || p.category?.trade_type || "both";

  return (
    <div className="min-h-screen bg-[#E8E9E2]">
      <section
        className="relative py-20 md:py-28 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(51,80,79,0.7), rgba(51,80,79,0.7)), url('https://static.wixstatic.com/media/a92b5b_e36323f99afc4e2a868ae33bcd7592fa~mv2.png')",
        }}
        aria-label="Products hero"
      >
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12 text-center text-white">
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold">
            Our Products
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="mt-4 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
            Premium agricultural products sourced and processed to meet international standards.
          </motion.p>
        </div>
      </section>

      <div className="max-w-[100rem] mx-auto px-6 lg:px-12 mt-8">
        {loading && <div className="text-center text-sm text-[#666] py-6">Loading products...</div>}
        {error && <div className="text-center text-sm text-red-600 py-2">Error: {error}</div>}
      </div>

      <section className="py-12 lg:py-20">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-[#33504F]">Product Categories</h2>
              <p className="text-sm sm:text-base text-[#666666] mt-2">Explore our range of export-ready commodities.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-[#666] mr-2">Filter by trade type:</div>
              <div className="inline-flex gap-2">
                {TRADE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key === "" ? "all" : opt.key}
                    onClick={() => handleTradeTypeChange(opt.key)}
                    className={`text-sm px-3 py-2 rounded ${selectedTradeType === opt.key ? "bg-[#33504F] text-white" : "bg-white border"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(!categories || categories.length === 0) && <div className="text-sm text-[#666]">No categories available.</div>}
            {categories.map((cat, idx) => {
              const hasThumb = !!cat.thumb;
              return (
                <motion.div key={cat.id || cat.slug || idx} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: idx * 0.03 }}>
                  <Card className="cursor-pointer overflow-hidden hover:shadow-xl transition-shadow" onClick={() => handleCategoryClick(cat)}>
                    <div className="relative h-36 overflow-hidden flex items-stretch">
                      {hasThumb ? (
                        <Image src={cat.thumb} alt={cat.name} width={800} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#E6EAE2,#D7D9D0)" }}>
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-[#D7B15B] flex items-center justify-center mx-auto mb-2">
                              <span className="text-white font-bold">{initialsFromName(cat.name)}</span>
                            </div>
                            <div className="text-sm font-semibold text-[#33504F]">{cat.name}</div>
                          </div>
                        </div>
                      )}
                      <div className="absolute left-4 bottom-4 text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                        {hasThumb && (
                          <>
                            <div className="text-lg font-semibold">{cat.name}</div>
                            <div className="text-xs opacity-90">{(cat.count || 0)} product{(cat.count || 0) > 1 ? "s" : ""}</div>
                            {cat.trade_type && <div className="text-xs opacity-90 mt-1">Trade: {cat.trade_type}</div>}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="category-products-section" className="py-8 lg:py-12 bg-[#F7F7F5]">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          {selectedCategory ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-heading font-semibold text-[#33504F]">{selectedCategory.name}</h3>
                  <p className="text-sm text-[#666]">{selectedCategory.count} product{selectedCategory.count > 1 ? "s" : ""} in this category</p>
                  {selectedCategory.trade_type && <p className="text-xs text-[#666]">Category trade type: {selectedCategory.trade_type}</p>}
                  {selectedTradeType !== "" && <p className="text-xs text-[#666] mt-1">Filtered by: {selectedTradeType}</p>}
                </div>
                <div>
                  <Button variant="outline" className="border rounded px-3 py-2" onClick={handleClearCategory}>
                    Back to categories
                  </Button>
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
                            src={product.primary_image || product.og_image || product.image || "/images/placeholder.png"}
                            alt={product.title}
                            width={800}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>

                        <CardContent className="p-6">
                          <h4 className="text-lg font-semibold text-[#33504F] mb-2">{product.title}</h4>
                          <p className="text-sm text-[#666666] mb-2">{product.short_description || product.description || "—"}</p>
                          <div className="mb-3 text-xs text-[#555]">
                            <strong>Trade:</strong> {displayTradeType(product)}
                          </div>

                          <div className="flex gap-3">
                            <Button className="bg-[#33504F] text-white py-2 rounded flex items-center gap-2" onClick={() => handleProductClick(product)}>
                              View Details <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" className="border rounded px-3 py-2" onClick={() => window.alert("Request sample flow - integrate as needed")}>
                              Request Sample
                            </Button>
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

      <section className="py-12 lg:py-20 bg-[#CFD0C8]">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="flex justify-center order-1 lg:order-1">
              <div className="w-full max-w-[560px] rounded-2xl overflow-hidden shadow-lg z-0 bg-white">
                <Image src={featured?.primary_image || featured?.og_image || featured?.image || "/images/placeholder.png"} alt={featured?.title || "Featured product"} width={800} className="w-full h-auto block object-contain" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="relative z-10 order-2 lg:order-2">
              <h3 className="text-2xl font-heading font-semibold text-[#33504F] mb-3">{featured?.title || "Featured Product"}</h3>
              <div className="w-12 h-1 bg-[#D7B15B] mb-4" />
              <p className="text-base text-[#666666] mb-6">{featured?.short_description || featured?.description || "Explore our top quality products."}</p>
              <Button className="bg-[#D7B15B] text-[#33504F] py-3 px-6 rounded-lg font-semibold">Request Sample</Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
