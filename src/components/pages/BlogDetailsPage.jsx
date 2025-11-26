// src/components/pages/BlogDetailsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Image } from "../ui/image";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, User, Mail as MailIcon } from "lucide-react";
import * as api from "../../lib/api";
import { useToast } from "../ui/ToastProvider";

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blog, setBlog] = useState(null);
  const [likes, setLikes] = useState({ count: 0, user_liked: false });
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentRating, setCommentRating] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [topRelated, setTopRelated] = useState([]);
  const [optimisticLike, setOptimisticLike] = useState(null);

  const normalizedSlug = typeof slug === "string" ? decodeURIComponent(slug) : slug;

  const fetchBlog = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!normalizedSlug) {
      setError("Invalid article URL");
      setLoading(false);
      return;
    }
    try {
      const r = await api.getBlogBySlug(normalizedSlug);
      const normalized = (r && r.blog) ? r.blog : r;
      if (!normalized) {
        setError("Article not found");
        setBlog(null);
      } else {
        setBlog(normalized);
      }
    } catch (err) {
      console.error("[BlogDetails] getBlogBySlug error", err);
      setError((err && (err.message || err.error)) || "Failed to load article");
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [normalizedSlug]);

  const fetchLikes = useCallback(async (blogId) => {
    if (!blogId) return;
    try {
      const r = await api.getLikes(blogId);
      if (r && r.likes_count !== undefined) {
        setLikes({ count: Number(r.likes_count || 0), user_liked: !!r.user_liked });
      } else if (r && typeof r === "object" && r.ok && r.likes_count !== undefined) {
        setLikes({ count: Number(r.likes_count || 0), user_liked: !!r.user_liked });
      }
    } catch (err) {
      console.warn("[BlogDetails] getLikes error", err);
    }
  }, []);

  const fetchComments = useCallback(async (blogId) => {
    if (!blogId) return;
    try {
      const r = await api.getComments(blogId);
      if (r && r.comments) setComments(r.comments);
      else if (Array.isArray(r)) setComments(r);
    } catch (err) {
      console.warn("[BlogDetails] getComments error", err);
    }
  }, []);

  // get top related posts (client-side sort using listing which includes likes_count & avg_rating)
  const loadTopRelated = useCallback(async (currentId) => {
    try {
      // fetch a reasonable set (20) and compute top 5 by avg_rating then likes_count
      const res = await api.getBlogs({ limit: 20 });
      const list = (res && res.blogs) ? res.blogs : (Array.isArray(res) ? res : []);
      const filtered = list.filter(b => b.id !== currentId && b.is_published !== false);
      filtered.sort((a,b) => {
        const ar = (b.avg_rating || 0) - (a.avg_rating || 0);
        if (ar !== 0) return ar;
        return (b.likes_count || 0) - (a.likes_count || 0);
      });
      setTopRelated(filtered.slice(0,5));
    } catch (err) {
      console.warn("[BlogDetails] loadTopRelated error", err);
    }
  }, []);

  useEffect(() => {
    // re-fetch when slug or location.key changes (ensures navigation remount behavior)
    fetchBlog();
  }, [fetchBlog, location.key]);

  useEffect(() => {
    if (blog && blog.id) {
      fetchLikes(blog.id);
      fetchComments(blog.id);
      loadTopRelated(blog.id);
    }
  }, [blog, fetchLikes, fetchComments, loadTopRelated]);

  const handleLike = async () => {
    if (!blog || !blog.id) {
      toast.show("Article not loaded", { duration: 2000 });
      return;
    }
    // optimistic update
    const wasLiked = likes.user_liked;
    const old = { ...likes };
    setOptimisticLike(!wasLiked);
    setLikes(prev => ({ ...prev, count: (prev.count || 0) + (wasLiked ? -1 : 1), user_liked: !wasLiked }));

    try {
      await api.likeBlog(blog.id);
      toast.show(wasLiked ? "Unliked" : "Liked", { duration: 2000 });
      // keep as-is; server will be consistent next fetch
    } catch (err) {
      // revert
      setLikes(old);
      setOptimisticLike(null);
      console.error("[BlogDetails] like error", err);
      toast.show("Failed to register like — are you logged in?", { variant: "destructive", duration: 3500 });
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentBody || String(commentBody).trim() === "") {
      toast.show("Please enter a comment", { duration: 2000 });
      return;
    }
    if (!blog || !blog.id) {
      toast.show("Article not loaded", { duration: 2000 });
      return;
    }

    // optimistic comment entry
    const tempId = `tmp_${Date.now()}`;
    const optimistic = {
      id: tempId,
      blog_id: blog.id,
      user_id: null,
      name: commentName || "Guest",
      email: commentEmail || null,
      rating: commentRating || null,
      body: commentBody,
      is_published: false,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setComments(prev => [optimistic, ...prev]);
    setSubmittingComment(true);
    setCommentBody("");
    setCommentName("");
    setCommentEmail("");
    setCommentRating(null);

    try {
      const resp = await api.postComment(blog.id, { body: optimistic.body, rating: optimistic.rating, name: optimistic.name, email: optimistic.email, publish: false });
      if (resp && resp.ok && resp.comment) {
        setComments(prev => prev.map(c => (c.id === tempId ? resp.comment : c)));
        toast.show("Comment submitted — awaiting moderation", { duration: 3000 });
      } else {
        toast.show("Comment submitted (server response unexpected)", { duration: 3000 });
      }
    } catch (err) {
      // remove optimistic
      setComments(prev => prev.filter(c => c.id !== tempId));
      console.error("[BlogDetails] postComment error", err);
      toast.show("Failed to submit comment. Try again later.", { variant: "destructive", duration: 3500 });
    } finally {
      setSubmittingComment(false);
    }
  };

  const goBackToList = () => {
    navigate("/blog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-[#666]">Loading article...</div>;
  if (error) return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-[#33504F] mb-4">Error</h2>
        <p className="text-sm text-[#666] mb-6">{error}</p>
        <Button variant="outline" onClick={goBackToList}>Back to articles</Button>
      </div>
    </div>
  );
  if (!blog) return null;

  // derive html content
  let html = "";
  if (blog.content) {
    if (typeof blog.content === "string") html = blog.content;
    else if (blog.content.html) html = blog.content.html;
    else if (Array.isArray(blog.content.blocks)) html = blog.content.blocks.map(b => (typeof b === 'string' ? b : b.html || '')).join('\n');
    else html = blog.excerpt || "";
  } else {
    html = blog.excerpt || "";
  }

  return (
    <div className="min-h-screen bg-[#E8E9E2]">
      {/* Title hero */}
      <section className="relative py-12 sm:py-20 md:py-24 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(51,80,79,0.85), rgba(51,80,79,0.85)), url('${blog.og_image || (blog.images && blog.images[0] && blog.images[0].url) || '/images/hero-products.jpg'}')` }}>
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-4">
                <div className="text-sm text-white/90 mb-2 flex items-center gap-3"><User className="w-4 h-4" />{blog.author_id ? 'Author' : 'SPRADA2GLOBAL'}</div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-3 leading-tight">{blog.title}</h1>
                <div className="text-sm text-white/90 flex items-center gap-3">
                  <Calendar className="w-4 h-4" />{new Date(blog.published_at || blog.created_at).toLocaleDateString()} {blog.readTime ? `• ${blog.readTime}` : ''}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured image */}
      {(blog.og_image || (blog.images && blog.images[0] && blog.images[0].url)) && (
        <section className="py-8 bg-white">
          <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="rounded-2xl overflow-hidden shadow-xl">
              <Image src={blog.og_image || (blog.images && blog.images[0] && blog.images[0].url)} alt={blog.title} width={1200} height={600} className="w-full h-48 sm:h-64 md:h-96 lg:h-[600px] object-cover" />
            </motion.div>
          </div>
        </section>
      )}

      {/* Main content */}
      <section className="py-10 sm:py-16 bg-[#E8E9E2]">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="text-sm text-[#666]">{blog.tags && blog.tags.join?.(", ")}</div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleLike} className="px-4 py-2 rounded-lg border">{likes.user_liked ? '💚 Liked' : '👍 Like'} {likes.count || 0}</Button>
                    <Button variant="outline" onClick={goBackToList}>← Back to articles</Button>
                  </div>
                </div>

                <div className="prose prose-sm sm:prose lg:prose-lg max-w-none font-paragraph text-[#666666] leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />

                {/* Comments */}
                <div className="mt-8 pt-6 border-t border-[#CFD0C8]">
                  <h3 className="text-lg font-heading font-semibold text-[#33504F] mb-3">Comments</h3>

                  <form onSubmit={handleSubmitComment} className="mb-6 space-y-3">
                    <textarea value={commentBody} onChange={(e) => setCommentBody(e.target.value)} rows={4} className="w-full p-3 border rounded" placeholder="Write your comment..." />
                    <div className="flex gap-2">
                      <input type="text" value={commentName} onChange={(e) => setCommentName(e.target.value)} placeholder="Your name (optional)" className="p-2 border rounded flex-1" />
                      <input type="email" value={commentEmail} onChange={(e) => setCommentEmail(e.target.value)} placeholder="Email (optional)" className="p-2 border rounded w-44" />
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={commentRating || ""} onChange={(e) => setCommentRating(e.target.value || null)} className="p-2 border rounded w-36">
                        <option value="">Rate (optional)</option>
                        <option value="5">5 — Excellent</option>
                        <option value="4">4 — Very good</option>
                        <option value="3">3 — Good</option>
                        <option value="2">2 — Fair</option>
                        <option value="1">1 — Poor</option>
                      </select>
                      <Button type="submit" className="bg-[#D7B15B] text-[#33504F]" disabled={submittingComment}>{submittingComment ? "Submitting..." : "Submit Comment"}</Button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {comments.length === 0 ? <div className="text-sm text-[#666]">No comments yet.</div> : comments.map((c) => (
                      <div key={c.id} className={`p-4 rounded-lg ${c._optimistic ? "opacity-80 border border-dashed" : "bg-white shadow-sm"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold">{c.name || "Guest"}</div>
                          <div className="text-xs text-[#999]">{new Date(c.created_at).toLocaleString()}</div>
                        </div>
                        <div className="text-sm text-[#444] mb-2">{c.body}</div>
                        {c.rating ? <div className="text-xs text-[#666]">Rating: {c.rating} / 5</div> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <Card className="p-4">
                <CardContent className="p-0">
                  <h3 className="text-lg font-heading font-semibold text-[#33504F] mb-3">Contact</h3>
                  <div className="text-sm text-[#666666]">
                    <div className="flex items-center gap-2 text-sm"><MailIcon className="w-4 h-4 text-[#D7B15B]" /><span>info@sprada2global.com</span></div>
                    <div className="mt-4">
                      <Button className="w-full bg-[#D7B15B] text-[#33504F]">Contact Our Experts</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardContent className="p-0">
                  <h3 className="text-lg font-heading font-semibold text-[#33504F] mb-3">Related posts</h3>
                  <div className="space-y-3">
                    {topRelated.length === 0 ? <div className="text-sm text-[#666]">No related posts.</div> : topRelated.map((t) => (
                      <div key={t.id} className="flex items-start gap-3">
                        <Image src={t.image || '/images/placeholder.png'} alt={t.title} width={120} height={80} className="w-20 h-14 object-cover rounded" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-[#33504F]">{t.title}</div>
                          <div className="text-xs text-[#666]">{t.avg_rating ? `${t.avg_rating} ★` : ''} • {t.likes_count || 0} likes</div>
                          <div className="mt-2">
                            <Button onClick={() => navigate(`/blog/${encodeURIComponent(t.slug)}`)} className="text-xs px-3 py-1 border rounded">Read</Button>
                          </div>
                        </div>
                      </div>
                    ))}
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
