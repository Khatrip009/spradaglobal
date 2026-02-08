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
import { makeAbsoluteUrl } from "../../lib/urlHelpers";
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
    makeAbsoluteUrl(cat.image) ||
    makeAbsoluteUrl(cat.image_url) ||
    makeAbsoluteUrl(cat.cover_image) ||
    makeAbsoluteUrl(cat.thumbnail) ||
    "/images/category-fallback.jpg"
  );
}



/* =====================================================
   HERO CONFIG
===================================================== */




/* =====================================================
   HERO TEXT ANIMATIONS
===================================================== */


/* =====================================================
   PAGE
===================================================== */
export default function HomePage() {
    /* HERO */
 

  

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
