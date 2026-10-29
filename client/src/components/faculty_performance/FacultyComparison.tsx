'use client';

import React, { useState, useEffect } from 'react';
import { Award, Users, TrendingUp, RefreshCw, BarChart2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function FacultyComparison() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/admin/faculty/performance/compare');
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to compare faculty performance benchmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-950/40 via-violet-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-purple-500/20 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Faculty Benchmarking & Comparison</h1>
          <p className="text-sm text-slate-300">
            Compare Course Outcome attainment distributions and student feedback scores across academic departments.
          </p>
        </div>
        <button
          onClick={fetchComparison}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Rankings
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 bg-slate-800/40 rounded-2xl animate-pulse" />
      ) : data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 font-medium">Faculty Evaluated</span>
              <p className="text-2xl font-bold text-white">{data.faculty_count}</p>
            </div>
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 font-medium">Target CO Benchmark</span>
              <p className="text-2xl font-bold text-purple-400">{data.benchmark_co_target}%</p>
            </div>
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 font-medium">Accreditation Preparedness</span>
              <p className="text-2xl font-bold text-emerald-400">NBA Tier-1 Aligned</p>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Faculty Performance Leaderboard</span>
              <span>Outcome Attainment</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {data.rankings?.map((f: any, idx: number) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{f.faculty_name}</h4>
                      <p className="text-xs text-slate-400">Index: {f.performance_index} / 100 • Feedback: {f.student_feedback_score}/5.0</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    {f.avg_co_attainment}% CO Attainment
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
