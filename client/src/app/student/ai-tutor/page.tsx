'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot, BookOpen, Target, Calendar, TrendingUp, Sparkles,
  ShieldAlert, Award, Clock, ArrowRight, GraduationCap, CheckCircle2, Flame
} from 'lucide-react';
import { ChatWindow } from '@/components/chatbot/ChatWindow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { motion } from 'framer-motion';

export default function StudentAITutorPage() {
  const [context, setContext] = useState<any>({
    name: 'Dharshini R',
    roll_number: '23CSE042',
    institution: 'RKV Institute of Technology',
    programme: 'B.E. Computer Science and Engineering',
    semester: 4,
    subjects: [
      'Database Management Systems (CS8492)',
      'Cloud Computing & Virtualization (CS8493)',
      'Artificial Intelligence & Neural Networks (CS8494)',
      'Design and Analysis of Algorithms (CS8491)'
    ],
    weak_topics: [
      'Relational Database Normalization (3NF / BCNF)',
      'Neural Network Backpropagation & Gradient Loss Invariants'
    ],
    co_attainment: {
      CO1: '88.0%',
      CO2: '76.5%',
      CO3: '64.0%',
      CO4: '82.0%'
    },
    upcoming_exams: [
      'DBMS End-Semester Practical & Theory (12 Oct)',
      'Cloud Computing Unit 3 Assessment (18 Oct)',
      'Neural Networks Model Exam (24 Oct)'
    ],
    growth_metrics: 'Dynamic Programming: 45% → 72% (+27% mastery)'
  });

  useEffect(() => {
    fetchContext();
  }, []);

  const fetchContext = async () => {
    try {
      const json: any = await apiClient('/student/ai-tutor/suggestions');
      if (json && json.data) {
        setContext((prev: any) => ({
          ...prev,
          weak_topics: json.data.weak_topics || prev.weak_topics,
          upcoming_exams: json.data.upcoming_exams || prev.upcoming_exams,
          growth_metrics: json.data.growth_metrics || prev.growth_metrics
        }));
      }
    } catch {
      // Fallback already available
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Top Banner Header: Rich Indigo / Violet Mesh Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 md:p-7 rounded-3xl shadow-xl shadow-indigo-950/20 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
              Personal Academic Mentor
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Syllabus & CO Synced
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            AI Academic Tutor Hub
          </h1>

          <p className="text-xs md:text-sm text-indigo-100/80 max-w-2xl font-medium leading-relaxed">
            Unlike generic chatbots, your AI tutor is synchronized with your syllabus, historical exam
            scores, and Course Outcome attainment. Ask in English, தமிழ், or हिन्दी!
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-right shadow-lg">
            <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">Mastery Momentum</p>
            <p className="text-base font-black text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
              <TrendingUp className="w-4 h-4" />
              +27% Growth
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Sidebar Academic Context + Chat Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Academic Diagnostic Context in Luminous Glassmorphic Cards */}
        <div className="lg:col-span-4 space-y-5">
          {/* Student Profile Card */}
          <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-xl shadow-indigo-500/5 transition-all hover:shadow-indigo-500/10 hover:-translate-y-0.5">
            <div className="pb-3 border-b border-border/50 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                Student Academic Profile
              </h3>
            </div>
            <div className="pt-3 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-medium">Student Name</span>
                <span className="font-bold text-foreground">{context.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-medium">Roll Number</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{context.roll_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-medium">Programme</span>
                <span className="text-foreground font-medium text-right">{context.programme}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground font-medium">Current Semester</span>
                <span className="font-bold text-foreground">Semester {context.semester}</span>
              </div>
            </div>
          </div>

          {/* Weak Topics & CO Gaps */}
          <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-white/70 to-pink-500/5 dark:from-rose-950/20 dark:via-slate-900/70 dark:to-pink-950/10 backdrop-blur-xl p-5 shadow-xl shadow-rose-500/5 transition-all hover:shadow-rose-500/10 hover:-translate-y-0.5">
            <div className="pb-3 border-b border-rose-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  Identified Syllabus Gaps
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                2 Focus Units
              </span>
            </div>
            <div className="pt-3.5 space-y-3">
              {context.weak_topics.map((t: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-rose-500/20 text-xs space-y-1.5 shadow-sm transition-transform hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-rose-600 dark:text-rose-400">Priority Gap #{idx + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold">
                      Action Needed
                    </span>
                  </div>
                  <p className="text-foreground/90 font-medium leading-relaxed">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Course Outcome Attainment */}
          <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-xl shadow-indigo-500/5 transition-all hover:shadow-indigo-500/10 hover:-translate-y-0.5">
            <div className="pb-3 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Course Outcome (CO) Status
                </h3>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">Target: 80%</span>
            </div>
            <div className="pt-3.5 space-y-3 text-xs">
              {Object.entries(context.co_attainment).map(([co, val]: [string, any]) => {
                const numeric = parseFloat(val);
                const isLow = numeric < 70;
                return (
                  <div key={co} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground">{co}</span>
                      <span className={isLow ? 'text-rose-500 font-black' : numeric > 80 ? 'text-emerald-500 font-black' : 'text-indigo-600 dark:text-indigo-400 font-black'}>
                        {val} {isLow && '⚠️'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200/70 dark:bg-slate-800/70 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isLow
                            ? 'bg-rose-500'
                            : numeric > 80
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                        }`}
                        style={{ width: `${Math.min(100, numeric)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-xl shadow-indigo-500/5 transition-all hover:shadow-indigo-500/10 hover:-translate-y-0.5">
            <div className="pb-3 border-b border-border/50 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                Upcoming Examinations
              </h3>
            </div>
            <div className="pt-3.5 space-y-2.5">
              {context.upcoming_exams.map((exam: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 text-xs text-foreground font-medium shadow-sm transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{exam}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Full-Height Interactive Chat Window */}
        <div className="lg:col-span-8 h-[800px]">
          <ChatWindow isFullPage={true} />
        </div>
      </div>
    </div>
  );
}
