'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, RefreshCw, BarChart2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function ClassCareerTrends() {
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any>('/faculty/career/class-trends');
      setTrends(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-blue-500/20 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Class Career Alignment Trends</h1>
          <p className="text-sm text-slate-300">
            Cohort-wide trajectory distributions mapping aggregate course competencies to industry workforce specializations.
          </p>
        </div>
        <button
          onClick={fetchTrends}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {trends && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Industry Market Alignment Index</span>
              <p className="text-2xl font-bold text-emerald-400">{trends.market_alignment_index}</p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Projected Workforce Roles</h3>
            <div className="space-y-3">
              {trends.top_predicted_roles?.map((r: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">{r.role}</span>
                    <span className="font-bold text-cyan-400">{r.pct}% of Cohort</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
