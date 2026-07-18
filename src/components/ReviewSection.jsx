import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getReviews } from "@/lib/api";

/* ======================================================
   ICONS
====================================================== */
const Star = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const Quote = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M10 10h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3V10z" />
    <path d="M21 10h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3V10z" />
  </svg>
);

const UserCircle = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 20.6c.7-1.3 2.1-2 4-2h2c1.9 0 3.3.7 4 2" />
  </svg>
);

/* ======================================================
   REVIEW CARD – Simple hover effect
====================================================== */
const ReviewCard = ({ review }) => {
  const stars = Array(5).fill(0);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
    >
      <Quote className="w-12 h-12 text-slate-900/5 mb-2" />
      <div className="flex mb-3">
        {stars.map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < review.rating ? "text-yellow-400" : "text-slate-300"
            }`}
          />
        ))}
      </div>
      <p className="text-slate-700 leading-relaxed mb-4 text-sm">
        “{review.body}”
      </p>
      <div className="flex items-center gap-3">
        <UserCircle className="w-8 h-8 text-white p-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
        <div>
          <div className="text-base font-bold text-slate-900">
            {review.author_name || review.author || "Customer"}
          </div>
          {review.author_title && (
            <div className="text-xs text-slate-500">{review.author_title}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ======================================================
   MAIN COMPONENT – Clean grid
====================================================== */
const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReviews({ limit: 6 })
      .then((list) => {
        const clean = Array.isArray(list) ? list : [];
        setReviews(clean);
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative py-24 bg-slate-50 overflow-hidden">
      {/* Decorative blobs (static) */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/30 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-200/30 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-2">
            Trusted by Clients
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            What People Say
          </h2>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-slate-200/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            No reviews yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((r) => (
              <ReviewCard key={r.id || r.created_at} review={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;