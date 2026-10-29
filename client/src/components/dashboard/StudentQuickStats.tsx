'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Award, CheckCircle2, TrendingUp, Clock, Database, Brain, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentQuickStatsProps {
  enrolledCount: number;
  masteryLevel: number;
  countdownText: string;
}

export function StudentQuickStats({
  enrolledCount = 4,
  masteryLevel = 82,
  countdownText = 'No Upcoming Exams',
}: StudentQuickStatsProps) {
  const isNoExam = !countdownText || countdownText.toLowerCase().includes('no upcoming');

  // Circular progress for CO Mastery
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const masteryOffset = circumference - (masteryLevel / 100) * circumference;

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {/* 1. ENROLLED SUBJECTS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-5 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 group"
      >
        <div className="flex items-center justify-between pb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Enrolled Subjects
          </span>
          <Link
            href="/student/examinations"
            className="w-6 h-6 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-1 flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-black text-foreground tracking-tight">
              {enrolledCount || 4}
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold">Active Syllabus Cohorts</p>
          </div>

          {/* Top 2 subject avatars / chips */}
          <div className="flex -space-x-2">
            <div
              title="Database Management Systems"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center text-[10px] font-black border-2 border-background shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
            </div>
            <div
              title="Artificial Intelligence & ML"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-[10px] font-black border-2 border-background shadow-sm"
            >
              <Brain className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Mini progress bar: Syllabus Completed */}
        <div className="mt-3 pt-2.5 border-t border-border/40 space-y-1.5">
          <div className="flex justify-between text-[10px] font-semibold">
            <span className="text-muted-foreground">Syllabus Completed</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">64%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-700"
              style={{ width: '64%' }}
            />
          </div>
        </div>
      </motion.div>

      {/* 2. EXAM COUNTDOWN */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-5 shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 group"
      >
        <div className="flex items-center justify-between pb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Exam Schedule
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {isNoExam ? 'Status: Clear' : 'Upcoming'}
          </span>
        </div>

        {isNoExam ? (
          <div className="mt-1 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-black text-foreground">
                All Clear!
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">
                No active exams scheduled. Ideal time for spaced revision.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-1">
            <div className="text-base font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 animate-spin-slow" />
              {countdownText}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">Continuous Assessment II</p>
          </div>
        )}

        {/* Sub-status pill */}
        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
          <span>Next Window</span>
          <span className="text-foreground font-bold">{isNoExam ? 'Next Monday' : 'In 48h'}</span>
        </div>
      </motion.div>

      {/* 3. CO MASTERY WITH RADIAL PROGRESS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-5 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1 group"
      >
        <div className="flex items-center justify-between pb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-cyan-500" /> CO Mastery Attainment
          </span>
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> ↑ 5.2%
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <div>
            <div className="text-3xl font-black text-foreground tracking-tight">
              {masteryLevel}%
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold">Outcome Attainment</p>
          </div>

          {/* Mini Radial Ring */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r={radius}
                className="stroke-cyan-500/20"
                strokeWidth="4.5"
                fill="transparent"
              />
              <circle
                cx="30"
                cy="30"
                r={radius}
                className="stroke-cyan-500 transition-all duration-1000 ease-out"
                strokeWidth="4.5"
                strokeDasharray={circumference}
                strokeDashoffset={masteryOffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-black text-cyan-600 dark:text-cyan-400">
                {masteryLevel}%
              </span>
            </div>
          </div>
        </div>

        {/* Sub-status pill */}
        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
          <span>Bloom&apos;s Level</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-bold">Level 4 (Analyze)</span>
        </div>
      </motion.div>
    </div>
  );
}
