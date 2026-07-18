// src/components/ProductDetailHero.jsx – Simplified
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Globe, Package, CheckCircle } from "lucide-react";
import { toAbsoluteImageUrl } from "@/lib/api";

export default function ProductDetailHero({ product, onRequestQuote }) {
  const heroImage = toAbsoluteImageUrl(product?.primary_image) || "https://placehold.co/1600x900?text=Product";

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img src={heroImage} alt={product?.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 grid lg:grid-cols-2 gap-14">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center"
        >
          <span className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#d7b15b] mb-4">
            <Globe className="w-4 h-4" />
            {product?.trade_type || "Global Trade"}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            {product?.title}
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mb-8">
            {product?.short_description || product?.description}
          </p>
          <div className="flex flex-wrap gap-4 mb-10">
            <MetaPill icon={Package} label={`MOQ: ${product?.moq || 1}`} />
            <MetaPill icon={CheckCircle} label="Export Grade" />
            <MetaPill icon={Globe} label="Worldwide Shipping" />
          </div>
          <button
            onClick={onRequestQuote}
            className="px-8 py-4 rounded-xl bg-[#d7b15b] text-black font-extrabold shadow-[0_25px_70px_rgba(215,177,91,0.4)] hover:shadow-[0_40px_120px_rgba(215,177,91,0.6)] transition"
          >
            Enquire Now
          </button>
        </motion.div>

        {/* Optionally keep thumbnails if you want */}
        <div className="hidden lg:block" />
      </div>
    </section>
  );
}

function MetaPill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-sm text-white">
      <Icon className="w-4 h-4 text-[#d7b15b]" />
      {label}
    </span>
  );
}