// src/pages/HomePage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Image } from "../ui/image";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Star, CheckCircle, Award } from "lucide-react";
import { Link } from "react-router-dom";
import * as api from "../../lib/api";

import HERO_PRODUCTS from "../../assets/hero-products.jpg";
import ABOUT_IMG from "../../assets/ABOUT_IMG.jpg";

/* ----------------------------
   FALLBACK CONSTANTS & SMALL COMPONENTS
---------------------------- */
const SVG_FALLBACK = "https://via.placeholder.com/120x60?text=Logo";
const HERO_BG = HERO_PRODUCTS;



function CertBadge({ name, icon }) {
  return (
    <div className="flex items-center gap-3 bg-white p-3 rounded shadow-sm">
      <div className="w-12 h-12 flex items-center justify-center rounded bg-slate-50 overflow-hidden">
        <img src={icon} alt={name} className="max-w-full max-h-full object-contain" />
      </div>
      <div className="text-sm font-medium text-slate-700">{name}</div>
    </div>
  );
}

/* ----------------------------
   DEFAULT VALUES
---------------------------- */
const DEFAULT_COMPANY_VALUES = [
  { id: "v1", title: "Premium Quality", description: "Sourced from top manufacturing units with strict QC standards." },
  { id: "v2", title: "Trusted Sourcing", description: "Verified suppliers ensuring fresh and authentic export goods." },
  { id: "v3", title: "Certifications", description: "Internationally certified for food safety and export reliability." },
  { id: "v4", title: "Global Reach", description: "Efficient worldwide distribution with reliable logistics." }
];

const DEFAULT_WORKFLOW = [
  { id: "w1", stepNumber: 1, stepName: "Sourcing", stepDescription: "Direct sourcing from verified Manufacturing Units" },
  { id: "w2", stepNumber: 2, stepName: "Sorting & Cleaning", stepDescription: "Rigorous quality control and cleaning" },
  { id: "w3", stepNumber: 3, stepName: "Packaging", stepDescription: "Professional packaging for export" },
  { id: "w4", stepNumber: 4, stepName: "Quality Testing", stepDescription: "Comprehensive quality assurance" },
  { id: "w5", stepNumber: 5, stepName: "Logistics", stepDescription: "Reliable global shipping" }
];

