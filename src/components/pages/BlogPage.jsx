// src/components/pages/BlogPage.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import bloghero from '../../assets/blog-hero.jpg';
import { toAbsoluteImageUrl } from "../../lib/api";

/* Filter buttons (UI) */
const filterCategories = [
  { id: "All", label: "All Posts", icon: BookOpen },
  { id: "Quality", label: "Quality", icon: Award },
  { id: "Trade Tips", label: "Trade Tips", icon: Lightbulb },
  { id: "Market Insights", label: "Market Insights", icon: TrendingUp },
  { id: "Products", label: "Products", icon: Package }
];

/* Convert various forms of image paths into an absolute URL */
/**
 * Normalize image URL to a usable absolute URL.
 * - If url is absolute (http/https) return it unchanged, except:
 *     * if it points to the current origin and looks like an uploads path, rewrite to api.UPLOADS_BASE if provided
 * - If url is root-relative (/uploads/...), prefix with api.UPLOADS_BASE if available, otherwise leave as-is
 * - If url is relative, prefix with api.UPLOADS_BASE if available
 */



export default function BlogPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // UI state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  // data state
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // optimistic likes store
  const [optimisticLikes, setOptimisticLikes] = useState({});

  // abort controller ref for cancelling stale requests
  const abortRef = useRef(null);

  // debounce query (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async (opts = {}) => {
    const pageArg = opts.page ?? page;
    setLoading(true);
    setError(null);

    // cancel previous
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch {}
    }
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      const qs = {};
      if (debouncedQuery) qs.q = debouncedQuery;
      if (pageArg) qs.page = pageArg;
      if (limit) qs.limit = limit;

      const res = await api.getBlogs(qs);

      if (signal.aborted) return;

      // unify response shape
      let list = Array.isArray(res) ? res : (res.blogs || res.items || []);
      let fetchedTotal = res.total ?? res.total_count ?? (Array.isArray(res) ? res.length : null);

      // client-side filter if activeFilter isn't All
      if (activeFilter && activeFilter !== "All") {
        const filterLower = activeFilter.toLowerCase();
        list = list.filter(b => {
          const cat = (b.category && (typeof b.category === "string" ? b.category : (b.category.name || b.category.id))) || "";
          const meta = String(b.meta_title || b.meta_description || "").toLowerCase();
          return String(cat).toLowerCase().includes(filterLower) || meta.includes(filterLower) || String(b.title || "").toLowerCase().includes(filterLower);
        });
        // if server total exists, we show it but users should expect client-side filtered counts may differ
        fetchedTotal = fetchedTotal != null ? fetchedTotal : list.length;
      }

      setBlogs(list || []);
      setTotal(typeof fetchedTotal === "number" ? Number(fetchedTotal) : null);
    } catch (err) {
      if (err && err.name === "AbortError") {
        // request was canceled; ignore
        return;
      }
      console.error("[BlogPage] getBlogs error", err);
      setError("Failed to load articles");
      setBlogs([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, limit, activeFilter]);

  // reload on query / page / filter change
  useEffect(() => {
    if (page < 1) setPage(1);
    load({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, page, activeFilter]);

  const totalPages = useMemo(() => {
    if (total != null) return Math.max(1, Math.ceil(total / limit));
    return Math.max(1, Math.ceil((blogs.length || 0) / limit));
  }, [total, limit, blogs.length]);

  // navigate to detail
  const handleReadMore = (slug) => {
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      toast.show("Article unavailable", { duration: 3000 });
      return;
    }
    navigate(`/blog/${encodeURIComponent(slug)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // optimistic like
  const handleLikeCard = async (blogId) => {
    if (!blogId) return;

    const original = blogs.find(b => b.id === blogId) || {};
    const originalCount = Number(original.likes_count ?? 0);
    const current = optimisticLikes[blogId] || { count: originalCount, user_liked: false };

    const toggled = {
      count: current.user_liked ? Math.max(0, current.count - 1) : (current.count + 1),
      user_liked: !current.user_liked
    };

    setOptimisticLikes(prev => ({ ...prev, [blogId]: toggled }));

    try {
      await api.likeBlog(blogId);
      // refresh current list to get authoritative numbers
      load({ page });
      toast.show("Thanks for liking!", { duration: 1500 });
    } catch (err) {
      // rollback
      setOptimisticLikes(prev => {
        const cp = { ...prev };
        delete cp[blogId];
        return cp;
      });
      console.error("[BlogPage] like error", err);
      toast.show("Unable to like. Are you logged in?", { duration: 3500, variant: "destructive" });
    }
  };

  const displayedLikes = (post) => {
    const opt = optimisticLikes[post.id];
    if (opt && typeof opt.count === "number") return opt.count;
    return Number(post.likes_count ?? 0);
  };
  const userLiked = (post) => {
    const opt = optimisticLikes[post.id];
    if (opt && typeof opt.user_liked === "boolean") return opt.user_liked;
    return !!post.user_liked;
  };

  // Small card skeleton for loading state
  const CardSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="w-full h-44 bg-gray-200 rounded-md" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="flex gap-2 mt-3">
        <div className="h-9 w-24 bg-gray-200 rounded" />
        <div className="h-9 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );

  return (
        <div className="min-h-screen bg-[#E8E9E2]">
      {/* Header hero */}
      <section className="relative py-12 sm:py-20 md:py-28 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(51,80,79,0.85), rgba(51,80,79,0.85)), url(${bloghero})` }}>
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
              <Input
                type="text"
                placeholder="Search articles..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                className="pl-12 pr-4 py-2 border-2 border-[#CFD0C8] rounded-lg"
                aria-label="Search articles"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => { setActiveFilter(category.id); setPage(1); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold ${activeFilter === category.id ? 'bg-[#33504F] text-white' : 'border-2 border-[#CFD0C8] text-[#666666]'}`}
                  aria-pressed={activeFilter === category.id}
                >
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <CardContent className="p-0"><CardSkeleton /></CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-sm text-red-600">{error}</div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((post, index) => {
                const slugExists = typeof post.slug === 'string' && post.slug.trim() !== '';
                const targetSlug = slugExists ? post.slug : null;
                const likesCount = displayedLikes(post);
                const liked = userLiked(post);

                const dateStr = new Date(post.published_at || post.created_at || Date.now()).toLocaleDateString();
                const thumb = toAbsoluteImageUrl(post.image || post.og_image || post.image || null, "/images/placeholder.png");

                return (
                  <motion.div key={post.id || post.slug || index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.04 }}>
                    <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                      <div className="relative overflow-hidden">
                        <Image src={thumb} alt={post.title || 'Article image'} width={800} height={480} className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3"><Badge className="font-semibold px-2 py-1 bg-[#33504F] text-white">{(post.category && (post.category.name || post.category)) || 'Article'}</Badge></div>
                      </div>

                      <CardContent className="p-4">
                        <div className="text-sm text-[#666666] mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" aria-hidden />{dateStr}</div>
                        <h3 className="text-lg font-heading font-semibold text-[#33504F] mb-2 line-clamp-2 group-hover:text-[#D7B15B]">{post.title}</h3>
                        <p className="text-sm text-[#666666] leading-relaxed mb-4 line-clamp-3">{post.excerpt || post.meta_description || ''}</p>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReadMore(targetSlug)}
                            className="flex-1 bg-[#33504F] text-white py-2 rounded-lg"
                            disabled={!targetSlug}
                            aria-disabled={!targetSlug}
                          >
                            Read More <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>

                          <Button
                            onClick={() => handleLikeCard(post.id)}
                            className={`px-4 py-2 rounded-lg border ${liked ? 'bg-[#D7B15B] text-[#33504F]' : ''}`}
                            aria-pressed={liked}
                          >
                            {liked ? '💚' : '👍'} {likesCount}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-[#CFD0C8] mx-auto mb-4" />
              <h3 className="text-xl font-heading text-[#33504F]">No articles found</h3>
              <p className="text-sm text-[#666] mt-2">Try changing your search or filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      <section className="py-8 bg-[#E8E9E2]">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="border-2 border-[#CFD0C8] text-[#666666]">Previous</Button>
            <div className="px-4 py-2 text-sm text-[#666]">Page {page}{total != null ? ` of ${totalPages}` : ''}</div>
            <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading} className="border-2 border-[#CFD0C8] text-[#666666]">Next</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
