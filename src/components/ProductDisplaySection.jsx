import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  LayoutGroup,
} from "framer-motion";
import { Link } from "react-router-dom";

import { getProducts } from "@/lib/api";
import { makeAbsoluteUrl } from "@/lib/urlHelpers";

/* ======================================================
   IMAGE NORMALIZER
====================================================== */
function resolveProductImage(p) {
  if (!p) return null;

  // ✅ 1. Primary image from API (MOST IMPORTANT)
  if (p.primary_image) {
    return p.primary_image;
  }

  // ✅ 2. If images array exists (used in single-product pages)
  if (Array.isArray(p.images) && p.images.length > 0) {
    const primary =
      p.images.find(i => i.is_primary) || p.images[0];
    return primary?.url || null;
  }

  return null;
}





/* ======================================================
   MAGNETIC + TILT CARD
====================================================== */
const MagneticTilt = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, { stiffness: 300, damping: 40 });
  const sy = useSpring(y, { stiffness: 300, damping: 40 });

  const rotateX = useTransform(sy, [-80, 80], [6, -6]);
  const rotateY = useTransform(sx, [-80, 80], [-6, 6]);

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.6);
    y.set((e.clientY - r.top - r.height / 2) * 0.6);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ======================================================
   PRODUCT CARD
====================================================== */
const ProductCard = ({ product, onQuickView }) => {
  const image =
    resolveProductImage(product) ||
    "https://placehold.co/600x420/f1f5f9/334155?text=Product";

  const title =
    product.title || product.name || product.product_name || "Product";

  const mx = useMotionValue(50);
  const my = useMotionValue(50);

  function onMouseMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  }

  return (
    <MagneticTilt className="relative">
      <motion.div
        onMouseMove={onMouseMove}
        initial={{ opacity: 0, y: 80, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        whileHover={{ y: -16 }}
        className="relative group rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl hover:shadow-2xl overflow-hidden"
      >
        {/* GPU SPOTLIGHT */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition"
          style={{
            background: useTransform(
              [mx, my],
              ([x, y]) =>
                `radial-gradient(600px at ${x}% ${y}%, rgba(20,184,166,0.18), transparent 60%)`
            ),
          }}
        />

        {/* IMAGE */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition" />

          <button
            onClick={() => onQuickView(product)}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="opacity-0 group-hover:opacity-100 px-6 py-2 bg-white text-slate-900 rounded-full font-semibold shadow-xl transition">
              Quick View
            </span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 text-center relative z-10">
          <h3 className="text-xl font-black text-slate-900 mb-2">
            {title}
          </h3>

          <p className="text-sm text-slate-600 line-clamp-3 mb-4">
            {product.short_description ||
              product.description ||
              "Export-grade product"}
          </p>

          <Link
            to={`/products/${product.slug || product.id}`}
            className="inline-block font-bold text-teal-700 hover:underline"
          >
            View Details →
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
      </motion.div>
    </MagneticTilt>
  );
};

/* ======================================================
   QUICK VIEW MODAL
====================================================== */
const ProductQuickView = ({ product, onClose }) => {
  if (!product) return null;

  const image =
    resolveProductImage(product) ||
    "https://placehold.co/800x500";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          transition={{ type: "spring", damping: 18 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden"
        >
          <img src={image} alt="" className="w-full h-64 object-cover" />

          <div className="p-8">
            <h2 className="text-3xl font-black mb-4">
              {product.title || product.name}
            </h2>

            <p className="text-slate-600 mb-6">
              {product.description ||
                product.short_description ||
                "Premium export-quality product."}
            </p>

            <div className="flex justify-between">
              <Link
                to={`/products/${product.slug || product.id}`}
                className="font-bold text-teal-700 hover:underline"
              >
                Full Details →
              </Link>

              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-100 rounded-full hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ======================================================
   MAIN DISPLAY
====================================================== */
const ProductDisplay = () => {
  const [tradeType, setTradeType] = useState("export");
  const [products, setProducts] = useState([]);
  const [quickView, setQuickView] = useState(null);

  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    getProducts({ limit: 20 }).then((res) => {
      const list = res?.products || [];
      setProducts(list.filter((p) => p.trade_type === tradeType));
    });
  }, [tradeType]);

  return (
    <LayoutGroup>
      <div className="relative py-32 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 overflow-hidden">

        <motion.div
          style={{ y: bgY }}
          className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-teal-200/30 blur-[140px] rounded-full"
        />
        <motion.div
          style={{ y: bgY }}
          className="absolute top-1/2 -left-40 w-[30rem] h-[30rem] bg-emerald-200/30 blur-[120px] rounded-full"
        />

        <div className="relative max-w-7xl mx-auto">

          <motion.h2
            layout
            className="text-center text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 mb-10"
          >
            What We {tradeType === "export" ? "Export" : "Import"}
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-slate-600 font-light max-w-3xl mx-auto mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Explore a wide range of products across multiple industries, carefully
            selected and handled to meet global market expectations.
          </motion.p>

          <div className="flex justify-center gap-4 mb-20">
            {["export", "import"].map((t) => (
              <motion.button
                key={t}
                layout
                onClick={() => setTradeType(t)}
                className={`px-8 py-3 rounded-full font-bold text-lg transition ${
                  tradeType === t
                    ? "bg-emerald-600 text-white shadow-xl"
                    : "bg-white/70 text-slate-700 hover:bg-white"
                }`}
              >
                {t === "export" ? "Export Products" : "Import Products"}
              </motion.button>
            ))}
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12"
          >
            {products.map((p) => (
              <ProductCard
                key={p.id || p.slug}
                product={p}
                onQuickView={setQuickView}
              />
            ))}
          </motion.div>
        </div>

        <ProductQuickView
          product={quickView}
          onClose={() => setQuickView(null)}
        />
      </div>
    </LayoutGroup>
  );
};

export default ProductDisplay;
  