'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';

export function ComparativeDashboard() {
  const benchmarks = [
    { code: 'BIT', name: 'Bannari Amman Institute of Technology', co: 88.5, placement: 93.4, isTarget: true },
    { code: 'VIT', name: 'Vellore Institute of Technology', co: 91.0, placement: 95.2, isTarget: false },
    { code: 'SRM', name: 'SRM Institute of Science & Technology', co: 82.0, placement: 88.0, isTarget: false },
    { code: 'MIT', name: 'Madras Institute of Technology', co: 89.0, placement: 92.0, isTarget: false },
  ];

  return (
    <Card className="shadow-sm border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Live Institutional Benchmarking (BIT ⚡ VIT ⚡ SRM ⚡ MIT)
          </CardTitle>
          <CardDescription className="text-xs">
            Multi-Institutional Academic Performance & Placement Benchmarks
          </CardDescription>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
          AICTE Peer Group Comparison
        </span>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* Comparison Bars */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            CO Attainment Benchmark Comparison
          </h4>
          <div className="space-y-3">
            {benchmarks.map((b) => (
              <div key={b.code} className={`p-3 rounded-xl border ${b.isTarget ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-muted/10'}`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    {b.isTarget && <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    {b.code} — <span className="font-medium text-muted-foreground truncate">{b.name}</span>
                  </span>
                  <span className={b.isTarget ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-foreground'}>
                    {b.co}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.isTarget ? 'bg-indigo-600' : b.co > 90 ? 'bg-emerald-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${b.co}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placement Rate Benchmark */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Placement Rate Benchmark Comparison
          </h4>
          <div className="grid sm:grid-cols-4 gap-3">
            {benchmarks.map((b) => (
              <div key={b.code} className={`p-3 rounded-lg border text-center ${b.isTarget ? 'border-indigo-500/40 bg-indigo-500/5' : 'bg-muted/10'}`}>
                <div className="text-[10px] font-bold uppercase text-muted-foreground">{b.code}</div>
                <div className="text-lg font-black text-foreground mt-0.5">{b.placement}%</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Verified Placements</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Catch-up Recommendation Card */}
        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Sparkles className="w-4 h-4 text-amber-400" /> AI Strategic Recommendation for BIT
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            &quot;Focus on upgrading Semesters 5 & 6 AI/ML and Cloud Architecture electives to catch up with VIT&apos;s industry alignment and boost overall CO attainment by ~6.5%.&quot;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
