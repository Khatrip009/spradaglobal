// src/components/pages/BlogDetailsPage.jsx
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
/* Helpers */
/* -------------------------------------------------------------------------- */
/**
 * Normalize image URL to a usable absolute URL.
 * - If url is absolute (http/https) return it unchanged, except:
 *     * if it points to the current origin and looks like an uploads path, rewrite to api.UPLOADS_BASE if provided
 * - If url is root-relative (/uploads/...), prefix with api.UPLOADS_BASE if available, otherwise leave as-is
 * - If url is relative, prefix with api.UPLOADS_BASE if available
 */
function makeAbsoluteImageUrl(url, fallback = "/images/placeholder.png") {
  try {
    if (!url) return fallback;
    if (typeof url !== "string") return fallback;
    const trimmed = url.trim();
    if (trimmed === "") return fallback;

    // absolute url -> keep, but if it points to current origin's /uploads and UPLOADS_BASE provided, rewrite
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const u = new URL(trimmed);
        const currentOrigin = window.location.origin.replace(/\/$/, "");
        // if image points to same origin and path contains /uploads and UPLOADS_BASE is configured, rewrite
        if ((u.origin === currentOrigin || u.origin === (window.location.protocol + '//' + window.location.host))
            && u.pathname.match(/\/uploads(\/|$)/) && api.UPLOADS_BASE) {
          return `${api.UPLOADS_BASE}${u.pathname}${u.search || ""}`;
        }
      } catch (e) {
        // ignore URL parse errors
      }
      return trimmed;
    }

    // protocol-relative (//example.com/...)
    if (/^\/\//.test(trimmed)) return `${window.location.protocol}${trimmed}`;

    // root-relative: /uploads/...
    if (trimmed.startsWith("/")) {
      if (api.UPLOADS_BASE) return `${api.UPLOADS_BASE.replace(/\/$/, "")}${trimmed}`;
      return trimmed;
    }

    // relative path: prefer UPLOADS_BASE
    if (api.UPLOADS_BASE) return `${api.UPLOADS_BASE.replace(/\/$/, "")}/${trimmed.replace(/^\//, "")}`;

    // fallback: assume same-origin relative
    return `${window.location.origin.replace(/\/$/, "")}/${trimmed.replace(/^\//, "")}`;
  } catch (err) {
    return fallback;
  }
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
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  /* ------------------------------ State ------------------------------ */
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
  /* Fetch Blog */
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
  /* Fetch Likes */
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
  /* Fetch Comments */
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
  /* Fetch Related Posts */
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
  /* Effects */
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
  /* Events */
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
  /* Derived Content (AFTER hooks — safe) */
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
  /* SAFE conditional rendering (AFTER all hooks) */
  /* -------------------------------------------------------------------------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#666]">
        Loading article...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-[#33504F] mb-4">Error</h2>
          <p className="text-sm text-[#666] mb-6">{error}</p>
          <Button variant="outline" onClick={goBackToList}>
            Back to articles
          </Button>
        </div>
      </div>
    );

  if (!blog) return null;

  /* -------------------------------------------------------------------------- */
  /* MAIN RENDER */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* HERO */}
      <section className="relative py-12 sm:py-20 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-12">

          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-3xl text-[#EAEAEA]">
              <div className="mb-3 flex items-center gap-3 text-sm opacity-90">
                <User className="w-4 h-4" />
                <span className="font-medium">{authorName}</span>
                <span className="mx-2">•</span>
                <Calendar className="w-4 h-4" />
                <span>{publishedAt.toLocaleDateString()}</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight">
                {blog.title}
              </h1>

              <div className="mt-6">
                <Button
                  className="px-4 py-2 bg-[#D7B15B] text-[#14301F]"
                  onClick={() =>
                    window.scrollTo({ top: window.scrollY + 300, behavior: "smooth" })
                  }
                >
                  Read Article
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="max-w-[1100px] mx-auto px-6 sm:px-12 mt-6">
          <div className="rounded-2xl overflow-hidden shadow-lg border bg-gray-100">
            <img
              src={heroUrl}
              alt={blog.title}
              className="w-full object-cover max-h-[520px]"
              onError={(e) => (e.currentTarget.src = "/images/blog-hero.jpg")}
            />
          </div>
        </div>
      </section>

      {/* CONTENT + SIDEBAR */}
      <section className="py-12">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <main className="lg:col-span-2">
              <article className="bg-white rounded-2xl shadow-md p-6 lg:p-10">

                {/* AUTHOR + LIKE */}
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#E8E9E2] flex items-center justify-center">
                      <User className="w-6 h-6 text-[#33504F]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#14301F]">
                        {authorName}
                      </div>
                      <div className="text-xs text-[#666]">
                        {publishedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      className={`px-4 py-2 border rounded-lg ${
                        likes.user_liked ? "bg-[#D7B15B] text-[#14301F]" : ""
                      }`}
                      onClick={handleLike}
                      disabled={loadingLike}
                    >
                      <Heart className="w-4 h-4 inline-block mr-2" />
                      {likes.count} {likes.user_liked ? "Liked" : "Like"}
                    </Button>
                  </div>
                </div>

                {/* ARTICLE HTML */}
                <div
                  className="prose prose-sm sm:prose lg:prose-lg max-w-none text-[#333]"
                  dangerouslySetInnerHTML={{ __html: html }}
                />

                {/* COMMENTS */}
                <section className="mt-10">
                  <h3 className="text-lg font-semibold text-[#33504F] mb-4">
                    Comments
                  </h3>

                  {/* Form */}
                  <form onSubmit={handleSubmitComment} className="space-y-3 mb-6">
                    <textarea
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder="Write your comment..."
                      rows={4}
                      className="w-full p-3 border rounded-md"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        placeholder="Your name (optional)"
                        className="p-2 border rounded"
                      />

                      <input
                        type="email"
                        value={commentEmail}
                        onChange={(e) => setCommentEmail(e.target.value)}
                        placeholder="Email (optional)"
                        className="p-2 border rounded"
                      />

                      <select
                        value={commentRating}
                        onChange={(e) => setCommentRating(e.target.value)}
                        className="p-2 border rounded"
                      >
                        <option value="">Rate (optional)</option>
                        <option value="5">5 — Excellent</option>
                        <option value="4">4 — Very good</option>
                        <option value="3">3 — Good</option>
                        <option value="2">2 — Fair</option>
                        <option value="1">1 — Poor</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCommentBody("");
                          setCommentName("");
                          setCommentEmail("");
                          setCommentRating("");
                        }}
                      >
                        Clear
                      </Button>

                      <Button
                        type="submit"
                        className="bg-[#D7B15B] text-[#14301F]"
                        disabled={submittingComment}
                      >
                        {submittingComment ? "Submitting..." : "Submit Comment"}
                      </Button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-sm text-[#666]">No comments yet.</div>
                    ) : (
                      comments.map((c) => (
                        <div
                          key={c.id}
                          className={`p-4 rounded-lg ${
                            c._optimistic
                              ? "border border-dashed opacity-80"
                              : "bg-white shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold">
                              {c.name || "Guest"}
                            </div>
                            <div className="text-xs text-[#999]">
                              {new Date(c.created_at).toLocaleString()}
                            </div>
                          </div>

                          <div className="text-sm text-[#444] mb-2">{c.body}</div>

                          {c.rating && (
                            <div className="text-xs text-[#666]">
                              Rating: {c.rating} / 5
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </article>
            </main>

            {/* SIDEBAR */}
            <aside className="space-y-6">
              <Card className="p-4">
                <CardContent className="p-0">
                  <h4 className="text-lg font-semibold text-[#33504F] mb-3">
                    Contact
                  </h4>
                  <div className="text-sm text-[#666]">
                    <div className="flex items-center gap-2">
                      <MailIcon className="w-4 h-4 text-[#D7B15B]" />
                      <span>info@sprada2global.com</span>
                    </div>
                    <div className="mt-4">
                      <Button
                        className="w-full bg-[#D7B15B] text-[#14301F]"
                        onClick={() => navigate("/contact")}
                      >
                        Contact Our Experts
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Posts */}
              <Card className="p-4">
                <CardContent className="p-0">
                  <h4 className="text-lg font-semibold text-[#33504F] mb-3">
                    Related Posts
                  </h4>

                  <div className="space-y-4">
                    {topRelated.length === 0 ? (
                      <div className="text-sm text-[#666]">No related posts.</div>
                    ) : (
                      topRelated.map((t) => {
                        const thumb =
                          t.og_image || t.image || "/images/placeholder.png";

                        return (
                          <div key={t.id} className="flex items-start gap-3">
                            <Image
                              src={makeAbsoluteImageUrl(thumb)}
                              alt={t.title}
                              width={140}
                              height={88}
                              className="w-20 h-14 object-cover rounded"
                            />

                            <div className="flex-1">
                              <div className="text-sm font-semibold text-[#23523e]">
                                {t.title}
                              </div>

                              <div className="text-xs text-[#666] mt-1">
                                {t.avg_rating ? `${t.avg_rating} ★ • ` : ""}
                                {t.likes_count || 0} likes
                              </div>

                              <div className="mt-2">
                                <Button
                                  className="text-xs px-3 py-1 border rounded"
                                  onClick={() =>
                                    navigate(`/blog/${encodeURIComponent(t.slug)}`)
                                  }
                                >
                                  Read
                                </Button>
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
