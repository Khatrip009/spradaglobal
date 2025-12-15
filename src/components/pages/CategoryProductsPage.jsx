import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package } from "lucide-react";
import { Image } from "../ui/image";

export default function CategoryProductsModal({
  open,
  onClose,
  category,
  products = [],
}) {
  // lock scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, [open]);

  // esc close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MODAL */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl 
                         max-w-6xl w-full max-h-[90vh] overflow-hidden"
              layout
            >
              {/* HEADER */}
              <div className="relative h-56">
                <Image
                  src={category?.image || "/images/category-placeholder.jpg"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60" />

                <div className="relative z-10 p-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {category?.name}
                    </h2>
                    <p className="text-white/90 text-sm mt-1">
                      Export-grade products from verified manufacturers
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="bg-white/90 hover:bg-white rounded-full p-2"
                  >
                    <X className="w-6 h-6 text-slate-700" />
                  </button>
                </div>
              </div>

              {/* PRODUCTS */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-14rem)]">
                {products.length === 0 ? (
                  <div className="text-center text-slate-500 py-20">
                    No products found.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p, i) => (
                      <motion.div
                        key={p.id || i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -6 }}
                        className="group border rounded-2xl overflow-hidden 
                                   hover:shadow-xl transition"
                      >
                        {/* IMAGE */}
                        <div className="relative h-44 overflow-hidden">
                          <Image
                            src={p.image || "/images/product-placeholder.jpg"}
                            className="w-full h-full object-cover 
                                       group-hover:scale-110 transition duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-white p-2 
                                          rounded-full shadow">
                            <Package className="w-4 h-4 text-[#164946]" />
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="p-4">
                          <h3 className="font-bold text-[#164946] mb-1">
                            {p.name || p.title}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {p.short_description ||
                              p.description ||
                              "High-quality export product."}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
