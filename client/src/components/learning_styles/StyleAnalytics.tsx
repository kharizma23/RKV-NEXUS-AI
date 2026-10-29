'use client';

import React from 'react';
import { Eye, Headphones, Activity, BarChart2 } from 'lucide-react';

export function StyleAnalytics() {
  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Eye className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Cohort Learning Style Modality Distribution</h3>
          <p className="text-xs text-muted-foreground">
            Distribution of visual, auditory, and kinesthetic learners across active course cohorts.
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {[
          { label: 'Visual Learners (Diagrams, Schematics)', pct: 54, color: 'bg-cyan-500' },
          { label: 'Auditory Learners (Verbal Explanations, Lectures)', pct: 28, color: 'bg-amber-500' },
          { label: 'Kinesthetic Learners (Code Sandboxes, Hands-on)', pct: 18, color: 'bg-emerald-500' }
        ].map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between font-medium">
              <span className="text-foreground">{item.label}</span>
              <span className="text-muted-foreground font-bold">{item.pct}%</span>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
