// src/components/pages/ProductDetail.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Image } from "../ui/image";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle, ArrowLeft, X, ArrowLeft as PrevIcon, ArrowRight as NextIcon } from "lucide-react";
import * as api from "../../lib/api";
import { makeAbsoluteUrl } from "../../lib/urlHelpers";

/* ---------- Helpers ---------- */
function displayTradeType(product) {
  if (!product) return "both";
  return product.trade_type || product.effective_trade_type || product.category?.trade_type || "both";
}

function uniqPreserveOrder(arr = []) {
  const seen = new Set();
  const out = [];
  for (const a of arr) {
    if (!a) continue;
    const s = String(a).trim();
    if (!s) continue;
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

/* ---------- Lightbox (improved: looping) ---------- */
function Lightbox({ images = [], startIndex = 0, open, onClose }) {
  const [index, setIndex] = useState(startIndex || 0);
  const closeRef = useRef(null);

  useEffect(() => {
    if (open) {
      setIndex(startIndex || 0);
      setTimeout(() => closeRef.current?.focus?.(), 30);
    }
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));
      if (e.key === "ArrowRight") setIndex((i) => (images.length ? (i + 1) % images.length : 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length, onClose]);

  if (!open) return null;
  if (!Array.isArray(images) || images.length === 0) return null;

  const prev = () => setIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));
  const next = () => setIndex((i) => (images.length ? (i + 1) % images.length : 0));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-[1200px] max-h-[92vh] flex items-center justify-center">
        <button
          aria-label="Previous image"
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none"
          onClick={(e) => { e.stopPropagation(); prev(); }}
        >
          <PrevIcon className="w-6 h-6 text-white" />
        </button>

        <button
          aria-label="Next image"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none"
          onClick={(e) => { e.stopPropagation(); next(); }}
        >
          <NextIcon className="w-6 h-6 text-white" />
        </button>

        <div className="w-full h-[82vh] overflow-hidden flex items-center justify-center">
          <img
            src={images[index]}
            alt={`Image ${index + 1} of ${images.length}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <button
          ref={closeRef}
          aria-label="Close image viewer"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/90 bg-black/40 px-3 py-1 rounded">
          {index + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

/* ---------- SampleModal (unchanged behaviour) ---------- */
function SampleModal({ open, onClose, productTitle = "", productSlug = "" }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    message: "",
    product_interest: productTitle || productSlug || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const firstInput = useRef(null);
  const closeBtn = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInput.current?.focus?.(), 50);
      setResult(null);
      setSubmitting(false);
      setForm((f) => ({ ...f, product_interest: productTitle || productSlug || f.product_interest }));
    }
  }, [open, productTitle, productSlug]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Please enter a valid email address.";
    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const v = validate();
    if (v) {
      setResult({ ok: false, message: v });
      return;
    }

    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        country: form.country.trim() || null,
        product_interest: form.product_interest || productTitle || productSlug || null,
        message: form.message.trim() || null,
      };
      const res = await api.apiPost("/api/leads", payload);
      if (res && res.ok) {
        setResult({ ok: true, message: "Request submitted. We will contact you shortly." });
        setForm({ name: "", email: "", phone: "", company: "", country: "", message: "", product_interest: productTitle || productSlug || "" });
        setTimeout(() => onClose(), 1600);
      } else {
        setResult({ ok: false, message: (res && res.error) ? res.error : "Submission failed." });
      }
    } catch (err) {
      console.error("[SampleModal] submit error", err);
      setResult({ ok: false, message: err?.body?.message || err?.message || "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={`Request sample for ${productTitle || productSlug || "product"}`} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-lg w-full max-w-xl mx-auto shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-[#33504F]">Request Sample</h3>
          <button ref={closeBtn} aria-label="Close sample request" onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-[#333]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="text-sm text-[#666]">Requesting sample for: <strong className="text-[#33504F]">{productTitle || productSlug}</strong></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#444]">Name *</label>
              <input ref={firstInput} required value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div>
              <label className="text-xs text-[#444]">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div>
              <label className="text-xs text-[#444]">Phone</label>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div>
              <label className="text-xs text-[#444]">Company</label>
              <input value={form.company} onChange={(e) => update("company", e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-[#444]">Country</label>
              <input value={form.country} onChange={(e) => update("country", e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-[#444]">Message (optional)</label>
              <textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={4} className="w-full mt-1 p-2 border rounded" />
            </div>
          </div>

          {result && (
            <div className={`text-sm p-2 rounded ${result.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {result.message}
            </div>
          )}

          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#33504F] text-white" disabled={submitting}>
              {submitting ? "Submitting..." : "Send Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- ProductDetail main component (improved gallery) ---------- */
const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);

  const [gallery, setGallery] = useState([]);
  const [mainIndex, setMainIndex] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  const [sampleOpen, setSampleOpen] = useState(false);

  const thumbsRef = useRef(null);

  // utility: scroll active thumbnail into view
  const scrollThumbIntoView = useCallback((idx) => {
    const container = thumbsRef.current;
    if (!container) return;
    const child = container.querySelector(`[data-thumb-index="${idx}"]`);
    if (child) {
      const childRect = child.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      // prefer to center the thumbnail when possible
      const offset = childRect.left - contRect.left - (contRect.width / 2) + (childRect.width / 2);
      container.scrollBy({ left: offset, behavior: "smooth" });
    }
  }, []);

  // fetch product and product_images, build gallery
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setProduct(null);
    setGallery([]);
    setMainIndex(0);

    (async () => {
      try {
        const p = await api.getProductBySlug(slug);
        if (!mounted) return;
        if (!p) {
          setError("Product not found");
          setLoading(false);
          return;
        }

        // normalize main fields
        const normalized = { ...p };
        const prim = makeAbsoluteUrl(p.primary_image || p.og_image || p.image || null);
        const og = makeAbsoluteUrl(p.og_image || null);
        const img = makeAbsoluteUrl(p.image || null);

        // images from metadata (gallery, images)
        const meta = p.metadata || {};
        const metaImages = [];
        if (Array.isArray(meta.images)) {
          meta.images.forEach((it) => {
            if (!it) return;
            if (typeof it === "string") metaImages.push(makeAbsoluteUrl(it));
            else if (it.url) metaImages.push(makeAbsoluteUrl(it.url));
            else if (it.filename) metaImages.push(makeAbsoluteUrl(`/uploads/products/${it.filename}`));
          });
        }
        if (Array.isArray(meta.gallery)) {
          meta.gallery.forEach((it) => {
            if (!it) return;
            if (typeof it === "string") metaImages.push(makeAbsoluteUrl(it));
            else if (it.url) metaImages.push(makeAbsoluteUrl(it.url));
            else if (it.filename) metaImages.push(makeAbsoluteUrl(`/uploads/products/${it.filename}`));
          });
        }

        // fetch product_images from backend (if endpoint available)
        let dbImages = [];
        try {
          // use api.apiGet helper (generic) to call product-images endpoint
          const q = `/api/product-images?product_id=${encodeURIComponent(p.id)}`;
          const res = await api.apiGet ? await api.apiGet(q) : await api.get(`/product-images?product_id=${encodeURIComponent(p.id)}`);
          // expecting { ok: true, items: [{url, is_primary, filename, ...}, ...] }
          const items = (res && res.items) ? res.items : (res && res.ok && res.images ? res.images : []);
          dbImages = Array.isArray(items) ? items.map((it) => (it && it.url ? it.url : (it && it.filename ? makeAbsoluteUrl(`/uploads/products/${it.filename}`) : null))).filter(Boolean) : [];
        } catch (e) {
          // non-fatal: log and continue with available images
          console.warn("[ProductDetail] product-images fetch failed:", e && e.message ? e.message : e);
          dbImages = [];
        }

        // Build gallery order:
        // 1) product_images (dbImages) but try to put is_primary first (if available via separate call - we used url only above)
        // 2) primary / og / image
        // 3) metadata arrays
        const assembled = uniqPreserveOrder([
          ...dbImages,
          prim,
          og,
          img,
          ...metaImages
        ]);

        normalized.primary_image = prim;
        normalized.og_image = og;
        normalized.image = img;
        normalized._metaImages = metaImages;

        if (!assembled.length) {
          // fallback placeholder
          assembled.push("/images/placeholder.png");
        }

        setProduct(normalized);
        setGallery(assembled);
        setMainIndex(0);
      } catch (err) {
        if (!mounted) return;
        if (err && err.status === 404) setError("Product not found");
        else setError(err.message || "Failed to load product");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [slug]);

  // auto-open sample modal if requested via query or location.state
  useEffect(() => {
    if (!location) return;
    const qs = new URLSearchParams(location.search || "");
    const want = qs.get("sample") === "1" || location?.state?.openSample === true;
    if (want) {
      if (product) setSampleOpen(true);
      else {
        const id = setInterval(() => {
          if (product) {
            setSampleOpen(true);
            clearInterval(id);
          }
        }, 120);
        setTimeout(() => clearInterval(id), 3000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, product]);

  // keyboard navigation for main image when product displayed
  useEffect(() => {
    if (!gallery || gallery.length <= 1) return;
    function onKey(e) {
      if (e.key === "ArrowLeft") setMainIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setMainIndex((i) => Math.min(gallery.length - 1, i + 1));
      if (e.key === "Home") setMainIndex(0);
      if (e.key === "End") setMainIndex(gallery.length - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gallery]);

  // whenever mainIndex changes, ensure active thumb is visible
  useEffect(() => {
    scrollThumbIntoView(mainIndex);
  }, [mainIndex, scrollThumbIntoView]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-[#666]">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-[#33504F] mb-4">Error</h2>
          <p className="text-sm text-[#666] mb-6">{error}</p>
          <div>
            <Button variant="outline" onClick={() => navigate("/products")}>Back to products</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const mainImage = gallery[mainIndex] || "/images/placeholder.png";

  const openLightboxAt = (idx = 0) => {
    setLightboxStartIndex(idx);
    setLightboxOpen(true);
  };

  const onThumbClick = (e, idx) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setMainIndex(idx);
  };

  const prevMain = () => setMainIndex((i) => Math.max(0, i - 1));
  const nextMain = () => setMainIndex((i) => Math.min(gallery.length - 1, i + 1));

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="max-w-[100rem] mx-auto px-6 lg:px-12 py-10">
        <div className="mb-6">
          <button onClick={() => navigate("/products")} className="inline-flex items-center gap-2 text-sm text-[#33504F]">
            <ArrowLeft className="w-4 h-4" /> Back to products
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div
                className="w-full h-[520px] md:h-[420px] bg-white flex items-center justify-center overflow-hidden relative"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") openLightboxAt(mainIndex); }}
              >
                {/* Prev / Next overlay */}
                {gallery.length > 1 && (
                  <>
                    <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); prevMain(); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/40 hover:bg-white/60">
                      <PrevIcon className="w-5 h-5 text-[#33504F]" />
                    </button>
                    <button aria-label="Next" onClick={(e) => { e.stopPropagation(); nextMain(); }} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/40 hover:bg-white/60">
                      <NextIcon className="w-5 h-5 text-[#33504F]" />
                    </button>
                  </>
                )}

                <div className="w-full h-full flex items-center justify-center cursor-zoom-in" onClick={() => openLightboxAt(mainIndex)}>
                  <Image
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full product-main-image"
                    width={1600}
                    objectFit="contain"
                    onClick={(e) => { e.stopPropagation(); openLightboxAt(mainIndex); }}
                  />
                </div>
              </div>

              {/* Thumbnail strip */}
              {gallery.length > 1 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-sm text-[#666]">Preview</div>
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => { if (thumbsRef.current) thumbsRef.current.scrollBy({ left: -160, behavior: "smooth" }); }} className="p-1 rounded bg-white border">
                        <PrevIcon className="w-4 h-4 text-[#333]" />
                      </button>
                      <button onClick={() => { if (thumbsRef.current) thumbsRef.current.scrollBy({ left: 160, behavior: "smooth" }); }} className="p-1 rounded bg-white border">
                        <NextIcon className="w-4 h-4 text-[#333]" />
                      </button>
                    </div>
                  </div>

                  <div ref={thumbsRef} className="flex gap-3 overflow-x-auto no-scrollbar py-1" style={{ scrollSnapType: "x mandatory" }}>
                    {gallery.map((g, i) => (
                      <div
                        key={i}
                        data-thumb-index={i}
                        className={`flex-shrink-0 w-28 h-20 rounded-md overflow-hidden border ${i === mainIndex ? "ring-2 ring-[#D7B15B]" : "border-transparent"} relative`}
                        style={{ scrollSnapAlign: "center" }}
                      >
                        <button
                          type="button"
                          onClick={(e) => onThumbClick(e, i)}
                          onDoubleClick={() => openLightboxAt(i)}
                          aria-label={`View image ${i + 1}`}
                          className="w-full h-full p-0 bg-transparent border-0 cursor-pointer"
                        >
                          <Image src={g} alt={`${product.title} ${i}`} className="w-full h-full object-cover" width={400} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <div className="space-y-4">
              <h1 className="text-2xl font-heading font-semibold text-[#33504F]">{product.title}</h1>
              <div className="text-sm text-[#666]">{product.short_description || product.description || "—"}</div>
              <div className="text-xs text-[#666] mt-2"><strong>Trade Type:</strong> {displayTradeType(product)}</div>

              {product.metadata && product.metadata.specifications && (
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="text-lg font-semibold text-[#33504F] mb-2">Specifications</h4>
                  <ul className="space-y-2">
                    {Array.isArray(product.metadata.specifications)
                      ? product.metadata.specifications.map((s, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-[#666]">
                            <CheckCircle className="w-4 h-4 text-[#D7B15B] mt-1" />
                            <span>{s}</span>
                          </li>
                        ))
                      : <li className="text-sm text-[#666]">Specifications available on request.</li>}
                  </ul>
                </div>
              )}

              {product.metadata && product.metadata.details && (
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="text-lg font-semibold text-[#33504F] mb-2">Details</h4>
                  <div className="text-sm text-[#666]">{product.metadata.details}</div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <Card className="p-6 sticky top-24">
              <CardContent className="p-0">
                <div className="mb-4">
                  <div className="text-sm text-[#666]">Price</div>
                  <div className="text-2xl font-semibold text-[#33504F]">{product.price != null ? `${product.currency || "USD"} ${product.price}` : "Price on request"}</div>
                  {product.moq ? <div className="text-xs text-[#666] mt-1">MOQ: {product.moq}</div> : null}
                </div>

                {product.category && (
                  <div className="mb-4">
                    <div className="text-sm text-[#666]">Category</div>
                    <button onClick={() => navigate(`/products/category/${product.category.slug}`)} className="text-sm text-[#33504F] font-medium">{product.category.name}</button>
                    {product.category.trade_type ? <div className="text-xs text-[#666] mt-1">Category trade: {product.category.trade_type}</div> : null}
                  </div>
                )}

                <div className="mb-4">
                  <Button className="w-full bg-[#33504F] text-white py-2 rounded" onClick={() => setSampleOpen(true)}>Request Sample</Button>
                </div>

                <div className="text-sm text-[#666]">
                  <div>Availability: {product.available_qty == null ? "Check" : product.available_qty > 0 ? `${product.available_qty} units` : "Out of stock"}</div>
                  <div className="mt-2">SKU: {product.sku || "—"}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="p-0 text-sm text-[#666]">
                <div className="mb-2 font-semibold text-[#33504F]">Packaging & Shipping</div>
                <div>We support bulk packaging, container optimization and private labeling. Contact us for shipping quotes.</div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <Lightbox images={gallery} startIndex={lightboxStartIndex} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
      <SampleModal open={sampleOpen} onClose={() => setSampleOpen(false)} productTitle={product.title} productSlug={product.slug} />
    </div>
  );
};

export default ProductDetail;
