import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Package,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { toAbsoluteImageUrl } from "@/lib/api";

/* =====================================================
   MAIN HERO
===================================================== */

export default function ProductDetailHero({
  product,
  onRequestQuote
}) {
  const images = useMemo(() => {
    const arr = [];

    if (product?.primary_image) {
      arr.push(toAbsoluteImageUrl(product.primary_image));
    }

    if (Array.isArray(product?.images)) {
      product.images.forEach(i => {
        if (i?.url) arr.push(toAbsoluteImageUrl(i.url));
      });
    }

    return arr.length ? arr : ["/img/product-placeholder.jpg"];
  }, [product]);

  const [active, setActive] = useState(0);

  /* Auto-advance */
  useEffect(() => {
    const t = setInterval(() => {
      setActive(i => (i + 1) % images.length);
    }, 6000);
    return () => clearInterval(t);
  }, [images.length]);

  function prev() {
    setActive(i => (i - 1 + images.length) % images.length);
  }

  function next() {
    setActive(i => (i + 1) % images.length);
  }

  return (
    <section className="relative min-h-[100vh] overflow-hidden bg-black">
      {/* BACKGROUND GALLERY */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {images.map((src, i) =>
            i === active ? (
              <motion.div
                key={src}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 1.6 },
                  scale: { duration: 7, ease: "linear" }
                }}
              >
                <img
                  src={src}
                  alt={product?.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 grid lg:grid-cols-2 gap-14">
        {/* LEFT — Product Info */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
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

          {/* Meta Pills */}
          <div className="flex flex-wrap gap-4 mb-10">
            <MetaPill icon={Package} label={`MOQ: ${product?.moq || 1}`} />
            <MetaPill icon={CheckCircle} label="Export Grade" />
            <MetaPill icon={Globe} label="Worldwide Shipping" />
          </div>

          {/* CTA — ONLY ONE BUTTON */}
          <div className="flex">
            <button
              onClick={onRequestQuote}
              className="
                px-8 py-4 rounded-xl
                bg-[#d7b15b] text-black
                font-extrabold
                shadow-[0_25px_70px_rgba(215,177,91,0.4)]
                hover:shadow-[0_40px_120px_rgba(215,177,91,0.6)]
                transition
              "
            >
              Enquire Now
            </button>
          </div>
        </motion.div>

        {/* RIGHT — Thumbnail Filmstrip */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative flex flex-col justify-center"
        >
          {/* Controls */}
          <div className="absolute -top-10 right-0 flex gap-3">
            <IconButton onClick={prev}>
              <ArrowLeft />
            </IconButton>
            <IconButton onClick={next}>
              <ArrowRight />
            </IconButton>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((src, i) => (
              <motion.button
                key={src}
                onClick={() => setActive(i)}
                whileHover={{ scale: 1.08 }}
                className={`
                  relative w-32 h-20 rounded-xl overflow-hidden flex-shrink-0
                  ${i === active ? "ring-4 ring-[#d7b15b]" : "opacity-60"}
                `}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =====================================================
   SUB COMPONENTS
===================================================== */

function MetaPill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-sm text-white">
      <Icon className="w-4 h-4 text-[#d7b15b]" />
      {label}
    </span>
  );
}

function IconButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-11 h-11 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition"
    >
      {children}
    </button>
  );
}
