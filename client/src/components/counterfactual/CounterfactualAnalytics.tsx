'use client';

import React from 'react';
import { Sparkles, TrendingUp, BarChart2, BookOpen } from 'lucide-react';

export function CounterfactualAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Institutional Counterfactual Feedback Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Aggregate student learning gap analysis, untapped mark headroom, and common conceptual stumbling blocks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Average Mark Headroom</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">+3.8 Marks</div>
          <span className="text-[11px] text-muted-foreground mt-1 inline-block">Recoverable with precise proofs</span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Explanations Synthesized</span>
          <div className="mt-2 text-2xl font-black text-primary">1,842</div>
          <span className="text-[11px] text-muted-foreground mt-1 inline-block">Generated across 24 modules</span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Common Pitfall Frequency</span>
          <div className="mt-2 text-2xl font-black text-amber-500">62.4%</div>
          <span className="text-[11px] text-amber-500 font-semibold mt-1 inline-block">Missing edge-case invariants</span>
        </div>
      </div>

      <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" /> Top Recoverable Mark Categories
        </h3>
        <div className="space-y-3 text-xs">
          {[
            { category: 'Formal Inductive Base Cases', headroom: '+2.5 marks', pct: 85, color: 'bg-emerald-500' },
            { category: 'Time/Space Complexity Proofs', headroom: '+2.0 marks', pct: 72, color: 'bg-primary' },
            { category: 'Edge-Case Boundary Invariants', headroom: '+1.8 marks', pct: 64, color: 'bg-amber-500' },
            { category: 'System Architecture Fault Assumptions', headroom: '+1.5 marks', pct: 45, color: 'bg-indigo-500' }
          ].map((c, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-foreground">{c.category}</span>
                <span className="text-emerald-600 font-bold">{c.headroom}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
