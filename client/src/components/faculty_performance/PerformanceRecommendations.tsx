'use client';

import React from 'react';
import { Sparkles, CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';

interface Recommendation {
  id: string;
  recommendation_text: string;
  generated_at: string;
}

export function PerformanceRecommendations({ recommendations }: { recommendations: Recommendation[] }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-center text-sm text-slate-400">
        No active pedagogical recommendations. Teaching efficacy benchmark satisfied.
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <h3 className="text-base font-semibold text-white">AI Pedagogical Improvement Directives</h3>
      </div>
      <div className="space-y-3">
        {recommendations.map(rec => (
          <div
            key={rec.id}
            className="p-4 bg-slate-950/60 border border-amber-500/20 hover:border-amber-500/40 rounded-xl transition flex items-start gap-3"
          >
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-slate-200 leading-relaxed">{rec.recommendation_text}</p>
              <span className="text-[11px] text-slate-400">
                Generated {new Date(rec.generated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
