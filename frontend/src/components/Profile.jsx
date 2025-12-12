import React from "react";
import { motion } from "framer-motion";
import { FaLeaf, FaBolt, FaStar, FaMedal, FaPen } from "react-icons/fa";

export default function Profile() {
  const user = {
    name: "MohammadSaalim",
    username: "@saalim",
    level: 5,
    xp: 940,
    nextLevel: 1200,
    streak: 9,
    co2: 12.4,
    joined: "January 2025",
  };

  const badges = [
    { id: 1, icon: <FaStar />, title: "Eco Achiever", desc: "100 XP Milestone" },
    { id: 2, icon: <FaBolt />, title: "Streak Master", desc: "7-Day Streak" },
    { id: 3, icon: <FaLeaf />, title: "Green Hero", desc: "Saved 10kg CO₂" },
    { id: 4, icon: <FaMedal />, title: "Top 3", desc: "Leaderboard Rank" },
  ];

  const activity = [
    "Recycled plastic waste (+12 XP)",
    "Biked to work (+8 XP)",
    "Avoided single-use plastic (+5 XP)",
    "Carpooled to university (+7 XP)",
  ];

  const xpProgress = Math.min(1, user.xp / user.nextLevel) * 100;

  return (
    <div className="p-8 text-white max-w-4xl mx-auto space-y-10">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-4xl font-bold shadow-lg">
            Z
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-gray-400 text-sm">{user.username}</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-sm"
              >
                <FaPen className="inline mr-2" /> Edit Profile
              </motion.button>
            </div>

            {/* Level */}
            <div className="mt-4">
              <div className="text-sm text-gray-300 mb-1">
                Level {user.level} • {user.xp} / {user.nextLevel} XP
              </div>

              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="h-3 bg-gradient-to-r from-green-400 to-teal-400 rounded-full"
                />
              </div>
            </div>

            {/* Join date */}
            <p className="mt-3 text-xs text-gray-400">Joined: {user.joined}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
        >
          <FaLeaf className="text-green-300 text-3xl mx-auto mb-3" />
          <div className="text-2xl font-bold">{user.co2} kg</div>
          <p className="text-sm text-gray-400">CO₂ Saved</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
        >
          <FaBolt className="text-yellow-300 text-3xl mx-auto mb-3" />
          <div className="text-2xl font-bold">{user.streak} Days</div>
          <p className="text-sm text-gray-400">Activity Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
        >
          <FaMedal className="text-blue-300 text-3xl mx-auto mb-3" />
          <div className="text-2xl font-bold">{badges.length}</div>
          <p className="text-sm text-gray-400">Badges Earned</p>
        </motion.div>
      </div>

      {/* Badge Collection */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Achievements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((b) => (
            <motion.div
              key={b.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3"
            >
              <div className="p-3 rounded-xl bg-white/10 text-xl">{b.icon}</div>

              <div>
                <div className="font-semibold">{b.title}</div>
                <div className="text-gray-400 text-sm">{b.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>

        <div className="space-y-3">
          {activity.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm"
            >
              {a}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
