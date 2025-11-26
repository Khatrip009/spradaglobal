// src/components/pages/BlogPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Image } from "../ui/image";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Search, Calendar, ArrowRight, BookOpen, Award, Lightbulb, TrendingUp, Package } from "lucide-react";
import * as api from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/ToastProvider";

const filterCategories = [
  { id: "All", label: "All Posts", icon: BookOpen },
  { id: "Quality", label: "Quality", icon: Award },
  { id: "Trade Tips", label: "Trade Tips", icon: Lightbulb },
  { id: "Market Insights", label: "Market Insights", icon: TrendingUp },
  { id: "Products", label: "Products", icon: Package }
];

export default function BlogPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optimisticLikes, setOptimisticLikes] = useState({}); // map blogId -> {count,user_liked}

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBlogs({ q: query, page, limit });
      const list = (res && res.blogs) ? res.blogs : (Array.isArray(res) ? res : []);
      // best-effort client-side filter by category string if category exists
      let fetched = list;
      if (activeFilter !== "All") {
        fetched = fetched.filter(b => {
          const cat = (b.category && (typeof b.category === "string" ? b.category : (b.category.name || b.category.id))) || "";
          return String(cat).toLowerCase().includes(String(activeFilter).toLowerCase()) ||
                 String(b.meta_title || "").toLowerCase().includes(String(activeFilter).toLowerCase());
        });
      }
      setBlogs(fetched);
      setTotal(typeof res.total === "number" ? Number(res.total) : null);
    } catch (err) {
      console.error("[BlogPage] getBlogs error", err);
      setError("Failed to load articles");
      setBlogs([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  }, [query, page, limit, activeFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = total != null ? Math.max(1, Math.ceil(total / limit)) : Math.max(1, Math.ceil((blogs.length || 0) / limit));

  // Programmatic navigate to detail by slug and ensure remount (navigate pushes new history entry)
  const handleReadMore = (slug) => {
    if (!slug) {
      toast.show("Article unavailable", { duration: 3000 });
      return;
    }
    // push to history (default navigate does push); ensure encoded slug
    navigate(`/blog/${encodeURIComponent(slug)}`);
    // scroll to top for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // optimistic like for a blog card
  const handleLikeCard = async (blogId) => {
    // if no blogId, noop
    if (!blogId) return;
    // optimistic update
    setOptimisticLikes(prev => {
      const current = prev[blogId] || { count: null, user_liked: false };
      // if count unknown, derive from blogs list
      const original = blogs.find(b => b.id === blogId);
      const baseCount = (original && original.likes_count != null) ? Number(original.likes_count) : (current.count || 0);
      const next = { count: (current.user_liked ? baseCount - 1 : baseCount + 1), user_liked: !current.user_liked };
      return { ...prev, [blogId]: next };
    });

    try {
      await api.likeBlog(blogId);
      toast.show("Thanks!", { description: "Your like was recorded", duration: 2000 });
      // reload listing counts for accuracy (cheap)
      load();
    } catch (err) {
      // revert optimistic
      setOptimisticLikes(prev => {
        const cp = { ...prev };
        delete cp[blogId];
        return cp;
      });
      console.error("[BlogPage] like error", err);
      toast.show("Unable to like. Are you logged in?", { duration: 3500, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E9E2]">
      {/* Header hero */}
      <section className="relative py-12 sm:py-20 md:py-28 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(51,80,79,0.85), rgba(51,80,79,0.85)), url('/images/blog-hero.jpg')` }}>
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12 text-center text-white">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-4 flex items-center justify-center gap-3">
              <BookOpen className="w-10 h-10 text-[#D7B15B]" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold">Industry Insights & Export Expertise</h1>
            </div>
            <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">Stay informed with the latest trends, quality standards, trade tips, and market insights.</p>
          </motion.div>
        </div>
      </section>

      {/* Search + Filters */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#666666] w-5 h-5" aria-hidden />
              <Input type="text" placeholder="Search articles..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="pl-12 pr-4 py-2 border-2 border-[#CFD0C8] rounded-lg" aria-label="Search articles" />
            </div>

            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category) => (
                <Button key={category.id} onClick={() => { setActiveFilter(category.id); setPage(1); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold ${activeFilter === category.id ? 'bg-[#33504F] text-white' : 'border-2 border-[#CFD0C8] text-[#666666]'}`} aria-pressed={activeFilter === category.id}>
                  <category.icon className="w-4 h-4" aria-hidden />{category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-10 sm:py-16 bg-[#E8E9E2]">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          {loading ? (
            <div className="text-center py-12 text-sm text-[#666]">Loading articles...</div>
          ) : error ? (
            <div className="text-center py-12 text-sm text-red-600">{error}</div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((post, index) => {
                const slugExists = typeof post.slug === 'string' && post.slug.trim() !== '';
                const targetSlug = slugExists ? post.slug : null;
                const optimistic = optimisticLikes[post.id];
                const likesCount = optimistic && optimistic.count != null ? optimistic.count : (post.likes_count || 0);
                const userLiked = optimistic && optimistic.user_liked != null ? optimistic.user_liked : false;

                return (
                  <motion.div key={post.id || post.slug || index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.04 }}>
                    <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                      <div className="relative overflow-hidden">
                        <Image src={post.image || '/images/placeholder.png'} alt={post.title || 'Article image'} width={400} height={240} className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3"><Badge className="font-semibold px-2 py-1 bg-[#33504F] text-white">{post.category || 'Article'}</Badge></div>
                      </div>

                      <CardContent className="p-4">
                        <div className="text-sm text-[#666666] mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" aria-hidden />{new Date(post.published_at || post.created_at).toLocaleDateString()}</div>
                        <h3 className="text-lg font-heading font-semibold text-[#33504F] mb-2 line-clamp-2 group-hover:text-[#D7B15B]">{post.title}</h3>
                        <p className="text-sm text-[#666666] leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>

                        <div className="flex gap-2">
                          <Button onClick={() => handleReadMore(targetSlug)} className="flex-1 bg-[#33504F] text-white py-2 rounded-lg">Read More <ArrowRight className="w-4 h-4 ml-2" /></Button>
                          <Button onClick={() => handleLikeCard(post.id)} className={`px-4 py-2 rounded-lg border ${userLiked ? 'bg-[#D7B15B] text-[#33504F]' : ''}`}>{userLiked ? '💚' : '👍'} {likesCount}</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12"><BookOpen className="w-12 h-12 text-[#CFD0C8] mx-auto mb-4" /><h3 className="text-xl font-heading text-[#33504F]">No articles found</h3></div>
          )}
        </div>
      </section>

      {/* Pagination */}
      <section className="py-8 bg-[#E8E9E2]">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="border-2 border-[#CFD0C8] text-[#666666]">Previous</Button>
            <div className="px-4 py-2 text-sm text-[#666]">Page {page}{total != null ? ` of ${totalPages}` : ''}</div>
            <Button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="border-2 border-[#CFD0C8] text-[#666666]">Next</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
