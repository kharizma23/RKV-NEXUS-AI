'use client';

import React from 'react';
import { Briefcase, Award, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

interface Recommendation {
  type: string;
  title: string;
  company?: string;
  provider?: string;
  match?: string;
  est_hours?: number;
}

export function CareerRecommendations({ recommendations }: { recommendations: Recommendation[] }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        AI Projected Jobs &amp; Recommended Certifications
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="p-5 bg-card border border-border/70 hover:border-indigo-500/40 rounded-2xl space-y-3 transition-all shadow-sm hover:shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50">
                {rec.type}
              </span>
              {rec.match && (
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {rec.match} Match
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-foreground leading-snug">{rec.title}</h4>

            <div className="text-xs text-muted-foreground pt-1 border-t border-border/40">
              {rec.company && <span>Organization: <strong className="text-foreground">{rec.company}</strong></span>}
              {rec.provider && <span>Provider: <strong className="text-foreground">{rec.provider}</strong></span>}
              {rec.est_hours && <span className="block mt-0.5">Estimated Commitment: {rec.est_hours} hrs</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
