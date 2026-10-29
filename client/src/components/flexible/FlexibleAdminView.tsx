'use client';

import React from 'react';
import { Clock, Users, Activity, BarChart2, CheckCircle2 } from 'lucide-react';

export function FlexibleAdminView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Flexible Window Longitudinal Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Observe student attempt distribution curves across 48-hour exam windows and auto-difficulty equalization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Average Attempt Duration</span>
          <div className="mt-2 text-2xl font-black text-foreground">72.4 Min</div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">Within 90-min cap</span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Peak Start Window</span>
          <div className="mt-2 text-2xl font-black text-primary">Hours 24-30</div>
          <span className="text-[11px] text-muted-foreground mt-1 inline-block">Mid-window consolidation</span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Collusion Risk Factor</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">0.02%</div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">Calibrated dynamically</span>
        </div>
      </div>

      <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" /> 48-Hour Candidate Start Distribution Curve
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
          {[
            { slot: '0-6h', pct: 8 },
            { slot: '6-12h', pct: 14 },
            { slot: '12-18h', pct: 19 },
            { slot: '18-24h', pct: 22 },
            { slot: '24-30h', pct: 16 },
            { slot: '30-36h', pct: 11 },
            { slot: '36-42h', pct: 7 },
            { slot: '42-48h', pct: 3 }
          ].map((s, i) => (
            <div key={i} className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-2">
              <span className="text-[11px] text-muted-foreground font-semibold">{s.slot}</span>
              <div className="h-16 flex items-end justify-center">
                <div
                  className="w-full bg-primary/80 rounded-t-md transition-all"
                  style={{ height: `${s.pct * 3.5}px` }}
                ></div>
              </div>
              <span className="font-bold text-foreground text-xs">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