/* ----------------------------
   UTIL HELPERS
---------------------------- */
function readCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function setCookie(name, value, days = 365) {
  if (typeof document === "undefined") return;
  const d = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d}; path=/; samesite=lax`;
}
function genSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function slugifyName(name = "") {
  return String(name || "").trim().toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\w\- ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/\-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ----------------------------
   PRESENTATION COMPONENTS
---------------------------- */
function CategoryCard({ name, description, count, thumb, to }) {
  return (
    <Link to={to} className="block">
      <Card className="overflow-hidden group hover:shadow-2xl transition">
        <div className="relative h-40">
          <Image src={thumb} width={600} className="w-full h-full object-cover group-hover:scale-105 transition" />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between">
            <div>
              <h3 className="text-white text-lg font-medium">{name}</h3>
              <p className="text-xs text-white/90 truncate">
                {description || `${count} product${count !== 1 ? "s" : ""}`}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white text-[#164946] text-xs font-semibold shadow">
              {count}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ValueCard({ title, description }) {
  return (
    <Card className="p-5 hover:shadow-xl transition">
      <CardContent className="p-0">
        <Award className="w-8 h-8 text-[#D7B15B] mb-3" />
        <h3 className="text-lg font-medium text-[#164946] mb-2">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}

/* ----------------------------
   MAIN COMPONENT START
---------------------------- */
export default function HomePage() {
  const [hero, setHero] = useState({
    title: "SPRADA2GLOBAL",
    subtitle: "Rich Quality, Reach to the World",
    image: HERO_PRODUCTS,
    description: ""
  });

  const [companyValues, setCompanyValues] = useState([]);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const categoriesRef = useRef(null);
  const testimonialsContainerRef = useRef(null);
  const rotationRef = useRef(null);

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  /* ----------------------------
     HOMEPAGE FETCH
  ---------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await api.getHome().catch(() => null) || {};

        if (!mounted) return;

        if (res?.hero) setHero(res.hero);
        if (Array.isArray(res?.categories)) setProductCategories(res.categories);
        if (Array.isArray(res?.featured)) setFeatured(res.featured);

        // BLOGS: accept several possible keys
        if (Array.isArray(res?.blogs)) setBlogs(res.blogs.slice(0, 3));
        else if (Array.isArray(res?.articles)) setBlogs(res.articles.slice(0, 3));

        if (Array.isArray(res?.workflow)) setWorkflowSteps(res.workflow);
        if (Array.isArray(res?.values)) setCompanyValues(res.values);
        if (Array.isArray(res?.certifications)) setCertifications(res.certifications);

        // Testimonials/reviews: accept either res.testimonials or res.reviews
        if (Array.isArray(res?.testimonials)) {
          setTestimonials(res.testimonials);
          setLoadingReviews(false);
        } else if (Array.isArray(res?.reviews)) {
          setTestimonials(res.reviews);
          setLoadingReviews(false);
        } else {
          setTestimonials([]);
          setLoadingReviews(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    return () => { mounted = false; };
  }, []);

  /* ----------------------------
     TESTIMONIAL ROTATION
  ---------------------------- */
  useEffect(() => {
    // start rotation only when testimonials are available
    if (!testimonials || testimonials.length === 0) {
      clearInterval(rotationRef.current);
      rotationRef.current = null;
      return;
    }

    // clear existing
    clearInterval(rotationRef.current);

    rotationRef.current = setInterval(() => {
      setCurrentTestimonial((prev) => {
        const next = (prev + 1) % testimonials.length;
        return next;
      });
    }, 5000);

    return () => {
      clearInterval(rotationRef.current);
      rotationRef.current = null;
    };
  }, [testimonials]);

  const pauseRotation = useCallback(() => {
    if (rotationRef.current) {
      clearInterval(rotationRef.current);
      rotationRef.current = null;
    }
  }, []);

  const resumeRotation = useCallback(() => {
    if (rotationRef.current || !testimonials || testimonials.length === 0) return;
    rotationRef.current = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  }, [testimonials]);

  const prevTestimonial = useCallback(() => {
    if (!testimonials || testimonials.length === 0) return;
    setCurrentTestimonial((s) => (s - 1 + testimonials.length) % testimonials.length);
  }, [testimonials]);

  const nextTestimonial = useCallback(() => {
    if (!testimonials || testimonials.length === 0) return;
    setCurrentTestimonial((s) => (s + 1) % testimonials.length);
  }, [testimonials]);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  /* ----------------------------
     HERO SECTION
  ---------------------------- */
  return (
    <div className="min-h-screen bg-background text-slate-800">

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
           style={{ backgroundImage: `url("${hero.image || HERO_PRODUCTS}")` }}
        />

        <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-20 max-w-[1200px] mx-auto px-6 py-24 text-left">
          <h1 className="text-5xl md:text-6xl text-white font-bold drop-shadow">
            {hero.title}
          </h1>

          <p className="text-xl text-white/90 mt-3 font-bold italic">
            {hero.subtitle}
          </p>


          <div className="mt-2 w-20 h-1 bg-gradient-to-r from-[#D7B15B] to-[#164946]" />

          <p className="text-white/80 max-w-xl mt-4">{hero.description}</p>

          <div className="mt-6 flex gap-4">
            <Link to="/contact">
              <Button className="bg-white text-[#164946] px-6">Request a Quote</Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="text-white border-white px-6">View Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-16 bg-white">
        <div className="max-w-[1100px] mx-auto px-4">
          <h2 className="text-center text-3xl font-heading text-[#1f5a53] mb-6">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(companyValues.length ? companyValues : DEFAULT_COMPANY_VALUES).map((v, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" variants={fadeUp}>
                <ValueCard title={v.title} description={v.description} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT CATEGORIES */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-semibold text-[#1f5a53]">
              Our Product Categories
            </h2>
            <p className="text-slate-600 mt-2">
              Explore our range of high-quality export-ready products.
            </p>
          </div>

          {/* Mobile Scroller */}
          <div className="block lg:hidden relative">
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-20"
              onClick={() => categoriesRef.current?.scrollBy({ left: -250, behavior: "smooth" })}
            >
              <ChevronLeft className="text-[#164946]" />
            </button>

            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-20"
              onClick={() => categoriesRef.current?.scrollBy({ left: 250, behavior: "smooth" })}
            >
              <ChevronRight className="text-[#164946]" />
            </button>

            <div
              ref={categoriesRef}
              className="overflow-x-auto no-scrollbar flex gap-4 py-2 px-2"
            >
              {productCategories.map((c, i) => {
                const name = c.name || "Category";
                const slug = c.slug || slugifyName(name);
                const count = c.count || 0;
                const description = c.description || "";
                const thumb =
                  c.thumb ||
                  c.image ||
                  c.og_image ||
                  "https://via.placeholder.com/300x200?text=No+Image";

                return (
                  <div key={i} className="min-w-[220px] max-w-[220px]">
                    <CategoryCard
                      name={name}
                      description={description}
                      count={count}
                      thumb={thumb}
                      to={`/products?category_slug=${slug}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {productCategories.map((c, i) => {
              const name = c.name || "Category";
              const slug = c.slug || slugifyName(name);
              const count = c.count || 0;
              const description = c.description || "";
              const thumb =
                c.thumb ||
                c.image ||
                c.og_image ||
                "https://via.placeholder.com/300x200?text=No+Image";

              return (
                <motion.div key={i} initial="hidden" whileInView="visible" variants={fadeUp}>
                  <CategoryCard
                    name={name}
                    description={description}
                    count={count}
                    thumb={thumb}
                    to={`/products?category_slug=${slug}`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

{/* ABOUT SECTION */}
<section className="py-16 bg-white">
  <div className="max-w-[1100px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

    <div>
      <img
        src={hero?.about_image || ABOUT_IMG}
        alt="About Sprada2Global Exim"
        loading="lazy"
        decoding="async"
        width="800"
        height="420"
        className="w-full rounded-lg shadow-lg object-cover h-[420px]"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/images/image-placeholder.png";
        }}
      />
    </div>

    <div>
      <h2 className="text-3xl font-heading font-semibold text-[#1f5a53] mb-4">
        About Sprada2Global Exim
      </h2>

      <p className="text-slate-700 leading-relaxed mb-6">
        We export high-quality agricultural and food-grade products to
        global markets. With verified sourcing, modern packaging, and
        strict compliance, we ensure every shipment meets international
        standards.
      </p>

      <ul className="space-y-3">
        <li className="flex gap-3">
          <CheckCircle className="text-[#D7B15B] w-5 h-5" />
          <span>Direct sourcing from trusted manufacturing units.</span>
        </li>

        <li className="flex gap-3">
          <CheckCircle className="text-[#D7B15B] w-5 h-5" />
          <span>State-of-the-art processing & packaging facilities.</span>
        </li>

        <li className="flex gap-3">
          <CheckCircle className="text-[#D7B15B] w-5 h-5" />
          <span>Certified for international trade & food safety.</span>
        </li>
      </ul>

      <Link to="/about">
        <Button className="mt-6 bg-[#164946] text-white px-6">
          Read More
        </Button>
      </Link>
    </div>

  </div>
</section>


      {/* ⭐ PREMIUM WORKFLOW V2 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1100px] mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-semibold text-[#1f5a53]">
              Our Export Process
            </h2>
            <p className="text-slate-600 mt-2">
              A complete streamlined workflow — from sourcing to global delivery.
            </p>
          </div>

          <div className="relative pt-10">

            {/* FIXED GOLD LINE — DOES NOT TOUCH HERO */}
            <div className="hidden lg:block absolute top-[110px] left-8 right-8 h-[2px] bg-[#D7B15B]/50"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 relative z-10">

              {(workflowSteps.length ? workflowSteps : DEFAULT_WORKFLOW).map((step, i) => {
                const title = (step.stepName || "").replace(/Export\s*/i, "").trim();
                let description = step.stepDescription || "";

                // Normalize sourcing step
                if (/sourcing/i.test(step.stepName || "")) {
                  description = description.replace(/farmers/gi, "manufacturing units");
                }

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, delay: i * 0.15 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center text-center"
                  >
                    {/* Animated number circle */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="w-16 h-16 flex items-center justify-center rounded-full bg-white 
                                 border-4 border-[#D7B15B] shadow"
                    >
                      <span className="text-lg font-bold text-[#164946]">
                        {step.stepNumber}
                      </span>
                    </motion.div>

                    <div className="mt-4 flex flex-col items-center">

                      <motion.h3
                        initial={{ opacity: 0, y: 6 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="text-md font-semibold text-[#164946]"
                      >
                        {title}
                      </motion.h3>

                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "40px" }}
                        transition={{ delay: 0.25 + i * 0.1 }}
                        className="h-[2px] bg-[#D7B15B] my-2"
                      />

                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="text-sm text-slate-600 leading-relaxed"
                      >
                        {description}
                      </motion.p>

                    </div>

                  </motion.div>
                );
              })}

            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="py-16 bg-white">
        <div className="max-w-[1100px] mx-auto px-4">

          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-semibold text-[#1f5a53]">
              Our Certifications
            </h2>
            <p className="text-slate-600 mt-2">
              Internationally recognized approvals ensuring global trade compliance.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">

            {(certifications?.length ? certifications.slice(0, 8) : [
              { name: "IEC", img: "https://static.wixstatic.com/media/c837a6_35cdbd22b3ff469e9eed72da97f6e6de~mv2.png" },
              { name: "MSME", img: "https://static.wixstatic.com/media/c837a6_daa0b06aa1cc4d198f51b02bbf8949d8~mv2.png" },
              { name: "RCMC", img: "https://static.wixstatic.com/media/c837a6_362cc25a788a4802991b3303abf1d5db~mv2.png" },
              { name: "FSSAI", img: "https://static.wixstatic.com/media/c837a6_39505e4000ad40fe9d19445bd567c90e~mv2.png" },
              { name: "GST", img: "https://static.wixstatic.com/media/c837a6_63ef44e8234d4e3e9f8d1b845a70d433~mv2.png" },
            ]).map((c, i) => {
              const icon = c.img || c.icon || c.image || SVG_FALLBACK;
              const name = c.name || c.title || "Certification";
              return <CertBadge key={i} name={name} icon={icon} />;
            })}

          </div>

        </div>
      </section>

      {/* BLOGS — PREMIUM V2 */}
      <section className="py-16 bg-white">
        <div className="max-w-[1100px] mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-semibold text-[#1f5a53]">
              Latest Blogs & Insights
            </h2>
            <p className="text-slate-600 mt-2">
              Stay updated with market trends, export insights & agricultural knowledge.
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

            {(blogs?.length ? blogs.slice(0, 3) : []).map((blog, i) => {
              const blogId = blog.id || blog._id || i;
              const title = blog.title || "Untitled Article";
              const slug = blog.slug || "";
              const excerpt = blog.excerpt || blog.description || "";
              const image = blog.image || blog.cover || HERO_BG;

              return (
                <motion.div
                  key={blogId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.12 }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer"
                >
                  {/* Image */}
                  <Link to={`/blogs/${slug}`}>
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70"></div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-5">
                    <Link to={`/blogs/${slug}`}>
                      <h3 className="text-lg font-semibold text-[#164946] group-hover:text-[#0f3a35] transition">
                        {title}
                      </h3>
                    </Link>

                    <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                      {excerpt}
                    </p>

                    <div className="mt-4">
                      <Link
                        to={`/blogs/${slug}`}
                        className="text-[#164946] font-medium text-sm hover:underline inline-flex items-center gap-1"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* If no blogs available */}
            {(!blogs || blogs.length === 0) && (
              <div className="col-span-3 text-center text-slate-500 py-10">
                No blogs found. Add blogs in your admin panel.
              </div>
            )}

          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-[900px] mx-auto px-4">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-semibold text-[#1f5a53]">
              What Our Clients Say
            </h2>
            <p className="text-slate-600 mt-2">
              Genuine feedback from our satisfied international buyers.
            </p>
          </div>

          <div
            ref={testimonialsContainerRef}
            className="relative"
            onMouseEnter={pauseRotation}
            onMouseLeave={resumeRotation}
          >

            {/* LOADING STATE */}
            {loadingReviews ? (
              <div className="bg-white p-8 rounded-lg shadow-md animate-pulse text-center">
                <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-5/6 mx-auto mb-3"></div>
                <div className="h-10 bg-slate-200 rounded w-24 mx-auto"></div>
              </div>
            ) : testimonials?.length ? (
              <>
                {/* ACTIVE TESTIMONIAL CARD */}
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                  {/* Stars */}
                  <div className="flex justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < (testimonials[currentTestimonial]?.rating || 5) ? "text-[#BB7521]" : "text-gray-300"}`}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-lg text-slate-700 italic leading-relaxed mb-4">
                    "{testimonials[currentTestimonial]?.testimonialContent || testimonials[currentTestimonial]?.content || ""}"
                  </blockquote>

                  {/* User Info */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                    {/* Avatar */}
                    {testimonials[currentTestimonial]?.customerPhoto ? (
                      <Image
                        src={testimonials[currentTestimonial].customerPhoto}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#e6f6f4] text-[#164946] flex items-center justify-center font-semibold">
                        {testimonials[currentTestimonial]?.customerName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </div>
                    )}

                    {/* Info Text */}
                    <div className="text-left">
                      <div className="text-lg font-medium text-[#164946]">
                        {testimonials[currentTestimonial]?.customerName || testimonials[currentTestimonial]?.author_name || "Anonymous"}
                      </div>
                      <div className="text-sm text-slate-600">
                        {testimonials[currentTestimonial]?.customerTitle || testimonials[currentTestimonial]?.author_title || ""}
                      </div>
                      {testimonials[currentTestimonial]?.created_at && (
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(testimonials[currentTestimonial].created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <button
                  aria-label="Previous testimonial"
                  onClick={() => { prevTestimonial(); pauseRotation(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full"
                >
                  <ChevronLeft className="text-[#164946]" />
                </button>

                <button
                  aria-label="Next testimonial"
                  onClick={() => { nextTestimonial(); pauseRotation(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full"
                >
                  <ChevronRight className="text-[#164946]" />
                </button>

                {/* Dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => { setCurrentTestimonial(index); pauseRotation(); }}
                      className={`w-2 h-2 rounded-full ${index === currentTestimonial ? "bg-[#164946]" : "bg-slate-300"}`}
                    ></button>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-slate-700">No reviews yet.</p>
                <p className="text-slate-500 text-sm">Add some from admin panel.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-[#164946] text-white text-center">
        <div className="max-w-[900px] mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-3">
            Ready to Start Your Export Journey?
          </h2>

          <p className="text-white/90 mb-6">
            Contact us today and discover how Sprada2Global can support your
            international sourcing needs.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/contact">
              <Button className="bg-white text-[#164946] px-6 py-3 font-semibold">
                Request a Quote
              </Button>
            </Link>

            <Link to="/products">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#164946] px-6 py-3">
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
