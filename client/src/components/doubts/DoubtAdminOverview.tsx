'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, BarChart3, CheckCircle2, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function DoubtAdminOverview() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<any>('/admin/doubts/overview');
      setOverview(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch admin doubt analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-blue-500/20 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Doubt Telemetry</h1>
          <p className="text-sm text-slate-300">
            University-wide overview of conceptual bottlenecks and resolution velocities across all departments.
          </p>
        </div>
        <button
          onClick={fetchOverview}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Doubts Detected</span>
              <p className="text-2xl font-bold text-white">{overview.total_doubts_detected}</p>
            </div>
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 font-medium">Active Micro-Lessons</span>
              <p className="text-2xl font-bold text-indigo-400">{overview.active_micro_lessons_served}</p>
            </div>
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 font-medium">Resolution Rate</span>
              <p className="text-2xl font-bold text-emerald-400">{overview.resolution_rate}%</p>
            </div>
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 font-medium">Mean Time To Resolution</span>
              <p className="text-2xl font-bold text-purple-400">{overview.mean_time_to_resolution_hrs}h</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
