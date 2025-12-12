    import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";

export default function Social() {
  const [feed, setFeed] = useState([
    {
      id: 1,
      user: "Aditi",
      time: "2 hours ago",
      image:
        "https://images.unsplash.com/photo-1599981683516-c95c259c0d56?q=80&w=1000",
      action: "Recycled 2.1 kg of plastic today!",
      liked: false,
      saved: false,
    },
    {
      id: 2,
      user: "Rahul",
      time: "4 hours ago",
      image:
        "https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000",
      action: "Biked 4.5 km to work!",
      liked: false,
      saved: false,
    },
  ]);

  function toggleLike(id) {
    setFeed((items) =>
      items.map((p) =>
        p.id === id ? { ...p, liked: !p.liked } : p
      )
    );
  }

  function toggleSave(id) {
    setFeed((items) =>
      items.map((p) =>
        p.id === id ? { ...p, saved: !p.saved } : p
      )
    );
  }

  return (
    <div className="p-8 text-white max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Community Feed</h1>

      <div className="flex flex-col gap-10">
        {feed.map((post) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="feed-card bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center font-bold text-lg">
                {post.user[0]}
              </div>
              <div>
                <div className="font-semibold">{post.user}</div>
                <div className="text-gray-400 text-xs">{post.time}</div>
              </div>
            </div>

            {/* Image */}
            <motion.img
              src={post.image}
              className="feed-image w-full max-h-[460px] object-cover"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            />

            {/* Caption */}
            <div className="px-5 py-3 text-gray-300 text-sm">
              {post.action}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
              <div className="flex items-center gap-6">
                {/* Like */}
                <motion.button
                  whileTap={{ scale: 1.3 }}
                  onClick={() => toggleLike(post.id)}
                >
                  {post.liked ? (
                    <FaHeart className="text-red-500 like-anim text-xl" />
                  ) : (
                    <FaRegHeart className="text-gray-300 text-xl" />
                  )}
                </motion.button>

                {/* Comment */}
                <motion.button whileTap={{ scale: 1.2 }}>
                  <FaRegComment className="text-gray-300 text-xl" />
                </motion.button>
              </div>

              {/* Save */}
              <motion.button
                whileTap={{ scale: 1.2 }}
                onClick={() => toggleSave(post.id)}
              >
                {post.saved ? (
                  <FaBookmark className="text-blue-400 save-anim text-xl" />
                ) : (
                  <FaRegBookmark className="text-gray-300 text-xl" />
                )}
              </motion.button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
