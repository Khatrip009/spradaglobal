import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";

import { getBlogs } from "../lib/api";

/* =====================================================
   ICONS
===================================================== */

const Calendar = (p) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* =====================================================
   3D TILT CARD (GPU SAFE)
===================================================== */

const TiltCard = ({ children, onClick, onHover }) => {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 260, damping: 26 });
  const sy = useSpring(my, { stiffness: 260, damping: 26 });

  const rx = useTransform(sy, [-120, 120], [6, -6]);
  const ry = useTransform(sx, [-120, 120], [-6, 6]);

  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  };

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseMove={move}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
        onHover?.(null);
      }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="relative cursor-pointer will-change-transform"
    >
      {children}
    </motion.div>
  );
};

/* =====================================================
   HOVER PREVIEW (READ-ONLY)
===================================================== */

const HoverPreview = ({ post }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.98 }}
    transition={{ duration: 0.25 }}
    className="absolute z-40 top-6 left-6 w-[320px] bg-white rounded-xl shadow-2xl border p-4 pointer-events-none"
  >
    <img
      src={post.image}
      alt={post.title}
      className="w-full h-36 object-cover rounded-lg mb-3"
    />
    <h4 className="font-bold text-sm mb-1 line-clamp-2">{post.title}</h4>
    <p className="text-xs text-slate-600 line-clamp-3">
      {post.summary || post.meta_description || ""}
    </p>
  </motion.div>
);

/* =====================================================
   MAIN BLOG SECTION
===================================================== */

export default function BlogsSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await getBlogs({ limit: 9 });
        if (mounted) setPosts(r.blogs || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <section className="py-32 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-extrabold text-center mb-20">
          Our Latest Industry Blogs
        </h2>

        {loading && <p className="text-center">Loading…</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((p, i) => (
            <TiltCard
              key={p.id}
              onClick={() => navigate(`/blog/${encodeURIComponent(p.slug)}`)}
              onHover={(v) => setHovered(v ? p : null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="aspect-[3/2] object-cover w-full"
                />
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-xl mb-3">{p.title}</h3>
                  <p className="text-sm text-slate-600 flex-1">{p.summary}</p>
                </div>
              </motion.div>

              <AnimatePresence>
                {hovered?.id === p.id && <HoverPreview post={p} />}
              </AnimatePresence>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
