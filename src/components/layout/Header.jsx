// src/components/layout/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us"},
  { to: "/products", label: "Products"},
  { to: "/services", label: "Services" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export default function Header({ onRequestQuote }) {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const firstDrawerLinkRef = useRef(null);

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  // close handlers & escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    // move focus to first link in drawer when opened for accessibility
    if (drawerOpen && firstDrawerLinkRef.current) {
      firstDrawerLinkRef.current.focus();
    }
  }, [drawerOpen]);

  // Make header solid on all screen sizes; only change shadow on scroll
  const bgClass = scrolled ? "bg-white shadow-md" : "bg-white shadow-sm";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.28 }}
      >
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* left: logo + mobile menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 rounded-md hover:bg-slate-100 lg:hidden"
                aria-label="Open menu"
                title="Open menu"
              >
                <Menu className="w-6 h-6 text-slate-700" />
              </button>

              <Link to="/" className="flex items-center gap-3">
                {/* Use absolute-root path so bundlers resolve public folder assets consistently */}
                <img src="/images/SPRADA_LOGO.png" alt="Sprada2Global" className="w-32 h-10 object-contain" />
                
              </Link>
            </div>

            {/* center: primary nav (desktop) */}
            <nav className="hidden lg:flex items-center gap-2" aria-label="Primary navigation">
              {NAV.map((n) => {
                const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`relative px-3 py-2 rounded-3xl text-30px font-bold transition-all duration-150
                      ${active ? "text-green-900 bg-slate-50 shadow-sm" : "text-green-700 hover:text-slate-900 hover:bg-slate-50"}
                    `}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="pointer-events-none">{n.label}</span>
                    {/* subtle active underline */}
                    <span
                      aria-hidden
                      className={`absolute left-3 right-3 -bottom-2 h-[3px] rounded-full transition-all duration-200 ${
                        active ? "bg-emerald-500 scale-x-100" : "bg-emerald-500 scale-x-0"
                      }`}
                      style={{ transformOrigin: "left center" }}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* right: search & CTA */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <input
                    aria-label="Search"
                    placeholder="Search products..."
                    className="px-3 py-2 w-64 rounded-md border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-slate-600" aria-label="Search">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* small-screen search toggle */}
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="md:hidden p-2 rounded-md hover:bg-slate-100"
                aria-label="Toggle search"
                title="Search"
              >
                <Search className="w-5 h-5 text-slate-700" />
              </button>

              {/* CTA */}
              <button
  onClick={() => {
    onRequestQuote?.();
    setDrawerOpen(false);
  }}
  className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md"
>
  Quote
</button>


              {/* spacer for layout consistency on desktop */}
              <div className="hidden lg:block w-2" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile search (collapsible) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden px-4 pb-3 bg-white border-t"
          >
            <div className="py-3">
              <input
                ref={searchRef}
                aria-label="Search"
                placeholder="Search products..."
                className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer (mobile) */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-2xl"
              aria-modal="true"
              role="dialog"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <Link to="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3">
                  <img src="/images/SPRADA_LOGO.png" alt="logo" className="w-10 h-8 object-contain" />
                  <span className="font-semibold text-slate-900">SPRADA2GLOBAL</span>
                </Link>

                <div className="flex items-center gap-2">
                 <button
  onClick={onRequestQuote}
  className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow"
>
  Request Quote
</button>


                  <button onClick={() => setDrawerOpen(false)} aria-label="Close" className="p-2 rounded-md hover:bg-slate-100">
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
              </div>

              <nav className="p-4 space-y-1" aria-label="Mobile primary">
                {NAV.map((n, idx) => {
                  const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setDrawerOpen(false)}
                      className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${active ? "bg-slate-50 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}
                      ref={idx === 0 ? firstDrawerLinkRef : undefined}
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t">
                <div className="text-sm text-slate-600 mb-3">Subscribe to updates</div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const email = e.currentTarget.email?.value;
                    if (email) {
                      alert("Thanks — we'll keep you posted");
                      e.currentTarget.reset();
                      setDrawerOpen(false);
                    }
                  }}
                >
                  <div className="flex gap-2">
                    <input name="email" type="email" required placeholder="Email address" className="flex-1 px-3 py-2 rounded-md border border-slate-200 focus:outline-none" />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md">Subscribe</button>
                  </div>
                </form>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

