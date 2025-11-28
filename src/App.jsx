// src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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

function App() {
  return (
    <ToastProvider>
      {/* Using HashRouter ensures direct refreshes never 404 on static hosts.
          If you later prefer clean URLs, switch back to BrowserRouter and add
          server-side rewrites (see docs). */}
      <Router basename={import.meta.env.BASE_URL || "/"}>
        <div className="app-root min-h-screen flex flex-col">
          <Header />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />

              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />

              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailsPage />} />

              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/products/category/:slug" element={<CategoryPage />} />

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
