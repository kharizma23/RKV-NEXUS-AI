'use client';

import React from 'react';
import { TrendingUp, BarChart2, Award } from 'lucide-react';

export function ImprovementAnalytics() {
  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Cohort Growth Velocity & Value-Add Metrics</h3>
          <p className="text-xs text-muted-foreground">
            Quantifying net learning gains between pre-assessment baselines and post-course finals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-muted/20 border border-border/50 rounded-xl space-y-1">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Cohort Growth</span>
          <div className="text-2xl font-black text-emerald-600">+14.8%</div>
        </div>

        <div className="p-3 bg-muted/20 border border-border/50 rounded-xl space-y-1">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Bonus Marks Distributed</span>
          <div className="text-2xl font-black text-primary">312 Pts</div>
        </div>

        <div className="p-3 bg-muted/20 border border-border/50 rounded-xl space-y-1">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Struggling Turnaround Rate</span>
          <div className="text-2xl font-black text-indigo-500">76.4%</div>
        </div>
      </div>
    </div>
  );
}
