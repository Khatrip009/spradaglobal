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

/* -------------------------------------------------------------------------- */
/* Component */
/* -------------------------------------------------------------------------- */
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

  // Load blogs using Supabase API
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
      const params = {
        page: pageArg,
        limit: limit,
      };
      if (debouncedQuery) params.q = debouncedQuery;

      const res = await api.getBlogs(params);

      if (signal.aborted) return;

      // getBlogs returns { blogs, total, page, limit }
      let list = res.blogs || [];
      let fetchedTotal = res.total ?? list.length;

      // client-side filter if activeFilter isn't All
      if (activeFilter && activeFilter !== "All") {
        const filterLower = activeFilter.toLowerCase();
        list = list.filter(b => {
          const cat = (b.category && (typeof b.category === "string" ? b.category : (b.category.name || b.category.id))) || "";
          const meta = String(b.meta_title || b.meta_description || "").toLowerCase();
          return String(cat).toLowerCase().includes(filterLower) || meta.includes(filterLower) || String(b.title || "").toLowerCase().includes(filterLower);
        });
        fetchedTotal = fetchedTotal != null ? fetchedTotal : list.length;
      }

      setBlogs(list || []);
      setTotal(typeof fetchedTotal === "number" ? Number(fetchedTotal) : null);
    } catch (err) {
      if (err && err.name === "AbortError") {
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
  }, [debouncedQuery, page, activeFilter, load]);

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

  // Helper to extract blog image
  const getBlogImage = (blog) => {
    if (blog.primary_image) return api.toAbsoluteImageUrl(blog.primary_image);
    if (blog.og_image) return api.toAbsoluteImageUrl(blog.og_image);
    if (blog.image) return api.toAbsoluteImageUrl(blog.image);
    // Try to extract from content
    if (blog.content?.blocks) {
      for (const block of blog.content.blocks) {
        if (block.url) return api.toAbsoluteImageUrl(block.url);
      }
    }
    return bloghero; // fallback
  };

  // Skeleton for loading state
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
      {/* Hero Section */}
      <section className="relative bg-[#14301F] text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-[#0F2419] to-[#1A3F2B] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight">
              Our <span className="text-[#D7B15B]">Blog</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Insights, stories, and updates from Sprada2Global
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 w-full border-gray-200 focus:border-[#D7B15B] focus:ring-[#D7B15B]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Spices", "Peanuts", "Trade", "Export"].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                className={`rounded-full px-4 py-1 ${
                  activeFilter === filter
                    ? "bg-[#14301F] text-white hover:bg-[#1A3F2B]"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-lg">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => load({ page })}
            >
              Retry
            </Button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No articles found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => {
                const imgSrc = getBlogImage(blog);
                const postDate = new Date(blog.published_at || blog.created_at || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });

                return (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <Card className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100 h-full flex flex-col">
                      <div className="relative overflow-hidden h-48">
                        <Image
                          src={imgSrc}
                          alt={blog.title}
                          width={400}
                          height={240}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {!blog.is_published && (
                          <Badge className="absolute top-3 right-3 bg-yellow-500 text-white">
                            Draft
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-5 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-[#14301F] line-clamp-2 group-hover:text-[#D7B15B] transition-colors">
                          {blog.title}
                        </h3>

                        {blog.excerpt && (
                          <p className="text-gray-600 text-sm mt-2 line-clamp-3 flex-1">
                            {blog.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
                          <Calendar className="w-4 h-4" />
                          <span>{postDate}</span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 hover:bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeCard(blog.id);
                              }}
                            >
                              <span className="text-sm font-medium text-gray-600">
                                {displayedLikes(blog)} ❤️
                              </span>
                            </Button>
                          </div>

                          <Button
                            variant="default"
                            size="sm"
                            className="bg-[#D7B15B] hover:bg-[#C19B4A] text-[#14301F] font-semibold rounded-full px-4"
                            onClick={() => handleReadMore(blog.slug)}
                          >
                            Read More <ArrowRight className="ml-1 w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded-full"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="rounded-full"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}