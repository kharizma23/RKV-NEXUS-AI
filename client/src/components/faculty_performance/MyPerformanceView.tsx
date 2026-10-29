'use client';

import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Users, FileCheck, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { PerformanceRecommendations } from './PerformanceRecommendations';

export function MyPerformanceView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/faculty/performance/my');
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load faculty performance metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-violet-500/20 shadow-xl">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30 flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3 text-violet-400" /> OBE Analytics
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Faculty Teaching Effectiveness & CO Attainment</h1>
          <p className="text-sm text-slate-300">
            Algorithmic appraisal aggregating class-wide CO attainment, student qualitative feedback, and exam rubric rigor.
          </p>
        </div>
        <button
          onClick={fetchPerformance}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Recalculate
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-violet-400" /> Avg CO Attainment
              </span>
              <p className="text-2xl font-bold text-white">{data.avg_co_attainment}%</p>
            </div>
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Student Feedback
              </span>
              <p className="text-2xl font-bold text-emerald-400">{data.student_feedback_score} / 5.0</p>
            </div>
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-cyan-400" /> Exam Quality Index
              </span>
              <p className="text-2xl font-bold text-cyan-400">{data.exam_quality_score}%</p>
            </div>
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Performance Index
              </span>
              <p className="text-2xl font-bold text-amber-400">{data.performance_index} / 100</p>
            </div>
          </div>

          <PerformanceRecommendations recommendations={data.recommendations || []} />
        </div>
      )}
    </div>
  );
}
