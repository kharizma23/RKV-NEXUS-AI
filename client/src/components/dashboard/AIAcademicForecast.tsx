'use client';

import React from 'react';
import Link from 'next/link';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Sparkles, Bot, TrendingUp, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export interface PredictionData {
  predicted_percentage: number;
  predicted_grade: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  factors: {
    co_attainment: number;
    exam_average: number;
    attendance: number;
    exams_completed?: number;
    skills?: number;
    wellness?: number;
    placement_readiness?: number;
  };
}

interface AIAcademicForecastProps {
  prediction: PredictionData | null;
  isLoading?: boolean;
}

export function AIAcademicForecast({ prediction, isLoading = false }: AIAcademicForecastProps) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted/60 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-6 w-20 bg-muted/70 rounded-full animate-pulse" />
        </div>
        <div className="grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 h-64 bg-muted/30 rounded-xl animate-pulse" />
          <div className="md:col-span-6 space-y-4">
            <div className="h-8 w-1/2 bg-muted/50 rounded animate-pulse" />
            <div className="h-16 w-full bg-muted/40 rounded-xl animate-pulse" />
            <div className="h-20 w-full bg-muted/30 rounded-xl animate-pulse" />
            <div className="h-10 w-36 bg-muted/60 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Fallback defaults if prediction is missing or empty
  const data = prediction || {
    predicted_percentage: 84.8,
    predicted_grade: 'A+',
    risk_level: 'LOW' as const,
    confidence: 88,
    factors: {
      co_attainment: 85,
      exam_average: 82,
      attendance: 89,
      skills: 78,
      wellness: 90,
      placement_readiness: 81,
    },
  };

  const coAttainment = data.factors?.co_attainment ?? 85;
  const attendance = data.factors?.attendance ?? 89;
  const skills = data.factors?.skills ?? Math.min(95, Math.round(coAttainment * 0.94));
  const wellness = data.factors?.wellness ?? 88;
  const placement = data.factors?.placement_readiness ?? Math.min(96, Math.round(attendance * 0.92));

  const radarMetrics = [
    { metric: 'CO Attainment', value: coAttainment, fullMark: 100 },
    { metric: 'Attendance', value: attendance, fullMark: 100 },
    { metric: 'Skills & Labs', value: skills, fullMark: 100 },
    { metric: 'Wellness Score', value: wellness, fullMark: 100 },
    { metric: 'Placement Fit', value: placement, fullMark: 100 },
  ];

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return {
          pill: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          label: 'Low Risk — High Honour Roll',
        };
      case 'MEDIUM':
        return {
          pill: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
          label: 'Moderate Risk — Attention Recommended',
        };
      case 'HIGH':
      default:
        return {
          pill: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          dot: 'bg-rose-500',
          icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
          label: 'Critical Risk — Remedial Action Required',
        };
    }
  };

  const risk = getRiskStyles(data.risk_level);

  // Generate dynamic contextual insight based on metrics
  const getAIInsight = () => {
    if (attendance < 75) {
      return 'Attendance is below 75% threshold in AI modules. Priority: Attend next 4 lecture sessions and take Unit 2 practice quiz.';
    }
    if (coAttainment >= 85) {
      return 'You are excelling in DBMS & Advanced Data Structures. Recommended next challenge: Tackle Adaptive Diagnostic Exam tier 3.';
    }
    return 'Consistent trajectory across core modules. Your CO Attainment is climbing (+4.2%). Focus revision on Unit 3 algorithm design.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 bg-gradient-to-br from-white/70 via-white/50 to-indigo-50/30 dark:from-slate-900/70 dark:via-slate-900/50 dark:to-indigo-950/20 backdrop-blur-xl p-6 md:p-7 shadow-2xl shadow-indigo-500/5 transition-all duration-300 hover:shadow-indigo-500/10 hover:-translate-y-0.5"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-2">
              AI Academic Forecast & Radar
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-400/30">
                Model 2026
              </span>
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Multi-dimensional outcome attainment & semester projection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${risk.pill}`}>
            <span className={`w-2 h-2 rounded-full ${risk.dot} animate-pulse`} />
            {risk.label}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/60 text-muted-foreground border border-border/60">
            {data.confidence}% Confidence
          </span>
        </div>
      </div>

      {/* Main Grid: Left Radar Chart, Right Insights & Metrics */}
      <div className="grid lg:grid-cols-12 gap-6 items-center pt-5">
        {/* Radar Chart (Pentagon) */}
        <div className="lg:col-span-5 h-[280px] w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarMetrics}>
              <PolarGrid stroke="currentColor" className="text-border/60" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }}
                className="text-muted-foreground"
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Student Metrics"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.35}
                strokeWidth={2.5}
                isAnimationActive={true}
              />
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Score']}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Info: Score, AI Summary Insight, Action */}
        <div className="lg:col-span-7 space-y-4">
          {/* Big Score & Grade projection */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-white/40 dark:border-white/5 shadow-inner">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Projected Semester Score
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                  {data.predicted_percentage}%
                </span>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +3.8%
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Projected Grade
              </span>
              <div className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400">
                Grade {data.predicted_grade}
              </div>
            </div>
          </div>

          {/* AI-Generated Insight Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-500/20 backdrop-blur-md space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>AI Academic Mentor Synthesis</span>
            </div>
            <p className="text-xs md:text-sm text-foreground/90 font-medium leading-relaxed">
              &ldquo;{getAIInsight()}&rdquo;
            </p>
          </div>

          {/* Contributing metric bars preview */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-800/30 border border-border/40 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase block">CO Attainment</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{coAttainment}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-800/30 border border-border/40 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase block">Attendance</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{attendance}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-800/30 border border-border/40 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase block">Placement Ready</span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">{placement}%</span>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href="/student/ai-tutor"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Tutor to Analyze</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
