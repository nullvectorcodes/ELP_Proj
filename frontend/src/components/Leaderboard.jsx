import React from "react";
import { motion } from "framer-motion";
import { FaCrown, FaMedal } from "react-icons/fa";

export default function Leaderboard() {
  const players = [
    { id: 1, name: "Sufiyan", xp: 1280, level: 7, streak: 12 },
    { id: 2, name: "Saalim", xp: 940, level: 5, streak: 9 },
    { id: 3, name: "Yash", xp: 780, level: 4, streak: 5 },
    { id: 4, name: "Vihaan", xp: 600, level: 3, streak: 4 },
    { id: 5, name: "Ishaan", xp: 430, level: 3, streak: 2 },
  ];

  // XP progress bar width
  const maxXP = Math.max(...players.map((p) => p.xp));

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>

      <div className="space-y-4">
        {players.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            whileHover={{ scale: 1.01 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex items-center gap-5"
          >
            {/* Rank */}
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold">
              {index === 0 ? (
                <FaCrown className="text-yellow-400 text-2xl" />
              ) : index === 1 ? (
                <FaMedal className="text-gray-300 text-2xl" />
              ) : index === 2 ? (
                <FaMedal className="text-amber-600 text-2xl" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg">
              {p.name[0]}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="font-semibold text-lg">{p.name}</div>
              <div className="text-xs text-gray-400">
                Level {p.level} • Streak {p.streak} days
              </div>

              {/* XP Bar */}
              <div className="w-full bg-white/10 rounded-full h-3 mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(p.xp / maxXP) * 100}%`,
                  }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="h-3 rounded-full bg-gradient-to-r from-green-400 to-teal-400"
                ></motion.div>
              </div>
            </div>

            {/* XP Number */}
            <div className="text-right">
              <div className="font-bold text-lg">{p.xp} XP</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
