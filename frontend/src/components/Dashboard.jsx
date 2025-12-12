import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaTrophy, FaMedal, FaBolt, FaLeaf } from "react-icons/fa";

/**
 * Dashboard.jsx
 * Gamified XP-style dashboard (single-file).
 *
 * Requirements:
 *  - Tailwind CSS configured
 *  - framer-motion installed
 *  - react-icons installed
 *
 * Drop into src/components/Dashboard.jsx and import into your CarbonDashboard.
 */

/* ---------- helper: smooth number animator using requestAnimationFrame ---------- */
function useAnimatedNumber(target, duration = 700) {
  const [value, setValue] = useState(target);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(target);

  useEffect(() => {
    // cancel existing
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    startRef.current = start;
    fromRef.current = value;
    const from = value;
    const to = target;
    const diff = to - from;
    if (Math.abs(diff) < 0.5) {
      setValue(target);
      return;
    }

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + diff * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return Math.round(value);
}

/* ---------- Progress ring component ---------- */
function ProgressRing({ size = 140, stroke = 10, progress = 0 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="gRing" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#0f1724"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
      />

      {/* progress */}
      <g filter="url(#soft)">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gRing)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </g>

      {/* center text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.145}
        fill="#E6EEF3"
        style={{ fontWeight: 700 }}
      >
        {Math.round(progress * 100)}%
      </text>

      <text
        x="50%"
        y={size * 0.72}
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.06}
        fill="#94A3B8"
      >
        to next level
      </text>
    </svg>
  );
}

/* ---------- single stat card ---------- */
function StatCard({ title, value, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-white/5 border border-white/8 rounded-2xl p-4 flex items-center gap-4"
    >
      <div className="p-3 rounded-lg bg-gradient-to-tr from-white/5 to-white/3 text-2xl">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-300">{title}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </motion.div>
  );
}

/* ---------- badge chip ---------- */
function Badge({ icon, title, desc }) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-3 flex items-center gap-3">
      <div className="p-2 rounded-md bg-gradient-to-br from-yellow-400 to-orange-400 text-black">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-gray-300">{desc}</div>
      </div>
    </div>
  );
}

/* ---------- Main Dashboard ---------- */
export default function Dashboard() {
  // mock gamified stats
  const [xp, setXp] = useState(740); // current xp
  const [totalXp, setTotalXp] = useState(1280); // total xp (for level calculation)
  const [level, setLevel] = useState(3);
  const nextLevelXp = 1000; // xp needed for next level (example)

  // stats
  const [carbonSavedKg, setCarbonSavedKg] = useState(4.6);
  const [streak, setStreak] = useState(7);
  const [points, setPoints] = useState(420);

  // recent activities and achievements (hard-coded)
  const recent = [
    { id: 1, text: "Biked to work — 0.4 kg CO₂ saved", time: "2h" },
    { id: 2, text: "Recycled plastic — 1.2 kg", time: "1d" },
    { id: 3, text: "Hosted a carpool — 0.8 kg saved", time: "3d" },
  ];

  const achievements = [
    { id: "a1", title: "First 100 XP", desc: "Completed first 100 XP", icon: <FaStar /> },
    { id: "a2", title: "Streak 7", desc: "7 day activity streak", icon: <FaBolt /> },
    { id: "a3", title: "Green Hero", desc: "Saved 5 kg CO₂", icon: <FaLeaf /> },
  ];

  // animated numbers (smooth)
  const animatedPoints = useAnimatedNumber(points, 700);
  const animatedXp = useAnimatedNumber(xp, 900);
  const animatedCarbon = useAnimatedNumber(Math.round(carbonSavedKg * 10) / 10, 700);
  const animatedStreak = useAnimatedNumber(streak, 700);

  // derived progress to next level
  const progressToNext = Math.max(0, Math.min(1, xp / nextLevelXp));

  /* Simulate some changes to show animation (optional) */
  useEffect(() => {
    const id = setTimeout(() => {
      // small demo bump (comment out if not desired)
      setPoints((p) => p + 10);
      setXp((x) => Math.min(nextLevelXp - 1, x + 40));
    }, 2200);

    return () => clearTimeout(id);
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT: XP widget */}
        <section className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-gradient-to-br from-[#071026] to-[#0b1530] p-6 rounded-3xl border border-white/6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">Level</div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-extrabold">#{level}</div>
                  <div className="text-xs text-gray-400">Eco Explorer</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-300">Total Points</div>
                <div className="text-green-400 font-bold text-lg">{animatedPoints} pts</div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-6">
              <div className="w-40 h-40 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <ProgressRing size={160} stroke={10} progress={progressToNext} />
                </motion.div>
              </div>

              <div className="flex-1">
                <div className="mb-2 text-sm text-gray-300">XP</div>
                <div className="text-2xl font-bold">{animatedXp} / {nextLevelXp}</div>

                <div className="mt-4 bg-white/3 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-green-400 to-teal-400 transition-all"
                    style={{ width: `${Math.round(progressToNext * 100)}%` }}
                  />
                </div>

                <div className="mt-4 text-xs text-gray-400">Complete actions to level up — more rewards unlock at each level.</div>
              </div>
            </div>

            {/* action button */}
            <div className="mt-6">
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-black font-semibold py-2 rounded-lg shadow"
              >
                Claim Daily Bonus (10 XP)
              </motion.button>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-4">
            <div className="text-sm text-gray-300 mb-3 font-medium">Achievements</div>
            <div className="space-y-3">
              {achievements.map((a) => (
                <Badge key={a.id} icon={a.icon} title={a.title} desc={a.desc} />
              ))}
            </div>
          </motion.div>
        </section>

        {/* MIDDLE & RIGHT: Stats + Recent + Activity */}
        <section className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TOP LEFT: Stats cards */}
          <div className="col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard title="Carbon Saved" value={`${animatedCarbon} kg`} icon={<FaLeaf />} />
            <StatCard title="Current Streak" value={`${animatedStreak} days`} icon={<FaBolt />} />
            <StatCard title="Achievements" value={achievements.length} icon={<FaMedal />} />
            <StatCard title="Badges" value={3} icon={<FaTrophy />} />
          </div>

          {/* RIGHT: Recent activity */}
          <div className="col-span-1 bg-white/5 border border-white/8 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-gray-300 font-medium">Recent Activity</div>
              </div>
              <div className="text-xs text-gray-400">Live</div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {recent.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.35 }}
                    className="p-3 rounded-lg bg-white/3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm">{r.text}</div>
                      <div className="text-xs text-gray-400">{r.time}</div>
                    </div>
                    <div className="text-green-400 font-semibold">+5 pts</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full border border-white/8 rounded-lg px-3 py-2 text-sm"
              >
                View Activity Log
              </motion.button>
            </div>
          </div>

          {/* FULL WIDTH: Rewards / Missions */}
          <div className="col-span-2 bg-white/5 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-300 font-medium">Active Missions</div>
                <div className="text-lg font-bold">Complete missions to earn XP</div>
              </div>
              <div className="text-xs text-gray-400">3 active</div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <motion.div whileHover={{ y: -6 }} className="p-4 rounded-xl bg-white/6 border border-white/8">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-md bg-green-400/20 text-green-300"><FaBolt /></div>
                  <div>
                    <div className="font-semibold">Bike to Work</div>
                    <div className="text-xs text-gray-400">Earn 8 XP · 0.5 kg CO₂ saved</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-white/3 rounded-full overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-green-400 to-teal-400" style={{ width: "60%" }} />
                  </div>
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -6 }} className="p-4 rounded-xl bg-white/6 border border-white/8">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-md bg-yellow-400/20 text-yellow-300"><FaStar /></div>
                  <div>
                    <div className="font-semibold">Recycle 2kg</div>
                    <div className="text-xs text-gray-400">Earn 12 XP · 2.0 kg CO₂ saved</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-white/3 rounded-full overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-yellow-300 to-orange-400" style={{ width: "25%" }} />
                  </div>
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -6 }} className="p-4 rounded-xl bg-white/6 border border-white/8">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-md bg-blue-400/20 text-blue-300"><FaTrophy /></div>
                  <div>
                    <div className="font-semibold">Plant a Tree</div>
                    <div className="text-xs text-gray-400">Earn 30 XP · 5.0 kg CO₂ saved</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-white/3 rounded-full overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500" style={{ width: "0%" }} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
