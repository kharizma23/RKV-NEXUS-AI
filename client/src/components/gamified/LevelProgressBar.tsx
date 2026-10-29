'use client';

import React from 'react';
import { Flame, Star, Trophy } from 'lucide-react';

interface LevelProgressBarProps {
  currentLevel: number;
  totalLevels?: number;
  totalPoints: number;
  nextTierPoints?: number;
}

export function LevelProgressBar({
  currentLevel,
  totalLevels = 4,
  totalPoints,
  nextTierPoints = 500
}: LevelProgressBarProps) {
  const percentage = Math.min(100, Math.round((totalPoints / nextTierPoints) * 100));

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">
              Tier Level {currentLevel} of {totalLevels}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {currentLevel === 4 ? 'BOSS BATTLE TIER' : `Level ${currentLevel} Progression`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{totalPoints} XP</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Level Milestone Progress</span>
          <span className="font-bold text-foreground">{percentage}% to Boss Unlock</span>
        </div>
        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
