import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform
} from "framer-motion";
import { toAbsoluteImageUrl } from "@/lib/api";

/* =====================================================
   3D MULTI-IMAGE PRODUCT GALLERY (FINAL)
===================================================== */

export default function Product3DGallery({ images = [] }) {
  const safeImages = images.length
    ? images.map(toAbsoluteImageUrl)
    : ["/img/product-placeholder.jpg"];

  const [active, setActive] = useState(0);

  /* 3D tilt */
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-60, 60], [15, -15]);
  const rotateY = useTransform(x, [-60, 60], [-15, 15]);

  function handleMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="w-full">
      {/* MAIN VIEWPORT */}
      <div className="relative perspective-[1200px]">
        <motion.div
          onMouseMove={handleMove}
          onMouseLeave={reset}
          style={{ rotateX, rotateY }}
          className="
            relative rounded-3xl overflow-hidden
            bg-black
            shadow-[0_40px_120px_rgba(0,0,0,0.6)]
            transform-gpu
          "
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={safeImages[active]}
              src={safeImages[active]}
              alt=""
              className="w-full h-[420px] object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.6 },
                scale: { duration: 6, ease: "linear" }
              }}
            />
          </AnimatePresence>
        </motion.div>
      </div>

      {/* THUMBNAILS */}
      {safeImages.length > 1 && (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {safeImages.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`
                relative w-24 h-16 flex-shrink-0
                rounded-xl overflow-hidden
                transition
                ${i === active
                  ? "ring-4 ring-[#d7b15b]"
                  : "opacity-60 hover:opacity-100"}
              `}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
