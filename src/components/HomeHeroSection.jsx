import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, TrendingUp } from "lucide-react";

/* =====================================================
   HERO IMAGES
===================================================== */
const HERO_IMAGES = [
  "/images/hero-1.jpg",
  "/images/hero-2.jpg",
  "/images/hero-3.jpg",
  "/images/hero-4.jpg",
  "/images/hero-5.jpg",
];

const HomeHeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="
        relative
        min-h-[70vh]
        md:min-h-[75vh]
        lg:min-h-[85vh]
        flex items-center justify-center
        overflow-hidden
      "
    >
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((url, index) => (
          <motion.div
            key={url}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${url})`,
              zIndex: index === currentImageIndex ? 1 : 0,
            }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.05,
            }}
            transition={{
              opacity: { duration: 2, ease: "easeInOut" },
              scale: { duration: 5.5, ease: "linear" },
            }}
          />
        ))}
        <div className="absolute inset-0 bg-black/70 z-10" />
      </div>

      {/* ================= CONTENT ================= */}
      <motion.div
        className="
          relative z-20
          text-center
          max-w-5xl
          mx-auto
          px-6
          md:px-8
          lg:px-12
        "
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.p
          className="
            text-white
            text-sm sm:text-base md:text-lg
            uppercase tracking-[0.35em]
            font-extrabold
            mb-4
            border-b-2 border-sky-400/50
            pb-2
            inline-block
          "
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.2 }}
        >
          SPRADA2GLOBAL EXIM
        </motion.p>

        <motion.h1
          className="
            text-[clamp(2.5rem,6vw,5rem)]
            font-extrabold
            text-white
            mb-6
            leading-tight
            drop-shadow-2xl
          "
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 12, delay: 0.4 }}
        >
          <span className="cursive-tagline block italic mb-4">
            Rich Quality, Reach to the World
          </span>
        </motion.h1>

        <motion.p
          className="
            text-slate-200
            text-base sm:text-lg md:text-xl
            max-w-3xl
            mx-auto
            mb-8
            leading-relaxed
          "
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 12, delay: 0.6 }}
        >
          Your trusted partner in global import and export solutions.
          We connect high-quality products across multiple categories
          with international markets, delivering reliability,
          consistency and value worldwide.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.a
            href="#contact"
            className="px-8 py-3 bg-sky-500 text-white rounded-xl font-bold"
          >
            Get a Quote
          </motion.a>

          <motion.a
            href="#products"
            className="px-8 py-3 border border-white/50 text-white rounded-xl"
          >
            Our Products
          </motion.a>
        </motion.div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
        .cursive-tagline {
          font-family: 'Dancing Script', cursive;
          text-shadow: 0 4px 6px rgba(0,0,0,0.7);
        }
      `}</style>
    </section>
  );
};

export default HomeHeroSection;
