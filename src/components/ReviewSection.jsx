import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import { getReviews } from "@/lib/api";

/* ======================================================
   ICONS (UNCHANGED)
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
   TILT CARD (UNCHANGED)
====================================================== */
const TiltCard = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, { stiffness: 300, damping: 40 });
  const sy = useSpring(y, { stiffness: 300, damping: 40 });

  const rotateX = useTransform(sy, [-100, 100], [6, -6]);
  const rotateY = useTransform(sx, [-100, 100], [-6, 6]);

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="perspective-1000"
    >
      {children}
    </motion.div>
  );
};

/* ======================================================
   REVIEW CARD (UNCHANGED VISUALLY)
====================================================== */
const ReviewCard = ({ review }) => {
  const stars = Array(5).fill(0);

  return (
    <TiltCard>
      <div className="relative w-[420px] shrink-0 p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl mx-5">
        <Quote className="absolute top-4 right-4 w-16 h-16 text-slate-900/5" />

        <div className="flex mb-4">
          {stars.map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < review.rating ? "text-yellow-400" : "text-slate-300"
              }`}
            />
          ))}
        </div>

        <p className="text-xl italic text-slate-700 leading-relaxed mb-6">
          “{review.body}”
        </p>

        <div className="flex items-center gap-4">
          <UserCircle className="w-9 h-9 text-white p-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div>
            <div className="text-lg font-bold text-slate-900">
              {review.author}
            </div>
            {review.author_title && (
              <div className="text-sm text-slate-500">
                {review.author_title}
              </div>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  );
};

/* ======================================================
   MAIN COMPONENT – AUTO SCROLLING
====================================================== */
const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const trackRef = useRef(null);

  useEffect(() => {
    getReviews({ limit: 12 }).then((list) => {
      const clean = list.filter(Boolean);
      setReviews(clean);
    });
  }, []);

  /* duplicate for infinite loop */
  const looped = useMemo(() => {
    if (reviews.length < 4) return reviews;
    return [...reviews, ...reviews];
  }, [reviews]);

  return (
    <div className="relative py-32 bg-slate-50 overflow-hidden">
      {/* HEADER */}
      <div className="text-center mb-24">
        <h2 className="text-m uppercase text-bold tracking-widest text-emerald-600 mb-4">
          Trusted by Clients
        </h2>
        <h3 className="text-5xl md:text-5xl font-black text-slate-900 bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600">
          What People Say
        </h3>
      </div>

      {/* AUTO SCROLL STRIP */}
      <div className="relative">
        <motion.div
          ref={trackRef}
          className="flex w-max"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 60,
            ease: "linear",
            repeat: Infinity,
          }}
          whileHover={{ animationPlayState: "paused" }}
        >
          {looped.map((r, i) => (
            <ReviewCard key={`${r.id}-${i}`} review={r} />
          ))}
        </motion.div>
      </div>

      {/* BLOBS */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/40 blur-3xl rounded-full" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-200/40 blur-3xl rounded-full" />
    </div>
  );
};

export default ReviewSection;
