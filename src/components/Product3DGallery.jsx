import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toAbsoluteImageUrl } from "@/lib/api";

/* =====================================================
   PRODUCT IMAGE GALLERY (PRODUCTION FINAL)
   - Main image
   - Thumbnails below
   - Optional Request Quote CTA
===================================================== */

export default function ProductImageGallery({
  images = [],
  onRequestQuote
}) {
  const safeImages = images.length
    ? images.map(toAbsoluteImageUrl)
    : ["/img/product-placeholder.jpg"];

  const [active, setActive] = useState(0);

  return (
    <div className="w-full">
      {/* MAIN IMAGE */}
      <div className="relative rounded-2xl overflow-hidden bg-white shadow">
        <AnimatePresence mode="wait">
          <motion.img
            key={safeImages[active]}
            src={safeImages[active]}
            alt=""
            className="w-full h-[420px] object-contain bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        </AnimatePresence>
      </div>

      {/* THUMBNAILS */}
      {safeImages.length > 1 && (
        <div className="mt-4 flex justify-center gap-3 flex-wrap">
          {safeImages.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`
                w-20 h-14 rounded-lg overflow-hidden border transition
                ${
                  i === active
                    ? "border-[#D7B15B] ring-2 ring-[#D7B15B]"
                    : "border-gray-200 hover:border-gray-400"
                }
              `}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover bg-white"
              />
            </button>
          ))}
        </div>
      )}

      {/* REQUEST QUOTE CTA */}
      {onRequestQuote && (
        <div className="mt-8 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRequestQuote}
            className="
              px-6 py-3 rounded-xl
              bg-[#D7B15B] text-[#164946]
              font-extrabold
              shadow-md
              hover:shadow-lg
              transition
            "
          >
            Request Quote
          </motion.button>
        </div>
      )}
    </div>
  );
}
