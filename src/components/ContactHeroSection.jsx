import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const HERO_IMAGES = ["/images/contact-hero.jpg"];

const ContactHeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
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
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{
              backgroundImage: `url(${url})`,
              zIndex: index === currentImageIndex ? 1 : 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        ))}
        <div className="absolute inset-0 bg-black/65 z-10" />
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Company Name */}
        <p
          className="
            text-white
            text-sm sm:text-base md:text-lg
            uppercase tracking-[0.3em]
            font-extrabold
            mb-4
            inline-block
            border-b border-sky-400/50
            pb-2
          "
        >
          Sprada2Global EXIM
        </p>

        {/* Heading */}
        <h1
          className="
            font-extrabold
            text-white
            leading-tight
            mb-6
            text-[clamp(2.5rem,6vw,5rem)]
          "
        >
          <span
            className="
              cursive-tagline
              block
              text-[clamp(2rem,5vw,3.5rem)]
              font-light italic
              mb-3
            "
          >
            Contact Us
          </span>
        </h1>

        {/* Description */}
        <p
          className="
            text-slate-200
            text-base
            sm:text-lg
            md:text-xl
            max-w-3xl
            mx-auto
            mb-8
            leading-relaxed
          "
        >
          Ready to partner with a reliable global import and export company? Get in touch with our team for professional trade solutions, competitive pricing and dependable international logistics.
        </p>

        {/* CTA */}
        <motion.a
          href="#blogs"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            inline-flex items-center gap-2
            text-base md:text-lg
            font-bold
            text-white
            border-2 border-white/50
            px-6 py-3
            rounded-xl
            hover:bg-white/10
            transition-all
          "
        >
          Read Insights
          <TrendingUp className="w-5 h-5" />
        </motion.a>
      </motion.div>

      {/* ================= FONT ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
        .cursive-tagline {
          font-family: 'Dancing Script', cursive;
          text-shadow: 0 4px 6px rgba(0,0,0,.6);
        }
      `}</style>
    </section>
  );
};

export default ContactHeroSection;
