import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Leaderboard from "./Leaderboard";
import Social from "./Social";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Home,
  CalendarCheck,
  Trophy,
  Users,
  User,
  Menu,
  X,
} from "lucide-react";

/**
 * CarbonDashboard.jsx
 * - Wide landscape feed (Option B)
 * - Like / Comment / Share / Save stateful interactions
 * - Dark X-like theme, Tailwind CSS required
 */

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
  { id: "today", label: "Today's Progress", icon: <CalendarCheck size={18} /> },
  { id: "leaderboard", label: "Leaderboard", icon: <Trophy size={18} /> },
  { id: "social", label: "Social", icon: <Users size={18} /> },
  { id: "profile", label: "Profile", icon: <User size={18} /> },
];

// sample posts (landscape)
const initialPosts = [
  {
    id: "p1",
    author: "Aditi",
    avatarBg: "from-green-400 to-teal-500",
    time: "2h",
    image: "https://images.unsplash.com/photo-1528747045269-390fe33c19d3?w=1600&q=80&auto=format&fit=crop",
    caption: "Recycled 2.1 kg plastic today! Small steps, big impact ♻️",
    likes: 42,
    comments: [
      { id: "c1", user: "Rahul", text: "Amazing! Keep going 🙌" },
      { id: "c2", user: "Sneha", text: "Inspired to do the same 🌱" },
    ],
  },
  {
    id: "p2",
    author: "Rahul",
    avatarBg: "from-orange-500 to-yellow-500",
    time: "4h",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1600&q=80&auto=format&fit=crop",
    caption: "Biked 4.5 km to work. Saved CO₂ and felt great 🚴",
    likes: 27,
    comments: [{ id: "c3", user: "Aditi", text: "Nice ride!" }],
  },
  {
    id: "p3",
    author: "Sneha",
    avatarBg: "from-lime-400 to-emerald-500",
    time: "1d",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1600&q=80&auto=format&fit=crop",
    caption: "Planted a sapling today 🌱 — join me next weekend!",
    likes: 64,
    comments: [],
  },
];

