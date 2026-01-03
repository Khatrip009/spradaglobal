import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, TrendingUp } from "lucide-react";

// =================================================================================
// HERO IMAGES (Uses local paths as requested)
// Note: In a real environment, ensure these images are accessible via the public/ directory.
// =================================================================================
const HERO_IMAGES = [
  "/images/hero-1.jpg",
  "/images/hero-2.jpg",
  "/images/hero-3.jpg",
  "/images/hero-4.jpg",
  "/images/hero-5.jpg",
];


// =================================================================================
// HERO SECTION
// =================================================================================
const HomeHeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Cycle background images every 5 seconds (5000ms)
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="hero" className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">

      {/* Background Image Carousel with Cinematic Zoom and Crossfade */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((url, index) => (
          <motion.div
            key={url}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${url})`,
              // Control visibility and stacking via opacity/zIndex
              zIndex: index === currentImageIndex ? 1 : 0,
            }}
            initial={{ opacity: 0, scale: 1.05 }} // Start slightly zoomed in
            animate={{ 
                opacity: index === currentImageIndex ? 1 : 0,
                scale: index === currentImageIndex ? 1 : 1.05 // Zoom out to 1 when active, stay zoomed in when inactive/fading out
            }}
            transition={{ 
                duration: 2, // Slower transition for cinematic feel
                scale: { duration: 5.5, ease: "linear" } // Continuous slow zoom on active image
            }}
          >
             {/* Optional: Add onerror to handle mock image failure if needed */}
             <img src={url} alt="Background" className="hidden" onError={(e) => e.target.parentNode.style.backgroundImage = `url('https://placehold.co/1920x1080/475569/f8fafc?text=Image+Error')`} />
          </motion.div>
        ))}
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/70 z-10"></div>
      </div>

      {/* Hero Content - Wrapped in a floating motion div */}
      <motion.div
      className="relative z-20 text-center max-w-3xl mx-auto px-4 mt-8 md:mt-0"


        initial={{ y: 0 }}
        animate={{ y: [0, -5, 0] }} // Subtle vertical float
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        
        {/* Company Name */}
        <motion.p
          className="text-white text-lg md:text-xl uppercase tracking-[0.35em] font-extrabold mb-4 border-b-2 border-sky-400/50 pb-2 inline-block"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.2 }}
        >
          SPRADA2GLOBAL EXIM
        </motion.p>

        {/* Tagline */}
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold text-white bg-clip-text bg-gradient-to-r from-white to-sky-300 mb-6 leading-tight drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 10, delay: 0.4 }}
        >
          <span className="cursive-tagline block text-6xl md:text-5xl font-white italic mb-4">
            Rich Quality, Reach to the World
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-xl md:text-2xl text-slate-200 font-light max-w-3xl mx-auto mb-10 [text-shadow:0_0_8px_rgba(0,0,0,0.8)]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.6 }}
        >
          Your trusted partner in global import and export solutions. We connect high-quality products across multiple categories with international markets, delivering reliability, consistency and value worldwide
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.8 }}
        >
          {/* Primary CTA */}
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center justify-center gap-2 text-lg font-bold text-white bg-sky-500 hover:bg-sky-600 px-8 py-3 rounded-xl shadow-2xl shadow-sky-500/50 transition-all duration-300 overflow-hidden relative"
          >
            {/* Sparkle effect on hover */}
            <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            Get a Quote
            <Globe className="w-5 h-5 ml-1 transition-transform group-hover:rotate-12" />
          </motion.a>

          {/* Secondary CTA */}
          <motion.a
            href="#products"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(255, 255, 255, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center justify-center gap-2 text-lg font-bold text-white bg-transparent border-2 border-white/50 hover:border-white px-8 py-3 rounded-xl shadow-lg hover:bg-white/10 transition-all duration-300"
          >
            Our products
            <TrendingUp className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1 group-hover:scale-110" />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Global Styles */}
      <style>{`
        /* Import Google Font for the Cursive Tagline */
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
        .cursive-tagline {
          font-family: 'Dancing Script', cursive;
          /* Deeper shadow for contrast */
          text-shadow: 0px 4px 6px rgba(0, 0, 0, 0.7); 
        }
      `}</style>
    </div>
  );
};

export default HomeHeroSection;