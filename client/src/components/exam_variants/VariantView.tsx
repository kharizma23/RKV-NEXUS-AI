'use client';

import React, { useState, useEffect } from 'react';
import { Layers, FileText, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function VariantView({ examId = 'default-exam' }: { examId?: string }) {
  const [variant, setVariant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyVariant = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<any>(`/student/exam/${examId}/my-variant`);
      setVariant(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch assigned exam variant.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVariant();
  }, [examId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 backdrop-blur-md rounded-2xl border border-purple-500/20 shadow-xl">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3 text-purple-400" /> Randomized Assignment
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Assigned Exam Variant</h1>
          <p className="text-sm text-slate-300">
            Securely shuffled question ordering and distractor permutations assigned uniquely to your student ID.
          </p>
        </div>
        <button
          onClick={fetchMyVariant}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : variant && (
        <div className="space-y-6">
          <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl flex items-center justify-between">
            <span className="text-sm font-bold text-purple-300">
              Exam Variant Code: {variant.variant_number}
            </span>
            <span className="text-xs text-slate-400">
              Total Questions: {variant.questions?.length || 0}
            </span>
          </div>

          <div className="space-y-4">
            {variant.questions?.map((q: any, idx: number) => (
              <div key={idx} className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Question {idx + 1}
                </span>
                <p className="text-sm font-semibold text-white">{q.q}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.opts?.map((opt: string, oIdx: number) => (
                    <div key={oIdx} className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs text-slate-300">
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
