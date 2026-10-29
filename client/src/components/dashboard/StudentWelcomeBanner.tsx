'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Bot, ArrowRight, Bell, GraduationCap, Flame, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentWelcomeBannerProps {
  fullName?: string;
  studentId?: string;
  unreadCount?: number;
}

export function StudentWelcomeBanner({
  fullName = 'Dharshini Ramesh',
  studentId = '23CSE001',
  unreadCount = 0,
}: StudentWelcomeBannerProps) {
  // Compute greeting dynamically based on user's current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = fullName.split(' ')[0] || 'Student';

  // Dynamic AI motivational prompts
  const motivationalQuotes = [
    'Consistency is the key to mastery. You are on track to achieve Grade A+ this semester.',
    'Your conceptual understanding in algorithms showed 15% improvement this week!',
    'Small daily disciplines repeated every day lead to extraordinary institutional outcomes.',
  ];
  // Select quote based on day of month for deterministic daily rotation
  const dailyQuote = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 md:p-8 text-white shadow-2xl shadow-indigo-950/40"
    >
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Avatar with Glowing Aura + Name + AI Motivational Quote */}
        <div className="flex items-start md:items-center gap-4">
          {/* Avatar with glowing aura ring */}
          <div className="relative group shrink-0">
            {/* Pulsing aura */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-75 blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
            
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 border border-white/20 flex items-center justify-center text-white shadow-xl">
              <GraduationCap className="w-8 h-8 text-white" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900" />
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200">{firstName}!</span>
              </h2>

              {unreadCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse">
                  <Bell className="w-3 h-3" /> {unreadCount} Alerts
                </span>
              )}
            </div>

            {/* Motivational Quote */}
            <div className="flex items-center gap-2 text-indigo-200/80 text-xs md:text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>&ldquo;{dailyQuote}&rdquo;</span>
            </div>

            {/* Roll number & institution credentials */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-indigo-300/70 font-semibold">
              <span className="px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/10 text-indigo-200 font-mono text-[11px]">
                ID: {studentId}
              </span>
              <span>&bull;</span>
              <span className="text-[11px] tracking-wide text-indigo-200/60">
                RKV NEXUS AI Academic Platform 2026
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Pills */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/student/ai-tutor"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
          >
            <Bot className="w-4 h-4 text-indigo-300" />
            <span>Ask AI Tutor</span>
          </Link>

          <Link
            href="/student/study-plan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border border-indigo-400/30 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30"
          >
            <Compass className="w-4 h-4" />
            <span>Continue Study Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