function IconButton({ children, onClick, active, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center gap-2 text-sm hover:text-white transition ${active ? "text-rose-400" : "text-gray-300"}`}
    >
      {children}
    </button>
  );
}

function PostCard({
  post,
  onToggleLike,
  onToggleSave,
  onAddComment,
  onShare,
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden shadow-lg max-w-4xl"
    >
      {/* header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${post.avatarBg} flex items-center justify-center text-white font-bold`}>
          {post.author.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{post.author}</div>
            <div className="text-xs text-gray-400">· {post.time}</div>
          </div>
        </div>
      </div>

      {/* image */}
      <div className="w-full border-t border-b border-white/6">
        <img src={post.image} alt={post.caption} className="w-full object-cover max-h-[520px] mx-auto" />
      </div>

      {/* caption */}
      <div className="px-5 py-4">
        <p className="text-sm text-gray-200 mb-3">{post.caption}</p>

        {/* actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <IconButton
              onClick={() => onToggleLike(post.id)}
              active={post.liked}
              title="Like"
            >
              <motion.span whileTap={{ scale: 0.9 }} className="flex items-center gap-2">
                <Heart size={18} />
                <span className="text-sm">{post.likes}</span>
              </motion.span>
            </IconButton>

            <IconButton
              onClick={() => setShowComments((s) => !s)}
              active={showComments}
              title="Comments"
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={18} />
                <span className="text-sm">{post.comments.length}</span>
              </div>
            </IconButton>

            <IconButton onClick={() => onShare(post.id)} title="Share">
              <Share2 size={18} />
            </IconButton>
          </div>

          <IconButton
            onClick={() => onToggleSave(post.id)}
            active={post.saved}
            title="Save"
          >
            <Bookmark size={18} />
          </IconButton>
        </div>

        {/* comments area */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-4"
            >
              <div className="space-y-3 mb-3 max-h-40 overflow-auto pr-2">
                {post.comments.length === 0 && (
                  <div className="text-sm text-gray-400">No comments yet — be the first!</div>
                )}
                {post.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/6 flex items-center justify-center text-xs text-white font-semibold">
                      {c.user.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm">
                        <span className="font-semibold mr-2">{c.user}</span>
                        <span className="text-gray-300">{c.text}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/3 placeholder:text-gray-400 rounded-full px-4 py-2 text-sm outline-none"
                />
                <button
                  onClick={() => {
                    if (!commentText.trim()) return;
                    onAddComment(post.id, commentText.trim());
                    setCommentText("");
                  }}
                  className="px-4 py-2 bg-green-500 text-black rounded-full font-semibold hover:brightness-105 transition"
                >
                  Post
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

export default function CarbonDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("social");

  // posts in local state with interactive flags
  const [posts, setPosts] = useState(
    initialPosts.map((p) => ({ ...p, liked: false, saved: false }))
  );

  const [toast, setToast] = useState(null);

  function toggleLike(postId) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
            ...p,
            liked: !p.liked,
            likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1,
          }
          : p
      )
    );
  }

  function toggleSave(postId) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p)));
    const p = posts.find((x) => x.id === postId);
    setToast(p && !p.saved ? "Saved" : "Removed");
    clearToast();
  }

  function addComment(postId, text) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
            ...p,
            comments: [...p.comments, { id: `c${Date.now()}`, user: "You", text }],
          }
          : p
      )
    );
    setToast("Comment posted");
    clearToast();
  }

  async function sharePost(postId) {
    const post = posts.find((p) => p.id === postId);
    const url = post ? post.image : window.location.href;
    // try clipboard, fallback to simple toast
    try {
      await navigator.clipboard.writeText(url);
      setToast("Image URL copied to clipboard");
    } catch {
      setToast("Share link (copy): " + url);
    }
    clearToast();
  }

  function clearToast() {
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <div className="min-h-screen flex bg-[#0b1220] text-white">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen flex flex-col border-r border-white/8 
  bg-white/3 backdrop-blur-xl z-50 transition-all duration-300 
  ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!collapsed && <div className="text-lg font-bold">Carbon Tracker</div>}
          <button onClick={() => setCollapsed((s) => !s)} className="p-2 rounded hover:bg-white/6">
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((mi) => (
            <button
              key={mi.id}
              onClick={() => setActive(mi.id)}
              className={`group w-full flex items-center gap-3 px-3 py-3 rounded-lg transition ${active === mi.id ? "bg-white/8" : "hover:bg-white/6"}`}
            >
              <div className="w-10 flex items-center justify-center text-gray-100">{mi.icon}</div>
              {!collapsed && <div className="text-sm font-medium">{mi.label}</div>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 text-center">
          <div className="text-xs text-gray-300">Total Points</div>
          <div className="text-green-400 font-bold">128 pts</div>
        </div>
      </aside>

      {/* Main */}
      <main
        className={`flex-1 overflow-auto p-10 transition-all duration-300 
  ${collapsed ? "ml-20" : "ml-64"}`}
      >
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold">{active.charAt(0).toUpperCase() + active.slice(1)}</h1>
        </header>

        {/* Social feed (wide landscape cards) */}
        {active === "social" && <Social />}
        {active === "dashboard" && <Dashboard />}
        {active === "today" && <Dashboard />}
        {active === "leaderboard" && <Leaderboard />}
        {active === "profile" && <Profile />}



        {/* other pages simple placeholders */}
        {/* {active !== "social" && (
          <div className="bg-white/5 border border-white/8 rounded-2xl p-8 max-w-4xl">
            <h2 className="text-2xl font-semibold mb-2">{active}</h2>
            <p className="text-gray-300">Content for {active} will appear here.</p>
          </div>
        )} */}
      </main>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed right-6 bottom-6 bg-white/6 px-4 py-2 rounded-lg text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
