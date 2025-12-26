import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Globe2,
  ShieldCheck,
  Handshake,
  TrendingUp,
  FileCheck,
  Truck,
  Zap,
  Rocket,
  CheckCircle, // New icon for commitment list
} from "lucide-react";
import AboutUsHeroSection from "../AboutUsHeroSection";
/* =====================================================
    THEME CONSTANTS (Holographic/Cinematic Palette)
    - Primary: Deep Navy Blue (#0A1931)
    - Accent 1: Vibrant Gold/Orange (#FFC300)
    - Accent 2: Holographic Cyan (#00D2D3)
===================================================== */
const primaryColor = "#032d49ff";
const accentColor = "#ffa200ff";
const secondaryAccent = "#0066d3ff";

/* =====================================================
    ANIMATION HELPERS (Cinematic Motion)
===================================================== */

// Dramatic cinematic fade: Slower, deeper perspective shift
const cinematicFade = {
  hidden: { opacity: 0, y: 120, scale: 0.8, rotateX: 30, transformPerspective: 1200 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 1.5, // Cinematic duration
      ease: [0.25, 0.46, 0.45, 0.94], // Dramatic ease-out
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.4,
    },
  },
};

// Enhanced 3D Tilt/Hover Effect for Core Value cards (Metallic Feel)
const tiltEffect = {
  initial: {
    scale: 0.9,
    opacity: 0,
    y: 50,
    rotateX: -20,
    transformPerspective: 1000,
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 1,
    },
  },
  hover: {
    scale: 1.07,
    rotateY: 4,
    rotateX: -10,
    boxShadow: `0 40px 80px -15px ${primaryColor}40`,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/* =====================================================
    ABOUT PAGE COMPONENT
===================================================== */

export default function AboutPage() {
  const { scrollYProgress } = useScroll();

  // Parallax: Transform Y position of Hero text relative to scroll for depth
  const yParallax = useTransform(scrollYProgress, [0, 0.5], [0, 300]);
  // Opacity fade for hero section on scroll
  const opacityParallax = useTransform(scrollYProgress, [0, 0.3], [1, 0.1]);

  return (
    // Set a default background and text color, and perspective for 3D effects
    <div className="min-h-screen bg-white text-gray-800 font-inter perspective-1000">
      
      {/* =================================================
          1. HERO SECTION: THE INCEPTION (Cinematic View)
      ================================================= */}
      <AboutUsHeroSection/>
      

      {/* =================================================
          2. THE CORE: Mission & Vision (High Contrast)
      ================================================= */}
      <section className="py-24 bg-gray-50 border-t-8 border-b-8 border-gray-200">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-12 items-start">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={cinematicFade}
            className="lg:col-span-1 space-y-4 pt-10"
          >
            <Zap className="w-12 h-12" style={{ color: secondaryAccent }} />
            <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
              Our Definitive Mandate
            </h2>
             <p className="text-gray-600 italic">
                We manage every stage of the trade cycle—from sourcing and documentation to logistics and delivery—following international standards.
            </p>
          </motion.div>

          <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
            {[
              {
                title: "The Mission Command",
                text: "To deliver seamless import and export solutions across diverse industries by ensuring quality, compliance and efficiency while creating lasting value for our clients and partners.",
              },
              {
                title: "The Vision Horizon",
                text: "To become a trusted global import-export company recognized for integrity, operational excellence and customer-centric trade solutions worldwide.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={cinematicFade}
                className="p-8 rounded-2xl shadow-xl bg-white transition-all border-b-4"
                style={{ borderColor: accentColor }}
              >
                <h3 className="text-2xl font-black mb-4 pb-1 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed text-base">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================
          3. STORY ARC: MILESTONE ROADMAP
      ================================================= */}
      <section className="py-32" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-5xl mx-auto px-6">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={cinematicFade}
              className="text-4xl font-black mb-16 text-center text-white"
            >
              The Global Supply Chain Roadmap
            </motion.h2>

            <motion.ul
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={stagger}
                className="space-y-12 relative"
            >
                {/* Vertical Line Connector */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gray-700 hidden md:block" />

                {[
                  { icon: Globe2, title: "Inception: Global Sourcing Network", text: "Established extensive, verified supplier and trade networks across continents (Extensive Global Supplier & Trade Network)." },
                  { icon: Truck, title: "Execution: Optimized Logistics Channels", text: "Implemented advanced cross-border logistics management for high-efficiency transit (Seamless Cross-Border Logistics Management)." },
                  { icon: TrendingUp, title: "Growth: Strategic Market Expansion", text: "Achieved significant market presence by developing strategic trading corridors worldwide (Strategic International Market Presence)." },
                ].map((item, i) => {
                  const Icon = item.icon;
                  const isEven = i % 2 === 0;

                  return (
                    <motion.li
                      key={i}
                      variants={cinematicFade}
                      className={`relative flex ${isEven ? 'md:justify-start' : 'md:justify-end'} justify-center`}
                    >
                      <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-12' : 'md:pl-12'} p-6 rounded-xl shadow-2xl backdrop-blur-md transition-all hover:scale-[1.02]`} style={{ backgroundColor: primaryColor + '99', border: `1px solid ${secondaryAccent}` }}>
                          {/* Timeline Dot (always centered on the vertical line) */}
                          <div className={`absolute top-0 w-8 h-8 rounded-full flex items-center justify-center -translate-y-1/2 z-10`} style={{ backgroundColor: secondaryAccent, left: isEven ? 'calc(50% - 16px)' : 'calc(50% - 16px)' }}>
                            <Icon className="w-5 h-5 text-slate-900" />
                          </div>

                          <h3 className="text-2xl font-bold mb-2 text-white mt-4">{item.title}</h3>
                          <p className="text-slate-300 leading-relaxed">{item.text}</p>
                      </div>
                    </motion.li>
                  );
                })}
            </motion.ul>
        </div>
      </section>

      {/* =================================================
          4. GLOBAL IMPACT: CORE VALUES (3D Metallic)
      ================================================= */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={cinematicFade}
            className="text-4xl font-black mb-16 text-center text-gray-900"
          >
            The Four Coordinates of Our Commitment
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Quality Excellence",
                text: "Strict quality and compliance standards across all trade operations. No compromise on product integrity.",
              },
              {
                icon: Handshake,
                title: "Customer Focus",
                text: "Building long-term partnerships through deeply understanding and anticipating client needs.",
              },
              {
                icon: Globe2,
                title: "Global Perspective",
                text: "Connecting international markets with a dynamic worldwide outlook and expertise.",
              },
              {
                icon: Rocket,
                title: "Innovation & Efficiency",
                text: "Continuously improving systems, logistics and processes for competitive advantage and speed.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  variants={tiltEffect}
                  initial="initial"
                  whileInView="animate"
                  whileHover="hover"
                  viewport={{ once: true, amount: 0.4 }}
                  className="bg-white rounded-3xl p-8 shadow-2xl cursor-pointer transform-style-preserve-3d transition-transform duration-500 ease-out border-b-8 border-r-4 hover:border-r-8"
                  style={{ borderColor: secondaryAccent }}
                >
                  <div className="w-16 h-16 rounded-xl bg-gray-900 text-white flex items-center justify-center mb-6 shadow-xl border-2 border-slate-700">
                    <Icon className="w-8 h-8" style={{ color: accentColor }} />
                  </div>
                  <h4 className="font-extrabold text-2xl mb-3 text-gray-900">{item.title}</h4>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================
          5. THE COMMITMENT PACT (New Section)
      ================================================= */}
      <section className="py-24" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-6">
             <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={cinematicFade}
                className="text-4xl font-black mb-4 text-center text-white"
            >
                The Commitment Pact
            </motion.h2>
            <motion.p
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={cinematicFade}
                className="text-xl max-w-3xl mx-auto text-slate-300 mb-12 text-center"
            >
                Excellence in global trade is a continuous effort. We are committed to strengthening the pillars of trade.
            </motion.p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    "Comprehensive quality checks and inspections at every stage.",
                    "Responsible sourcing and strict adherence to ethical trade practices.",
                    "Transparent documentation and 100% regulatory compliance.",
                    "Continuous improvement in logistics, packaging and supply chain reliability.",
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ delay: i * 0.1, duration: 0.8 }}
                        className="flex items-start p-4 rounded-xl border-l-4 shadow-lg backdrop-blur-sm"
                        style={{ backgroundColor: primaryColor + '99', borderColor: accentColor }}
                    >
                        <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: secondaryAccent }} />
                        <p className="text-base text-slate-200">{item}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* =================================================
          6. CALL TO ACTION: FINAL GUARANTEE
      ================================================= */}
      <section className="py-24 bg-gray-100 border-t-4 border-gray-300">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={cinematicFade}
                className="text-4xl md:text-5xl font-black mb-6 text-gray-900 leading-tight"
            >
                Ready to Engage the <span style={{ color: accentColor }}>EXIM</span> Engine?
            </motion.h2>
            <motion.p
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={cinematicFade}
                className="text-xl max-w-3xl mx-auto text-gray-700 mb-10"
            >
                Partner with Sprada2Global Exim and experience the seamless integration of global trade and local trust.
            </motion.p>
            <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05, boxShadow: `0 10px 20px ${secondaryAccent}80` }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                className="px-12 py-4 text-lg font-bold rounded-full transition-all duration-300 shadow-lg"
                style={{ backgroundColor: secondaryAccent, color: primaryColor }}
            >
                Begin Your Global Partnership
            </motion.button>
        </div>
      </section>
      
    </div>
  );
}