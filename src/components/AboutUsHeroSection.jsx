import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, TrendingUp } from "lucide-react";

// =================================================================================
// HERO IMAGES (Uses local paths as requested)
// Note: In a real environment, ensure these images are accessible via the public/ directory.
// =================================================================================
const HERO_IMAGES = [
  "/images/AboutHero.jpg",
  
];


// =================================================================================
// HERO SECTION
// =================================================================================
const AboutUsHeroSection = () => {
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
        className="relative z-20 text-center max-w-5xl mx-auto px-4"
        initial={{ y: 0 }}
        animate={{ y: [0, -5, 0] }} // Subtle vertical float
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        
        {/* Company Name */}
       

        {/* Tagline */}
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-300 mb-6 leading-tight drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 10, delay: 0.4 }}
        >
          <span className="cursive-tagline block text-5xl md:text-7xl font-light italic mb-4">
            About Sprada<span className="text-[#d7b15b]">2Global</span> Exim
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-xl md:text-2xl text-slate-200 font-light max-w-3xl mx-auto mb-10 [text-shadow:0_0_8px_rgba(0,0,0,0.8)]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.6 }}
        >
          We are a global import and export company dedicated to connecting quality products across diverse categories with international markets—built on reliability, compliance, and customer trust.
        </motion.p>

       
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

export default AboutUsHeroSection;