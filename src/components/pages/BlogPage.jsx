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
import BlogsContainerSection from "../BlogsSection";
import BlogHeroSection from '../BlogHeroSection';



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
      <BlogHeroSection/>
      
      {/* Blog Grid */}
      <BlogsContainerSection/>
      
    </div>
  );
}
