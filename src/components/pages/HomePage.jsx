// src/pages/HomePage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring
} from "framer-motion";


import { Button } from "../ui/button";
import { Image } from "../ui/image";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Boxes,
  Factory,
  ShieldCheck,
} from "lucide-react";
import * as api from "../../lib/api";
import { toAbsoluteImageUrl } from "../../lib/api";
import HomeHeroSection from "../HomeHeroSection";
import ImportExportTimeline from "../ImportExportTimeline";
import AboutUsSection from "../AboutUsSection";
import ProductDisplaySection from "../ProductDisplaySection";
import ReviewSection from "../ReviewSection";
import BlogSection from "../BlogsSection"
import CertificateSection from "../CertificateSection";
import WhyChooseUsSection from "../WhyChooseUsSection";


/* =====================================================
   HELPERS
===================================================== */
function slugifyName(name = "") {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function getCategoryImage(cat) {
  return (
    toAbsoluteImageUrl(cat.image) ||
    toAbsoluteImageUrl(cat.image_url) ||
    toAbsoluteImageUrl(cat.cover_image) ||
    toAbsoluteImageUrl(cat.thumbnail) ||
    "/images/category-fallback.jpg"
  );
}


/* =====================================================
   HERO CONFIG
===================================================== */
const HERO_IMAGES = [
  "/images/hero-1.jpg",
  "/images/hero-2.jpg",
  "/images/hero-3.jpg",
  "/images/hero-4.jpg",
];

const HERO_CONTENT = {
  title: "SPRADA2GLOBAL",
  subtitle: "Rich Quality, Reach to the World",
  description:
    "A professionally managed import–export company connecting global buyers with verified manufacturers and export-ready supply chains.",
};



/* =====================================================
   HERO TEXT ANIMATIONS
===================================================== */
const textContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18 },
  },
};

const textItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

/* =====================================================
   PAGE
===================================================== */
export default function HomePage() {
    /* HERO */
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  const startRotation = useCallback(() => {
    if (!timerRef.current) {
      timerRef.current = setInterval(
        () => setActiveIndex((i) => (i + 1) % HERO_IMAGES.length),
        8000
      );
    }
  }, []);

  const stopRotation = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const nextSlide = useCallback(() => {
  stopRotation();
  setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  startRotation();
}, [startRotation, stopRotation]);

const prevSlide = useCallback(() => {
  stopRotation();
  setActiveIndex((prev) =>
    prev === 0 ? HERO_IMAGES.length - 1 : prev - 1
  );
  startRotation();
}, [startRotation, stopRotation]);


  useEffect(() => {
    startRotation();
    return stopRotation;
  }, [startRotation, stopRotation]);

  /* ABOUT PARALLAX */
  const { scrollYProgress } = useScroll();
  const transforms = [
    useTransform(scrollYProgress, [0.2, 0.6], [60, -40]),
    useTransform(scrollYProgress, [0.2, 0.6], [40, -30]),
    useTransform(scrollYProgress, [0.2, 0.6], [80, -50]),
    useTransform(scrollYProgress, [0.2, 0.6], [50, -35]),
  ];

  

return (
    <div className="min-h-screen">


      
    
      {/* Home Hero SECTION */}
    <HomeHeroSection />

      {/* =================================================
          ABOUT US SECTION
      ================================================= */}
      {/* ABOUT US SECTION */}
    <AboutUsSection />
      
    {/* IMPORT EXPORT PROCESS */}
<ImportExportTimeline />
   {/* =================================================
    PRODUCT CATEGORIES
================================================== */}
<ProductDisplaySection />

{/* Why to choose Us */}
<WhyChooseUsSection/>


{/* Review Section */}
< ReviewSection/>

{/* Blogs Section */}
< BlogSection/>

{/* Certificate Section */}
<CertificateSection/>
    </div>
  );
} 
