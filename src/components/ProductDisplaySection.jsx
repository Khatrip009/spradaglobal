// src/components/ProductDisplaySection.jsx – Simplified
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getProducts, toAbsoluteImageUrl } from "@/lib/api";

function ProductCard({ product, onQuickView }) {
  const image = toAbsoluteImageUrl(product.primary_image) || "https://placehold.co/600x420/f1f5f9/334155?text=Product";
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl overflow-hidden"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={() => onQuickView(product)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
        >
          <span className="px-6 py-2 bg-white text-slate-900 rounded-full font-semibold shadow-xl">
            Quick View
          </span>
        </button>
      </div>
      <div className="p-6 text-center relative z-10">
        <h3 className="text-xl font-black text-slate-900 mb-2">{product.title}</h3>
        <p className="text-sm text-slate-600 line-clamp-3 mb-4">
          {product.short_description || "Export-grade product"}
        </p>
        <Link to={`/products/${product.slug}`} className="inline-block font-bold text-teal-700 hover:underline">
          View Details →
        </Link>
      </div>
    </motion.div>
  );
}

export default function ProductDisplay() {
  const [tradeType, setTradeType] = useState("export");
  const [products, setProducts] = useState([]);
  const [quickView, setQuickView] = useState(null);

  useEffect(() => {
    getProducts({ limit: 20, trade_type: tradeType })
      .then(res => setProducts(res.products || []))
      .catch(console.error);
  }, [tradeType]);

  return (
    <div className="relative py-32 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 mb-10">
          What We {tradeType === "export" ? "Export" : "Import"}
        </h2>
        <div className="flex justify-center gap-4 mb-20">
          {["export", "import"].map(t => (
            <button
              key={t}
              onClick={() => setTradeType(t)}
              className={`px-8 py-3 rounded-full font-bold text-lg transition ${
                tradeType === t ? "bg-emerald-600 text-white shadow-xl" : "bg-white/70 text-slate-700 hover:bg-white"
              }`}
            >
              {t === "export" ? "Export Products" : "Import Products"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
          ))}
        </div>
      </div>
      {quickView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden">
            <img
              src={toAbsoluteImageUrl(quickView.primary_image) || "https://placehold.co/800x500"}
              alt=""
              className="w-full h-64 object-cover"
            />
            <div className="p-8">
              <h2 className="text-3xl font-black mb-4">{quickView.title}</h2>
              <p className="text-slate-600 mb-6">{quickView.description || "Premium export-quality product."}</p>
              <div className="flex justify-between">
                <Link to={`/products/${quickView.slug}`} className="font-bold text-teal-700 hover:underline">
                  Full Details →
                </Link>
                <button onClick={() => setQuickView(null)} className="px-6 py-2 bg-slate-100 rounded-full hover:bg-slate-200">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}