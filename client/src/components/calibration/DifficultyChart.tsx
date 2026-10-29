'use client';

import React from 'react';
import { BarChart3, HelpCircle } from 'lucide-react';

interface DifficultyChartProps {
  calibrations: any[];
}

export function DifficultyChart({ calibrations }: DifficultyChartProps) {
  const easy = calibrations.filter((c) => c.difficulty_index >= 0.75).length;
  const medium = calibrations.filter((c) => c.difficulty_index >= 0.35 && c.difficulty_index < 0.75).length;
  const hard = calibrations.filter((c) => c.difficulty_index < 0.35).length;
  const total = calibrations.length || 1;

  const easyPct = Math.round((easy / total) * 100);
  const medPct = Math.round((medium / total) * 100);
  const hardPct = Math.round((hard / total) * 100);

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Psychometric Difficulty (P-Value) Distribution</h3>
          <p className="text-xs text-muted-foreground">Target OBE bell curve: 30% Easy, 50% Medium, 20% Hard</p>
        </div>
        <BarChart3 className="w-5 h-5 text-indigo-500" />
      </div>

      <div className="space-y-3 pt-2">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-emerald-600">Easy (P ≥ 0.75)</span>
            <span>{easy} questions ({easyPct}%)</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${easyPct}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-indigo-600">Medium / Calibrated (0.35 ≤ P &lt; 0.75)</span>
            <span>{medium} questions ({medPct}%)</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${medPct}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-rose-600">Hard (P &lt; 0.35)</span>
            <span>{hard} questions ({hardPct}%)</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${hardPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
