// src/App.jsx
import React, { useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

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

/* Global Modal */
import ContactForm from "@/components/ContactForm";

/* Providers */
import { ToastProvider } from "./components/ui/ToastProvider";

/* Utilities */
import { ScrollToTop } from "./lib/scroll-to-top";
import { AnimatePresence, motion } from "framer-motion";

import "./index.css";
import "./App.css";

/* -----------------------------------------------------
   Animated Page Wrapper
----------------------------------------------------- */
function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}

/* -----------------------------------------------------
   Routes Wrapper (with transitions)
----------------------------------------------------- */
function RouteWrapper({ onRequestQuote }) {
  const location = useLocation();

  return (
    <main className="flex-1">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.key}>
          <Route
            path="/"
            element={
              <AnimatedPage>
                <HomePage />
              </AnimatedPage>
            }
          />

          <Route path="/home" element={<Navigate to="/" replace />} />

          <Route
            path="/about"
            element={
              <AnimatedPage>
                <AboutPage />
              </AnimatedPage>
            }
          />

          <Route
            path="/contact"
            element={
              <AnimatedPage>
                <ContactPage onRequestQuote={onRequestQuote} />
              </AnimatedPage>
            }
          />

          <Route
            path="/faq"
            element={
              <AnimatedPage>
                <FAQPage />
              </AnimatedPage>
            }
          />

          <Route
            path="/blog"
            element={
              <AnimatedPage>
                <BlogPage />
              </AnimatedPage>
            }
          />

          <Route
            path="/blog/:slug"
            element={
              <AnimatedPage>
                <BlogDetailsPage />
              </AnimatedPage>
            }
          />

          <Route
            path="/products"
            element={
              <AnimatedPage>
                <ProductsPage />
              </AnimatedPage>
            }
          />

          <Route
            path="/products/category/:slug"
            element={
              <AnimatedPage>
                <CategoryPage />
              </AnimatedPage>
            }
          />

          <Route
            path="/products/:slug"
            element={
              <AnimatedPage>
                <ProductDetail />
              </AnimatedPage>
            }
          />

          <Route
            path="/services"
            element={
              <AnimatedPage>
                <ServicesPage />
              </AnimatedPage>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </main>
  );
}

/* -----------------------------------------------------
   App Root
----------------------------------------------------- */
function App() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactContext, setContactContext] = useState("general");
  const [contactProduct, setContactProduct] = useState(null);

  const handleRequestQuote = () => {
    setContactContext("quote");
    setContactProduct(null);
    setContactOpen(true);
  };

  return (
    <ToastProvider>
      <Router basename={import.meta.env.BASE_URL || "/"}>
        <div className="app-root min-h-screen flex flex-col">
          {/* HEADER */}
          <Header onRequestQuote={handleRequestQuote} />

          <main className="flex-1 pt-16 md:pt-20">
  <ScrollToTop />
  <RouteWrapper onRequestQuote={handleRequestQuote} />
</main>

          {/* FOOTER */}
          <Footer />

          {/* GLOBAL CONTACT MODAL */}
          <ContactForm
            open={contactOpen}
            onClose={() => setContactOpen(false)}
            context={contactContext}
            product={contactProduct}
          />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
