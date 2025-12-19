// src/components/layout/Footer.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Star,
  MessageSquare,
} from "lucide-react";
import {
  getMetricsVisitorsSummary,
  getReviewStats,
  getReviews,
} from "../../lib/api";

/* Configuration / contact constants */
const OFFICE_ADDRESS_LINE1 = '359, A R Mall, Mota Varachha, Surat';
const OFFICE_ADDRESS_LINE2 = 'Gujarat, India - 394101';
const CONTACT_EMAIL = 'sprada2globalexim@gmail.com';
const PHONE_NUMBER = '+91 72010 65465';
const WHATSAPP_NUMBER = '917201065465'; // used for floating widget (no +)

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Visitors
  const [visitors, setVisitors] = useState(null);
  const visitorsTargetRef = useRef(0);
  const visitorsDisplayRef = useRef(0);
  const rafRef = useRef(null);

  // Reviews
  const [reviewStats, setReviewStats] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  // Count-up animation for visitors
  useEffect(() => {
    let mounted = true;
    async function fetchVisitors() {
      try {
        const data = await getMetricsVisitorsSummary();
        const total = Number(data?.total_visitors || data?.total || 0);
        if (!mounted) return;
        visitorsTargetRef.current = total;
        // animate: smooth count-up
        cancelAnimationFrame(rafRef.current);
        const duration = 900; // ms
        const start = performance.now();
        const from = Number(visitorsDisplayRef.current || 0);
        const to = total;
        function step(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          const val = Math.floor(from + (to - from) * eased);
          visitorsDisplayRef.current = val;
          if (mounted) setVisitors(val);
          if (t < 1) rafRef.current = requestAnimationFrame(step);
        }
        rafRef.current = requestAnimationFrame(step);
      } catch (e) {
        console.warn("Failed to fetch visitors summary", e);
      }
    }
    fetchVisitors();
    const iv = setInterval(fetchVisitors, 60_000);
    return () => {
      mounted = false;
      clearInterval(iv);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Load review stats + a couple recent reviews
  useEffect(() => {
    let mounted = true;
    async function loadReviews() {
      try {
        const stats = await getReviewStats().catch(() => null);
        const rec = await getReviews(5).catch(() => []);
        if (!mounted) return;
        setReviewStats(stats || null);
        if (Array.isArray(rec)) {
        setRecentReviews(rec.slice(0, 5));
      } else if (Array.isArray(rec.reviews)) {
        setRecentReviews(rec.reviews.slice(0, 5));
      } else {
        setRecentReviews([]);
      }
      } catch (e) {
        console.warn("Failed to load reviews/stats", e);
      }
    }
    loadReviews();
    const iv = setInterval(loadReviews, 5 * 60_000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  // helper: render star icons for avg rating
  function renderStars(avg) {
    const full = Math.floor(avg || 0);
    const half = (avg || 0) - full >= 0.5;
    const arr = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) arr.push(<Star key={i} className="w-4 h-4 text-yellow-400 inline-block" />);
      else if (i === full && half)
        arr.push(<Star key={i} className="w-4 h-4 text-yellow-300 opacity-80 inline-block" />);
      else arr.push(<Star key={i} className="w-4 h-4 text-white/40 inline-block" />);
    }
    return <span className="flex items-center gap-1">{arr}</span>;
  }

  // small rating bar component
  const RatingBar = ({ pct }) => (
    <div className="w-full bg-white/6 rounded h-2 overflow-hidden">
      <div style={{ width: `${pct}%` }} className="h-2 bg-yellow-400 rounded transition-all" />
    </div>
  );

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <>
      {/* Floating WhatsApp support widget (bottom-right) */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-4 bottom-4 z-50 flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M21 11.5A9.5 9.5 0 1 1 11.5 2 9.5 9.5 0 0 1 21 11.5z" fill="rgba(0,0,0,0.08)"/>
          <path d="M17 7.5c-.4-.3-1.1-.5-1.8-.6-.5 0-1 .1-1.4.4-.4.3-1.1 1-1.2 1.1-.1.2-.3.3-.5.2-.4-.1-1.9-.6-3.6-2.2C6.4 5 6 4.8 5.5 5.1 4.9 5.4 4.2 6.8 4.2 8.1c0 2.2 1.2 3.9 2.1 4.8.4.4 1 1 1.7 1.6.6.5 1.3.9 1.8 1.1.6.2 1.2.2 1.6.2 1.3 0 2.6-.5 3.6-1.6 1.1-1.1 1.7-2.6 1.7-4.4 0-.6-.1-1.1-.4-1.4-.2-.2-.5-.4-.9-.6z" fill="#fff"/>
        </svg>
        <span className="hidden sm:inline text-sm font-medium">Support</span>
      </a>

      {/* Main Footer */}
      <footer className="w-full bg-[#33504F] text-[#CFD0C8] relative z-10">
  {/* Inner constrained container */}
  <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main grid */}
          <div className="py-10 md:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Company Info */}
            <div>
              <div className="text-2xl font-heading font-extrabold text-[#D7B15B] mb-3">
                SPRADA2GLOBAL
              </div>

              <p className="text-sm md:text-base mb-4 leading-relaxed">
                A strategic partner for high-value global import and export operations.
              </p>

              <div className="flex items-center space-x-3 mb-4">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                  <a key={idx} href="#" aria-label="social" className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#D7B15B] transition-colors">
                    <Icon className="w-4 h-4 text-[#CFD0C8]" />
                  </a>
                ))}
              </div>

              {/* Highlighted visitors count */}
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wide text-white/80">Total visitors</div>

                <div className="mt-2 inline-flex items-baseline gap-3">
                  <div
                    aria-live="polite"
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#D7B15B] drop-shadow-lg animate-appear"
                    style={{
                      textShadow: "0 6px 18px rgba(215,177,91,0.12)",
                      lineHeight: 1,
                    }}
                  >
                    {visitors !== null ? visitors.toLocaleString() : "—"}
                  </div>

                  <div className="text-xs text-white/70">since launch</div>
                </div>

                <style>{`
                  .animate-appear { transform-origin: left center; animation: popIn 550ms cubic-bezier(.2,.9,.2,1); }
                  @keyframes popIn {
                    0% { transform: translateY(6px) scale(.98); opacity:0; }
                    60% { transform: translateY(-3px) scale(1.02); opacity:1; }
                    100% { transform: translateY(0) scale(1); }
                  }
                `}</style>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg sm:text-xl font-heading font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-[#D7B15B]">About Us</Link></li>
                <li><Link to="/services" className="hover:text-[#D7B15B]">Our Services</Link></li>
                <li><Link to="/products" className="hover:text-[#D7B15B]">Products</Link></li>
                <li><Link to="/blog" className="hover:text-[#D7B15B]">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-[#D7B15B]">Contact</Link></li>
              </ul>
            </div>

            {/* Reviews widget */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg sm:text-xl font-heading font-semibold text-white">Customer Reviews</h3>
                <button onClick={() => setReviewsOpen((s) => !s)} className="text-sm text-[#D7B15B]">
                  {reviewsOpen ? "Hide" : "View"}
                </button>
              </div>

              <div className="bg-white/5 p-4 rounded-lg">
                {/* Average rating */}
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-extrabold text-[#D7B15B]">
                    {reviewStats && typeof reviewStats.avg_rating === "number" ? Number(reviewStats.avg_rating).toFixed(1) : "—"}
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Average Rating</div>
                    <div className="mt-1">
                      {renderStars(reviewStats ? reviewStats.avg_rating : 0)}
                    </div>
                  </div>
                </div>

                {/* distribution */}
                <div className="mt-4 space-y-2">
                  {[5,4,3,2,1].map((r) => {
                    const pct = reviewStats && reviewStats.counts ? Math.round(( (reviewStats.counts[String(r)] || 0) / (reviewStats.total || 1) ) * 100) : 0;
                    return (
                      <div key={r} className="flex items-center gap-3">
                        <div className="text-sm w-6 text-white/80">{r}★</div>
                        <div className="flex-1">
                          <RatingBar pct={pct} />
                        </div>
                        <div className="text-xs w-10 text-right text-white/80">{pct}%</div>
                      </div>
                    );
                  })}
                </div>

                {reviewsOpen && (
                  <div className="mt-4 border-t border-white/6 pt-3 space-y-3">
                    {recentReviews.length === 0 ? (
                      <div className="text-sm text-white/70">No reviews yet.</div>
                    ) : recentReviews.map((rv) => (
                      <div key={rv.id || rv.title} className="text-sm">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-white/90">{rv.author || rv.author_name || "Customer"}</div>
                          <div className="text-xs text-white/70">{new Date(rv.created_at || Date.now()).toLocaleDateString()}</div>
                        </div>
                        <div className="text-xs text-white/80">“{rv.body || rv.title || ''}”</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg sm:text-xl font-heading font-semibold mb-4 text-white">Contact Info</h3>

              <div className="space-y-4 text-sm text-[#CFD0C8]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D7B15B] mt-1" />
                  <p>{OFFICE_ADDRESS_LINE1}<br/>{OFFICE_ADDRESS_LINE2}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#D7B15B]" />
                  <a href={`tel:${PHONE_NUMBER.replace(/\s/g,'')}`} className="hover:text-[#D7B15B]">{PHONE_NUMBER}</a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#D7B15B]" />
                  <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-[#D7B15B]">{CONTACT_EMAIL}</a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 py-5 md:py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
              <p className="text-[#CFD0C8] text-center">
                © {currentYear} Sprada2Global Exim. All rights reserved.
                <span className="block md:inline text-[#D7B15B] md:ml-2">Design & Managed by EXOTECH DEVELOPERS</span>
              </p>

              <div className="flex gap-5">
                <Link to="/privacy-policy" className="hover:text-[#D7B15B]">Privacy Policy</Link>
                <Link to="/terms-of-service" className="hover:text-[#D7B15B]">Terms of Service</Link>
                <Link to="/contact" className="flex items-center gap-2 text-[#D7B15B] hover:underline">
                  <MessageSquare className="w-4 h-4" /> Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;