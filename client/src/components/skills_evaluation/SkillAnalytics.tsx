'use client';

import React from 'react';
import { Target, Award, BarChart2, TrendingUp } from 'lucide-react';

export function SkillAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Institutional Competency & Skill Acquisition Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Longitudinal skill mastery progression mapped to ABET accreditation criteria.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Problem Solving Mastery', score: '91.2%', delta: '+4.2%' },
          { label: 'Critical Thinking Attainment', score: '87.5%', delta: '+2.8%' },
          { label: 'Technical Communication', score: '82.0%', delta: '+5.1%' },
          { label: 'System Design Creativity', score: '79.4%', delta: '+1.9%' }
        ].map((item, idx) => (
          <div key={idx} className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">{item.label}</span>
            <div className="text-2xl font-black text-foreground">{item.score}</div>
            <span className="text-[11px] text-emerald-500 font-semibold">{item.delta} vs past term</span>
          </div>
        ))}
      </div>
    </div>
  );
}
