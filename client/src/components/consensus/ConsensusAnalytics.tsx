'use client';

import React from 'react';
import { Layers, ShieldCheck, BarChart2, TrendingUp } from 'lucide-react';

export function ConsensusAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Multi-Evaluator Inter-Model Concordance Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Benchmarking statistical agreement between distinct AI models and faculty arbitration outcomes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Tri-Model Agreement Rate</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">96.8%</div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">Within ±1.5 pt tolerance</span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Disagreements Arbitrated</span>
          <div className="mt-2 text-2xl font-black text-primary">42</div>
          <span className="text-[11px] text-muted-foreground mt-1 inline-block">Resolved by faculty reviewers</span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Faculty Concordance Delta</span>
          <div className="mt-2 text-2xl font-black text-indigo-500">±0.4 Pts</div>
          <span className="text-[11px] text-muted-foreground mt-1 inline-block">Deviation from tri-model median</span>
        </div>
      </div>
    </div>
  );
}
