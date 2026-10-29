'use client';

import React from 'react';
import { ArrowRight, AlertCircle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';

interface UniversityComparisonProps {
  metrics: any[];
  targetUniversity?: string;
}

export function UniversityComparison({ metrics, targetUniversity = "MIT / Stanford Standards" }: UniversityComparisonProps) {
  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Accreditation Metrics & Gap Matrix</h3>
          <p className="text-xs text-muted-foreground">Comparing RKV NEXUS autonomous standards against {targetUniversity}</p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
          ABET Criteria 3 & Washington Accord
        </span>
      </div>

      <div className="space-y-3">
        {metrics.map((m, idx) => {
          const isNegative = m.gap < 0;
          return (
            <div key={idx} className="p-4 bg-muted/40 rounded-xl space-y-3 border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-bold text-foreground text-sm">{m.metric_name}</span>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block uppercase">Our Value</span>
                    <span className="font-black text-foreground">{m.our_value}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Global Peer</span>
                    <span className="font-black text-indigo-600">{m.their_value}</span>
                  </div>
                  <div className="pl-2 border-l">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center space-x-1 ${
                      isNegative ? 'bg-rose-500/20 text-rose-600' : 'bg-emerald-500/20 text-emerald-600'
                    }`}>
                      {isNegative ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      <span>{m.gap > 0 ? `+${m.gap}` : m.gap}</span>
                    </span>
                  </div>
                </div>
              </div>

              {m.recommendation && (
                <div className="p-2.5 bg-background rounded-lg border text-xs text-muted-foreground flex items-start space-x-2">
                  <span className="font-bold text-indigo-500 shrink-0">Recommendation:</span>
                  <span>{m.recommendation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
