import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Image } from "../ui/image";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, User, Mail as MailIcon, Heart } from "lucide-react";
import * as api from "../../lib/api";
import { useToast } from "../ui/ToastProvider";

/* -------------------------------------------------------------------------- */
/* Helpers - Logic Preserved */
/* -------------------------------------------------------------------------- */
/**
 * Normalize image URL to a usable absolute URL.
 * - If url is absolute (http/https) return it unchanged, except:
 *     * if it points to the current origin and looks like an uploads path, rewrite to api.UPLOADS_BASE if provided
 * - If url is root-relative (/uploads/...), prefix with api.UPLOADS_BASE if available, otherwise leave as-is
 * - If url is relative, prefix with api.UPLOADS_BASE if available
 */
const SUPABASE_STORAGE_BASE =
  "https://kwthxsumqqssiywdcexv.supabase.co/storage/v1/object/public";
const SUPABASE_BUCKET = "sprada_storage";

function makeAbsoluteImageUrl(url, fallback = "/images/blog-hero.jpg") {
  if (!url || typeof url !== "string") return fallback;

  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // 1️⃣ Already absolute → keep if Supabase
  if (/^https?:\/\//i.test(trimmed)) {
    if (trimmed.includes("supabase.co/storage")) return trimmed;

    // 🔁 Rewrite old API-hosted uploads → Supabase
    if (trimmed.includes("/uploads/")) {
      const path = trimmed.split("/uploads/")[1];
      return `${SUPABASE_STORAGE_BASE}/${SUPABASE_BUCKET}/${path}`;
    }

    return trimmed;
  }

  // 2️⃣ New-style Supabase relative paths
  if (/^(blogs|products|categories)\//i.test(trimmed)) {
    return `${SUPABASE_STORAGE_BASE}/${SUPABASE_BUCKET}/${trimmed}`;
  }

  // 3️⃣ Legacy uploads paths → Supabase
  if (trimmed.startsWith("uploads/")) {
    return `${SUPABASE_STORAGE_BASE}/${SUPABASE_BUCKET}/${trimmed.replace(/^uploads\//, "")}`;
  }

  if (trimmed.startsWith("/uploads/")) {
    return `${SUPABASE_STORAGE_BASE}/${SUPABASE_BUCKET}/${trimmed.replace(/^\/uploads\//, "")}`;
  }

  // 4️⃣ Last-resort fallback
  return fallback;
}


function extractImageFromContent(blog) {
  if (!blog) return "/images/blog-hero.jpg";

  if (blog.og_image) return makeAbsoluteImageUrl(blog.og_image);
  if (blog.image) return makeAbsoluteImageUrl(blog.image);

  const blocks =
    blog?.content?.blocks ||
    blog?.content_json?.blocks ||
    null;

  if (Array.isArray(blocks)) {
    for (const b of blocks) {
      const url = b?.url || b?.image || b?.data?.file?.url;
      if (url) return makeAbsoluteImageUrl(url);
    }
  }

  const htmlSource =
    blog?.content?.html ||
    blog?.content ||
    blog?.content_json?.html ||
    (typeof blog?.content === "string" ? blog.content : null);

  if (typeof htmlSource === "string") {
    const m = htmlSource.match(/<img[^>]+src=(?:'|")([^'"]+)(?:'|")/i);
    if (m?.[1]) return makeAbsoluteImageUrl(m[1]);
  }

  const first = blog?.images?.[0];
  if (first?.url || first?.path)
    return makeAbsoluteImageUrl(first.url || first.path);

  return "/images/blog-hero.jpg";
}

