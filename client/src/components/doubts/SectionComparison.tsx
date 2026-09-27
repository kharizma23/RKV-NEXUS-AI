'use client';

import React, { useState, useEffect } from 'react';
import { GitCompare, Users, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function SectionComparison() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient<any>('/faculty/doubts/section-comparison')
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load section comparison', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-5 bg-card border rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <div>
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-indigo-500" />
            <span>Cross-Section Benchmark & Disparity Matrix</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify cohorts requiring prioritized instructional interventions
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center text-xs text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
        </div>
      ) : data ? (
        <div className="space-y-4 text-xs">
          {/* Section Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  {data.section_a.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {data.section_a.student_count} Students
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-muted-foreground">Avg Error Rate:</span>
                <span className="font-mono font-bold text-foreground">{data.section_a.avg_misconception_rate}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Top Bottleneck:</span>
                <span className="font-semibold text-foreground truncate max-w-[200px]">{data.section_a.dominant_issue}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                  {data.section_b.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  {data.section_b.student_count} Students (Remedial Focus)
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-muted-foreground">Avg Error Rate:</span>
                <span className="font-mono font-bold text-rose-500">{data.section_b.avg_misconception_rate}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Top Bottleneck:</span>
                <span className="font-semibold text-rose-400 truncate max-w-[200px]">{data.section_b.dominant_issue}</span>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="border rounded-xl overflow-hidden divide-y">
            <div className="p-3 bg-muted/30 font-bold text-[11px] grid grid-cols-12 text-muted-foreground uppercase tracking-wider">
              <span className="col-span-6">Misconception</span>
              <span className="col-span-2 text-center">Section A</span>
              <span className="col-span-2 text-center">Section B</span>
              <span className="col-span-2 text-right">Variance</span>
            </div>

            {data.comparison.map((item: any, idx: number) => (
              <div key={idx} className="p-3 grid grid-cols-12 items-center text-xs bg-card hover:bg-muted/10 transition-colors">
                <span className="col-span-6 font-semibold text-foreground line-clamp-1">
                  {item.concept}
                </span>
                <span className="col-span-2 text-center font-mono font-bold text-foreground">
                  {item.section_a_pct}%
                </span>
                <span className="col-span-2 text-center font-mono font-bold text-rose-500">
                  {item.section_b_pct}%
                </span>
                <span className="col-span-2 text-right text-[11px] font-semibold text-amber-500 truncate">
                  {item.difference}
                </span>
              </div>
            ))}
          </div>

          {/* Recommendation Banner */}
          <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-foreground text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              <strong>Pedagogical Insight:</strong> {data.recommendation}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
