// src/components/ProductImageGallery.jsx
import React, { useState } from "react";
import { toAbsoluteImageUrl } from "@/lib/api";

/* =====================================================
   PRODUCT IMAGE GALLERY – Simplified
   - No framer-motion, pure CSS transitions
   - Lightweight and fast
===================================================== */

export default function ProductImageGallery({
  images = [],
  onRequestQuote
}) {
  // Convert all image URLs to absolute Supabase URLs
  const safeImages = images.length
    ? images.map(url => toAbsoluteImageUrl(url) || "/img/product-placeholder.jpg")
    : ["/img/product-placeholder.jpg"];

  const [active, setActive] = useState(0);

  return (
    <div className="w-full">
      {/* MAIN IMAGE */}
      <div className="relative rounded-2xl overflow-hidden bg-white shadow">
        <img
          key={safeImages[active]}
          src={safeImages[active]}
          alt="Product"
          className="w-full h-[420px] object-contain bg-white transition-opacity duration-300"
          onError={(e) => (e.currentTarget.src = "/img/product-placeholder.jpg")}
        />
      </div>

      {/* THUMBNAILS */}
      {safeImages.length > 1 && (
        <div className="mt-4 flex justify-center gap-3 flex-wrap">
          {safeImages.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`
                w-20 h-14 rounded-lg overflow-hidden border-2 transition-all
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
                onError={(e) => (e.currentTarget.src = "/img/product-placeholder.jpg")}
              />
            </button>
          ))}
        </div>
      )}

      {/* REQUEST QUOTE CTA – Simple button, no framer-motion */}
      {onRequestQuote && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onRequestQuote}
            className="
              px-6 py-3 rounded-xl
              bg-[#D7B15B] text-[#164946]
              font-extrabold
              shadow-md hover:shadow-lg
              transition-shadow duration-200
              active:scale-95
            "
          >
            Request Quote
          </button>
        </div>
      )}
    </div>
  );
}