/* -------------------------------------------------------------------------- */
/* Component */
/* -------------------------------------------------------------------------- */
export default function BlogDetailsPage() {
  // Hooks and State (Logic Preserved)
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const decodedSlug = useMemo(
    () => (typeof slug === "string" ? decodeURIComponent(slug) : slug),
    [slug]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blog, setBlog] = useState(null);

  const [likes, setLikes] = useState({ count: 0, user_liked: false });
  const [loadingLike, setLoadingLike] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentRating, setCommentRating] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [topRelated, setTopRelated] = useState([]);

  /* -------------------------------------------------------------------------- */
  /* Fetch Blog (Logic Preserved) */
  /* -------------------------------------------------------------------------- */
  const fetchBlog = useCallback(async () => {
    setLoading(true);
    setError(null);
    setBlog(null);

    if (!decodedSlug) {
      setError("Invalid article URL");
      setLoading(false);
      return;
    }

    try {
      const r = await api.getBlogBySlug(decodedSlug);
      const b = r?.blog ?? r;

      if (!b) setError("Article not found");
      else setBlog(b);
    } catch (err) {
      console.error("[BlogDetails] getBlogBySlug error:", err);
      setError("Failed to load article");
    } finally {
      setLoading(false);
    }
  }, [decodedSlug]);

  /* -------------------------------------------------------------------------- */
  /* Fetch Likes (Logic Preserved) */
  /* -------------------------------------------------------------------------- */
  const fetchLikes = useCallback(async (id) => {
    if (!id) return;
    try {
      const r = await api.apiGet(`/api/blogs/${encodeURIComponent(id)}/count`);
      const cnt = Number(r?.likes_count ?? r?.likes ?? 0);
      setLikes({ count: Number.isFinite(cnt) ? cnt : 0, user_liked: false });
    } catch {
      setLikes({ count: 0, user_liked: false });
    }
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Fetch Comments (Logic Preserved) */
  /* -------------------------------------------------------------------------- */
  const fetchComments = useCallback(async (id) => {
    if (!id) return;
    try {
      const r = await api.getComments(id);
      const arr = Array.isArray(r) ? r : r?.comments;
      setComments(arr || []);
    } catch {
      setComments([]);
    }
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Fetch Related Posts (Logic Preserved) */
  /* -------------------------------------------------------------------------- */
  const loadTopRelated = useCallback(async (currentId) => {
    try {
      const res = await api.getBlogs({ limit: 20 });
      const list = res?.blogs || (Array.isArray(res) ? res : []);

      const filtered = list.filter(
        (b) => b.id !== currentId && b.is_published !== false
      );

      filtered.sort((a, b) => {
        const s = (b.avg_rating || 0) - (a.avg_rating || 0);
        return s !== 0 ? s : (b.likes_count || 0) - (a.likes_count || 0);
      });

      setTopRelated(filtered.slice(0, 6));
    } catch {
      setTopRelated([]);
    }
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Effects (Logic Preserved) */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    fetchBlog();
  }, [fetchBlog, location.key]);

  useEffect(() => {
    if (!blog?.id) return;
    fetchLikes(blog.id);
    fetchComments(blog.id);
    loadTopRelated(blog.id);
  }, [blog, fetchLikes, fetchComments, loadTopRelated]);

  /* -------------------------------------------------------------------------- */
  /* Events (Logic Preserved) */
  /* -------------------------------------------------------------------------- */
  const handleLike = async () => {
    if (!blog?.id || loadingLike) return;

    const prev = likes;
    const optimistic = {
      count: likes.user_liked ? likes.count - 1 : likes.count + 1,
      user_liked: !likes.user_liked,
    };

    setLikes(optimistic);
    setLoadingLike(true);

    try {
      const r = await api.likeBlog(blog.id);
      const newCount = Number(
        r?.likes_count ?? r?.likes ?? r?.total_likes ?? optimistic.count
      );
      const newLiked =
        typeof r?.user_liked === "boolean" ? r.user_liked : r?.message === "liked";

      setLikes({ count: newCount, user_liked: !!newLiked });
    } catch {
      setLikes(prev);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;

    const tmpId = "tmp_" + Date.now();

    const optimistic = {
      id: tmpId,
      blog_id: blog.id,
      name: commentName || "Guest",
      email: commentEmail || null,
      rating: commentRating ? Number(commentRating) : null,
      body: commentBody,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };

    setComments((prev) => [optimistic, ...prev]);
    setSubmittingComment(true);

    setCommentBody("");
    setCommentName("");
    setCommentEmail("");
    setCommentRating("");

    try {
      const r = await api.postComment(blog.id, {
        body: optimistic.body,
        rating: optimistic.rating,
        name: optimistic.name,
        email: optimistic.email,
        publish: false,
      });

      if (r?.comment) {
        setComments((prev) =>
          prev.map((c) => (c.id === tmpId ? r.comment : c))
        );
      }
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== tmpId));
    } finally {
      setSubmittingComment(false);
    }
  };

  const goBackToList = () => {
    navigate("/blog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* -------------------------------------------------------------------------- */
  /* Derived Content (Logic Preserved) */
  /* -------------------------------------------------------------------------- */
  let html = "";
  if (blog?.content) {
    if (typeof blog.content === "string") html = blog.content;
    else if (blog.content.html) html = blog.content.html;
    else if (Array.isArray(blog.content.blocks))
      html = blog.content.blocks.map((b) => b?.html || "").join("\n");
  } else if (blog?.content_json) {
    if (blog.content_json.html) html = blog.content_json.html;
    else if (Array.isArray(blog.content_json.blocks))
      html = blog.content_json.blocks.map((b) => b?.html || "").join("\n");
  }

  const hero = extractImageFromContent(blog);
  const heroUrl = makeAbsoluteImageUrl(hero);

  const authorName =
    blog?.author?.name || (blog?.author_id ? "Author" : "SPRADA2GLOBAL");

  const publishedAt = new Date(
    blog?.published_at || blog?.created_at || Date.now()
  );

  /* -------------------------------------------------------------------------- */
  /* SAFE conditional rendering (Enhanced Design) */
  /* -------------------------------------------------------------------------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="flex flex-col items-center p-8 rounded-xl shadow-xl bg-white">
          <svg className="animate-spin h-8 w-8 text-[#D7B15B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-[#33504F]">Loading article...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-[#F7F7F5]">
        <div className="max-w-xl mx-auto text-center p-10 bg-white rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Oops!</h2>
          <p className="text-lg text-[#33504F] mb-8">{error}</p>
          <Button
            className="px-6 py-3 bg-[#33504F] text-white hover:bg-[#14301F] transition-colors duration-300 rounded-xl font-semibold"
            onClick={goBackToList}
          >
            ← Back to Articles
          </Button>
        </div>
      </div>
    );

  if (!blog) return null;

  /* -------------------------------------------------------------------------- */
  /* MAIN RENDER (Enhanced Design) */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#F7F7F5] font-sans">
      {/* HERO SECTION - Dark background with animations */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 bg-[#14301F] overflow-hidden">
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-gray-900 to-gray-800 pointer-events-none"></div>
        
        <div className="max-w-[1100px] mx-auto px-6 sm:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="max-w-4xl text-white">
              {/* Metadata */}
              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-gray-300 font-medium">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#D7B15B]" />
                  {authorName}
                </span>
                <span className="opacity-50">•</span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D7B15B]" />
                  <span>{publishedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-[#F7F7F5] leading-tight drop-shadow-md">
                {blog.title}
              </h1>

              {/* Action Button */}
              <div className="mt-8">
                <Button
                  className="px-8 py-3 bg-[#D7B15B] text-[#14301F] hover:bg-opacity-90 transition-all duration-300 transform hover:scale-[1.02] font-semibold text-lg rounded-xl shadow-xl"
                  onClick={() =>
                    window.scrollTo({ top: window.scrollY + 500, behavior: "smooth" })
                  }
                >
                  Start Reading
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Image Container - Animated */}
        <div className="max-w-[1100px] mx-auto px-6 sm:px-12 mt-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-gray-100"
          >
            <img
              src={heroUrl}
              alt={blog.title}
              className="w-full object-cover max-h-[580px] h-full"
              onError={(e) => (e.currentTarget.src = "/images/blog-hero.jpg")}
            />
          </motion.div>
        </div>
      </section>

      {/* CONTENT + SIDEBAR */}
      <section className="py-16 bg-[#F7F7F5]">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* MAIN CONTENT COLUMN */}
            <main className="lg:col-span-2">
              <article className="bg-white rounded-3xl shadow-xl p-6 lg:p-10 border border-gray-100">

                {/* AUTHOR + LIKE BAR */}
                <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#E8E9E2] flex items-center justify-center border-2 border-[#D7B15B]">
                      <User className="w-7 h-7 text-[#33504F]" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-[#14301F] tracking-wide">
                        {authorName}
                      </div>
                      <div className="text-sm text-[#666] italic">
                        Published on {publishedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Like Button - Interactive */}
                  <div className="flex items-center gap-3">
                    <Button
                      className={`px-6 py-3 transition-all duration-200 shadow-md ${
                        likes.user_liked
                          ? "bg-[#D7B15B] text-[#14301F] hover:bg-yellow-600 transform scale-105"
                          : "bg-gray-100 text-[#33504F] hover:bg-gray-200 border border-gray-300"
                      } rounded-full font-bold`}
                      onClick={handleLike}
                      disabled={loadingLike}
                    >
                      <Heart
                        className={`w-5 h-5 inline-block mr-2 transition-colors ${
                          likes.user_liked ? "fill-[#14301F]" : "text-[#33504F]"
                        }`}
                      />
                      <span className="text-base">{likes.count} {likes.user_liked ? "Liked!" : "Like"}</span>
                    </Button>
                  </div>
                </div>

                {/* ARTICLE HTML - Enhanced Prose Styling */}
                <div
                  className="prose prose-lg max-w-none text-[#333] leading-relaxed
                             prose-h2:text-2xl prose-h2:font-extrabold prose-h2:text-[#33504F] prose-h2:border-l-4 prose-h2:pl-4 prose-h2:border-[#D7B15B] prose-h2:py-1
                             prose-h3:text-xl prose-h3:font-bold prose-h3:text-[#33504F]
                             prose-p:text-gray-700 prose-a:text-[#D7B15B] prose-a:font-medium hover:prose-a:underline
                             prose-li:text-gray-700 prose-ul:list-disc prose-ul:list-inside
                             "
                  dangerouslySetInnerHTML={{ __html: html }}
                />

                {/* COMMENTS SECTION */}
                <section className="mt-12 pt-6 border-t border-gray-200">
                  <h3 className="text-2xl font-bold text-[#33504F] mb-6">
                    Leave a Comment ({comments.length})
                  </h3>

                  {/* Form */}
                  <form onSubmit={handleSubmitComment} className="space-y-4 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-inner">
                    <textarea
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder="Share your thoughts and insights here..."
                      rows={5}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7B15B] focus:border-[#D7B15B] transition-colors resize-none"
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        placeholder="Your Name (optional)"
                        className="p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D7B15B]"
                      />

                      <input
                        type="email"
                        value={commentEmail}
                        onChange={(e) => setCommentEmail(e.target.value)}
                        placeholder="Email (optional)"
                        className="p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D7B15B]"
                      />

                      <select
                        value={commentRating}
                        onChange={(e) => setCommentRating(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-1 focus:ring-[#D7B15B]"
                      >
                        <option value="">Rate Article (optional)</option>
                        <option value="5">★★★★★ — Excellent</option>
                        <option value="4">★★★★☆ — Very good</option>
                        <option value="3">★★★☆☆ — Good</option>
                        <option value="2">★★☆☆☆ — Fair</option>
                        <option value="1">★☆☆☆☆ — Poor</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 justify-end pt-2">
                      <Button
                        variant="outline"
                        type="button" 
                        onClick={() => {
                          setCommentBody("");
                          setCommentName("");
                          setCommentEmail("");
                          setCommentRating("");
                        }}
                        className="text-gray-600 border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        Clear
                      </Button>

                      <Button
                        type="submit"
                        className="bg-[#33504F] text-white hover:bg-[#14301F] transition-colors duration-300 shadow-lg disabled:opacity-50"
                        disabled={submittingComment || !commentBody.trim()}
                      >
                        {submittingComment ? "Posting..." : "Submit Comment"}
                      </Button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-5">
                    {comments.length === 0 ? (
                      <div className="text-center py-6 text-base text-gray-500 bg-gray-100 rounded-xl">Be the first to comment!</div>
                    ) : (
                      comments.map((c) => (
                        <div
                          key={c.id}
                          className={`p-5 rounded-xl transition-shadow duration-300 ${
                            c._optimistic
                              ? "bg-yellow-50 border border-yellow-300 opacity-80 animate-pulse"
                              : "bg-white shadow-lg border border-gray-100 hover:shadow-xl"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3 border-b pb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[#D7B15B]" />
                              <span className="text-sm font-bold text-[#14301F]">
                                {c.name || "Anonymous User"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(c.created_at).toLocaleString()}
                            </div>
                          </div>

                          <p className="text-base text-[#444] mb-3">{c.body}</p>

                          {c.rating && (
                            <div className="text-sm font-medium text-yellow-600">
                              Rating: {"★".repeat(c.rating)}
                            </div>
                          )}
                          {c._optimistic && <div className="text-xs text-yellow-700 mt-2 italic">Awaiting moderation... (Optimistic Post)</div>}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </article>
            </main>

            {/* SIDEBAR COLUMN */}
            <aside className="space-y-8">
              {/* Contact Card */}
              <Card className="p-6 rounded-2xl shadow-xl border-t-4 border-[#D7B15B] bg-white">
                <CardContent className="p-0">
                  <h4 className="text-xl font-bold text-[#33504F] mb-4 border-b pb-3">
                    Get in Touch
                  </h4>
                  <div className="text-sm text-gray-600 space-y-3">
                    <div className="flex items-center gap-3">
                      <MailIcon className="w-5 h-5 text-[#D7B15B]" />
                      <a href="mailto:info@sprada2global.com" className="hover:text-[#33504F] transition-colors">info@sprada2global.com</a>
                    </div>
                    <div className="pt-3">
                      <Button
                        className="w-full bg-[#D7B15B] text-[#14301F] hover:bg-opacity-90 transition-all font-semibold rounded-xl shadow-lg"
                        onClick={() => navigate("/contact")}
                      >
                        Contact Our Experts
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Posts Card */}
              <Card className="p-6 rounded-2xl shadow-xl bg-white">
                <CardContent className="p-0">
                  <h4 className="text-xl font-bold text-[#33504F] mb-5 border-b pb-3">
                    More to Explore
                  </h4>

                  <div className="space-y-4">
                    {topRelated.length === 0 ? (
                      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">No other related posts found.</div>
                    ) : (
                      topRelated.map((t) => {
                        const thumb =
                          t.og_image || t.image || "/images/placeholder.png";
                        const postDate = new Date(t.published_at || t.created_at || Date.now()).toLocaleDateString();

                        return (
                          <div 
                            key={t.id} 
                            className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer group"
                            onClick={() =>
                              navigate(`/blog/${encodeURIComponent(t.slug)}`)
                            }
                          >
                            {/* Image component - must use Image import */}
                            <Image
                              src={makeAbsoluteImageUrl(thumb)}
                              alt={t.title}
                              width={140}
                              height={88}
                              className="w-24 h-16 object-cover rounded-lg flex-shrink-0 shadow-md transition-transform group-hover:scale-[1.05]"
                            />

                            <div className="flex-1">
                              <div className="text-base font-semibold text-[#23523e] group-hover:text-[#D7B15B] transition-colors leading-snug">
                                {t.title}
                              </div>

                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-[#D7B15B]" />
                                <span>{postDate}</span>
                              </div>

                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <Heart className="w-3 h-3 text-red-400" />
                                <span>{t.likes_count || 0} likes</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}