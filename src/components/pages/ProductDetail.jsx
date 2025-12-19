import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProductBySlug,
  getProductImages
} from "@/lib/api";

import ProductDetailHero from "../ProductDetailHero";
import ProductImageGallery from "../Product3DGallery";
import ProductComplianceSection from "../ProductComplianceSection";
import ContactForm from "../ContactForm";

import FloatingEnquiryBar from "../FloatingEnquiryBar";

/* =====================================================
   PRODUCT DETAIL PAGE (FINAL)
===================================================== */

export default function ProductDetailPage() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Contact Form */
  const [formOpen, setFormOpen] = useState(false);
  const [formContext, setFormContext] = useState("product_enquiry");

  /* --------------------------------------------------
     DATA FETCH
  -------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const p = await getProductBySlug(slug);
        if (!mounted) return;

        setProduct(p);

        try {
          const imgs = await getProductImages(p.id);
          if (mounted) setProductImages(imgs || []);
        } catch {
          console.warn("No product images found");
        }
      } catch (e) {
        console.error("Failed to load product:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [slug]);

  /* --------------------------------------------------
     IMAGE NORMALIZER
  -------------------------------------------------- */
  const images = useMemo(() => {
    const set = new Set();

    if (product?.primary_image) set.add(product.primary_image);

    if (Array.isArray(productImages)) {
      productImages.forEach(i => {
        if (i?.url) set.add(i.url);
        if (i?.image_url) set.add(i.image_url);
        if (i?.path) set.add(i.path);
      });
    }

    const arr = Array.from(set);
    return arr.length ? arr : ["/img/product-placeholder.jpg"];
  }, [product, productImages]);

  /* --------------------------------------------------
     STATES
  -------------------------------------------------- */
  if (loading) {
    return (
      <div className="py-40 text-center text-gray-400">
        Loading product…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-40 text-center text-red-500">
        Product not found
      </div>
    );
  }

  /* --------------------------------------------------
     HANDLERS
  -------------------------------------------------- */
  function openEnquiry(source = "hero") {
    trackConversion(source);
    setFormContext("product_enquiry");
    setFormOpen(true);
  }

  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */
  return (
    <>
      {/* HERO */}
      <ProductDetailHero
        product={product}
        onRequestQuote={() => openEnquiry("hero_enquiry")}
      />

      {/* IMAGE GALLERY */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <ProductImageGallery
          images={images}
          onRequestQuote={() => openEnquiry("gallery_enquiry")}
        />
      </section>

      {/* COMPLIANCE + DESCRIPTION */}
      <ProductComplianceSection product={product} />

      {/* FLOATING ENQUIRY BAR */}
      <FloatingEnquiryBar
        onEnquire={() => openEnquiry("floating_enquiry")}
      />

      {/* CONTACT FORM */}
      <ContactForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        context={formContext}
        product={product}
      />
    </>
  );
}

/* --------------------------------------------------
   CONVERSION TRACKING (SAFE)
-------------------------------------------------- */
function trackConversion(event) {
  if (window.gtag) {
    window.gtag("event", event, {
      event_category: "Product",
      event_label: event
    });
  }

  if (window.fbq) {
    window.fbq("trackCustom", event);
  }
}
