'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Award, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentRewardsCardProps {
  points: number;
  totalPoints: number;
  streakDays: number;
  badgeCount: number;
}

export function StudentRewardsCard({
  points = 0,
  totalPoints = 0,
  streakDays = 1,
  badgeCount = 0,
}: StudentRewardsCardProps) {
  const [displayPoints, setDisplayPoints] = useState(0);

  // Animated counter for points
  useEffect(() => {
    const target = points || 450;
    const duration = 1200;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = Math.min(target, Math.round((step / steps) * target));
      setDisplayPoints(current);
      if (step >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [points]);

  const currentLevel = Math.max(1, Math.floor((totalPoints || points || 450) / 250) + 1);
  const nextLevelPoints = currentLevel * 250;
  const currentLevelProgress = Math.min(
    100,
    Math.round((((totalPoints || points || 450) % 250) / 250) * 100)
  );

  // Circular progress calculations for SVG
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentLevelProgress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-amber-600/10 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-background backdrop-blur-xl p-5 shadow-xl shadow-amber-500/5 hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 group"
    >
      {/* Decorative ambient lights */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none group-hover:bg-amber-400/30 transition-colors" />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-28 h-28 rounded-full bg-orange-500/15 blur-2xl pointer-events-none" />

      {/* Header with Circular Level Ring */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-amber-700 dark:text-amber-300 uppercase block">
              Gamified Mastery
            </span>
            <span className="text-xs font-bold text-foreground">
              Academic Rewards
            </span>
          </div>
        </div>

        {/* Circular Progress for Level */}
        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 54 54">
              <circle
                cx="27"
                cy="27"
                r={radius}
                className="stroke-amber-500/20"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="27"
                cy="27"
                r={radius}
                className="stroke-amber-500 transition-all duration-1000 ease-out"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase leading-none">LVL</span>
              <span className="text-xs font-black text-foreground leading-none">{currentLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Three stat pillars */}
      <div className="grid grid-cols-3 gap-2.5 pt-3.5 relative z-10">
        {/* Points with animated count */}
        <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-amber-500/20 backdrop-blur-md text-center transition-transform hover:scale-[1.03]">
          <div className="text-xl md:text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            {displayPoints}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight block mt-0.5">
            Points
          </span>
        </div>

        {/* Streak */}
        <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-orange-500/20 backdrop-blur-md text-center transition-transform hover:scale-[1.03]">
          <div className="text-xl md:text-2xl font-black text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
            {streakDays || 5}d
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight block mt-0.5">
            Day Streak
          </span>
        </div>

        {/* Badges */}
        <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-indigo-500/20 backdrop-blur-md text-center transition-transform hover:scale-[1.03]">
          <div className="text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
            <Award className="w-4 h-4 text-indigo-500" />
            {badgeCount || 6}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight block mt-0.5">
            Badges
          </span>
        </div>
      </div>

      {/* Level XP sub-bar */}
      <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-[10px] font-semibold text-muted-foreground relative z-10">
        <span>XP to Level {currentLevel + 1}</span>
        <span className="text-amber-600 dark:text-amber-400 font-bold">{currentLevelProgress}%</span>
      </div>
    </motion.div>
  );
}
