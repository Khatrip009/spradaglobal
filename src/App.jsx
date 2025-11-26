// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
/* Ensure filename matches — I used ServicePage as your comment suggested */
import ServicesPage from "./components/pages/ServicePage";
import ProductDetail from "./components/pages/ProductDetail";
import CategoryPage from "./components/pages/CategoryPage";

/* Toast provider (HMR-stable) */
import { ToastProvider } from "./components/ui/ToastProvider";

/* Global styles */
import "./index.css";
import "./App.css";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app-root min-h-screen flex flex-col">
          {/* Global header */}
          <Header />

          <main className="flex-1">
            <Routes>
              {/* Primary pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />

              {/* Blog listing and detail (IMPORTANT: :slug param name) */}
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailsPage />} />

              {/* Products / categories (specific routes before wildcard) */}
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/products/category/:slug" element={<CategoryPage />} />

              {/* Services */}
              <Route path="/services" element={<ServicesPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
