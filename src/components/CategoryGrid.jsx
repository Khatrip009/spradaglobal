// src/components/CategoryGrid.jsx – Simplified
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { getCategories, getProducts, toAbsoluteImageUrl } from "@/lib/api";

function buildCategoryData(products = []) {
  const map = {};
  const sorted = [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  for (const p of sorted) {
    const cid = p.category_id;
    if (!cid) continue;
    if (!map[cid]) {
      map[cid] = {
        heroProduct: p,
        fallbackImage: p.primary_image ? toAbsoluteImageUrl(p.primary_image) : null,
        products: []
      };
    }
    if (map[cid].products.length < 3 && p.primary_image) {
      map[cid].products.push({
        id: p.id,
        title: p.title,
        image: toAbsoluteImageUrl(p.primary_image)
      });
    }
  }
  return map;
}

function CategoryCard({ category, data }) {
  const heroImage = toAbsoluteImageUrl(category.image) ||
    data?.fallbackImage ||
    "/img/category-placeholder.jpg";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="mb-10 break-inside-avoid"
    >
      <Link to={`/products/category/${category.slug}`}>
        <div className="relative rounded-[28px] overflow-hidden bg-[#0b1f1e] shadow-lg">
          <div className="relative h-[300px] overflow-hidden">
            <img
              src={heroImage}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>
          <div className="relative p-6">
            <h3 className="text-2xl font-bold text-white">{category.name}</h3>
            <span className="inline-block mt-2 text-xs font-semibold uppercase px-3 py-1 rounded-full bg-[#d7b15b] text-black">
              {category.trade_type}
            </span>
          </div>
          {data?.products?.length > 0 && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full hover:translate-y-0 transition-transform duration-300 bg-black/85 backdrop-blur-xl p-4">
              <p className="text-xs text-[#d7b15b] mb-2 tracking-wide">FEATURED PRODUCTS</p>
              <div className="flex gap-3">
                {data.products.map(p => (
                  <img key={p.id} src={p.image} alt={p.title} className="w-16 h-16 rounded-xl object-cover ring-1 ring-white/20" />
                ))}
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tradeType, setTradeType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCategories({ limit: 100 }),
      getProducts({ limit: 400 })
    ])
      .then(([c, p]) => {
        setCategories(Array.isArray(c) ? c : c.categories || []);
        setProducts(Array.isArray(p) ? p : p.products || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const dataMap = useMemo(() => buildCategoryData(products), [products]);
  const filtered = useMemo(() => {
    if (tradeType === "all") return categories;
    return categories.filter(c => c.trade_type === tradeType);
  }, [categories, tradeType]);

  if (loading) return <div className="py-40 text-center text-gray-400">Loading categories…</div>;

  return (
    <section className="px-6 py-28 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold">
          <span className="text-[#164946]">Explore</span>{" "}
          <span className="text-[#d7b15b]">Categories</span>
        </h2>
        <select
          value={tradeType}
          onChange={e => setTradeType(e.target.value)}
          className="px-5 py-2 rounded-xl bg-black text-white border border-white/20 shadow-xl"
        >
          <option value="all">All Trade Types</option>
          <option value="export">Export</option>
          <option value="import">Import</option>
          <option value="both">Both</option>
        </select>
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-10">
        {filtered.map(cat => (
          <CategoryCard key={cat.id} category={cat} data={dataMap[cat.id]} />
        ))}
      </div>
    </section>
  );
}