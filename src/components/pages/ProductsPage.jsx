import React from "react";
import ProductHeroSection from "../ProductHeroSection";
import CategoryGrid from "../CategoryGrid";

/* =====================================================
   PRODUCTS PAGE
===================================================== */

export default function ProductsPage() {
  return (
    <section className="bg-gradient-to-b from-white to-[#F7F7F5]">
      {/* HERO */}
      <ProductHeroSection />

      {/* CATEGORY GRID */}
      <CategoryGrid />
    </section>
  );
}
