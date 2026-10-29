'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface SummaryViewProps {
  lectureId?: string;
}

export function SummaryView({ lectureId = 'default-lecture' }: SummaryViewProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<any>(`/student/lectures/${lectureId}/summary`);
      setSummary(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch lecture summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [lectureId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-indigo-500/20 shadow-xl">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3 text-indigo-400" /> AI Executive Brief
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lecture Synthesis & Key Takeaways</h1>
          <p className="text-sm text-slate-300">
            Automated transcript reduction distilling core theoretical arguments and architectural proofs.
          </p>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 bg-slate-800/40 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-800/40 rounded-2xl animate-pulse" />
        </div>
      ) : summary && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Comprehensive Synthesis
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {summary.summary_text}
            </p>
          </div>

          {/* Key Conceptual Points */}
          {summary.key_points && summary.key_points.length > 0 && (
            <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Core Learning Outcomes & Insights
              </h3>
              <div className="space-y-2.5">
                {summary.key_points.map((pt: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-200">{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
