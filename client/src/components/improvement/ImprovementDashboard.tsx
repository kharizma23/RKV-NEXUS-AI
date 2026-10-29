'use client';

import React from 'react';
import { TrendingUp, Award, BarChart2, ShieldCheck } from 'lucide-react';

export function ImprovementDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Institutional Learning Gains & Improvement Grading Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Campus-wide outcome-based education (OBE) value-add and longitudinal growth trajectories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Campus Mean Growth</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">+15.2%</div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">Surpassing target KPI</span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Growth Incentive Recipients</span>
          <div className="mt-2 text-2xl font-black text-primary">1,120</div>
          <span className="text-[11px] text-muted-foreground mt-1 inline-block">Students awarded bonus marks</span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Persistence Retention Rate</span>
          <div className="mt-2 text-2xl font-black text-indigo-500">98.1%</div>
          <span className="text-[11px] text-muted-foreground mt-1 inline-block">Driven by progressive feedback</span>
        </div>
      </div>
    </div>
  );
}
