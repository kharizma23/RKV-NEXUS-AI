'use client';

import React from 'react';
import { Globe, Award, TrendingUp } from 'lucide-react';

interface GlobalRankingChartProps {
  universities: any[];
}

export function GlobalRankingChart({ universities }: GlobalRankingChartProps) {
  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">QS World Top Tier Engineering Parity Radar</h3>
          <p className="text-xs text-muted-foreground">Placement rates, CO outcome standards, and international salary packages</p>
        </div>
        <div className="flex items-center space-x-1 text-xs font-bold text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
          <Globe className="w-3.5 h-3.5" />
          <span>QS Global Standards</span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {universities.map((uni) => (
          <div key={uni.id} className="p-3 bg-muted/40 rounded-xl space-y-2 border">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-black flex items-center justify-center text-[10px]">
                  #{uni.ranking}
                </span>
                <span className="font-bold text-foreground">{uni.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium">({uni.country})</span>
              </div>
              <div className="flex items-center space-x-3 font-semibold">
                <span className="text-emerald-600 font-mono text-[11px]">{uni.placement_rate}% Placement</span>
                <span className="text-muted-foreground font-mono text-[11px]">${(uni.avg_salary_usd / 1000).toFixed(0)}k/yr</span>
              </div>
            </div>

            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                style={{ width: `${Math.min(uni.placement_rate, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
