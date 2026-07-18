// src/components/BlogsSection.jsx – Simplified
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getBlogs, toAbsoluteImageUrl } from "@/lib/api";

export default function BlogsSection() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogs({ limit: 9 })
      .then(res => setPosts(res.blogs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center">Loading blogs…</div>;

  return (
    <section className="py-32 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-extrabold text-center mb-20">Our Latest Industry Blogs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer"
              onClick={() => navigate(`/blog/${encodeURIComponent(p.slug)}`)}
            >
              <img
                src={toAbsoluteImageUrl(p.primary_image || p.image) || "/img/blog-placeholder.jpg"}
                alt={p.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 line-clamp-2">{p.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3">{p.excerpt || p.summary}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}