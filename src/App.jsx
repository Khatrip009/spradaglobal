import React from "react";
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

/* Layout */
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

/* Pages */
import HomePage from "./components/pages/HomePage";
import AboutPage from "./components/pages/AboutPage";
import BlogPage from "./components/pages/BlogPage";
import BlogDetailsPage from "./components/pages/BlogDetailsPage";
import ContactPage from "./components/pages/ContactPage";
import FAQPage from "./components/pages/FAQPage";
import ProductsPage from "./components/pages/ProductsPage";
import ServicesPage from "./components/pages/ServicePage";
import ProductDetail from "./components/pages/ProductDetail";
import CategoryPage from "./components/pages/CategoryPage";

import { ToastProvider } from "./components/ui/ToastProvider";

import "./index.css";
import "./App.css";

/**
 * ScrollToTop
 * Scrolls window to top whenever the location pathname/hash changes.
 * Using useEffect with useLocation ensures navigation always starts at top.
 * NOTE: this component must be rendered *inside* a Router so useLocation() works.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    // For hash navigation, try to scroll to the element; otherwise scroll to top
    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <ToastProvider>
      {/* HashRouter ensures static hosts (GitHub Pages, etc.) won't 404 on refresh. */}
      <Router basename={import.meta.env.BASE_URL || "/"}>
        <div className="app-root min-h-screen flex flex-col">
          <Header />

          {/* ScrollToTop must be inside Router */}
          <ScrollToTop />

          <main className="flex-1">
            <Routes>
              {/* Primary pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />

              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />

              {/* Blogs */}
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailsPage />} />

              {/* Products & categories
                  IMPORTANT: place the more specific 'category' route before the generic
                  '/products/:slug' route to avoid the category slug being captured as
                  a product slug. */}
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/category/:slug" element={<CategoryPage />} />
              <Route path="/products/:slug" element={<ProductDetail />} />

              {/* Services */}
              <Route path="/services" element={<ServicesPage />} />

              {/* fallback - redirect unknown hashes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
