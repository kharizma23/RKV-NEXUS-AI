'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Flame, Award, Star, TrendingUp } from 'lucide-react';

interface PointsCardProps {
  points: number;
  totalPoints: number;
  streakDays: number;
  badgeCount: number;
}

export function PointsCard({ points, totalPoints, streakDays, badgeCount }: PointsCardProps) {
  return (
    <Card className="border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/10 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Trophy className="w-24 h-24 text-amber-500" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" /> Academic Rewards & Points
          </CardTitle>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
            Level {Math.max(1, Math.floor(totalPoints / 100) + 1)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 text-center pt-1">
          <div className="p-2.5 rounded-lg bg-background/80 border border-amber-500/20">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              {points}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">Current Points</p>
          </div>

          <div className="p-2.5 rounded-lg bg-background/80 border border-orange-500/20">
            <div className="text-2xl font-black text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              {streakDays}d
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">Study Streak</p>
          </div>

          <div className="p-2.5 rounded-lg bg-background/80 border border-indigo-500/20">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
              <Award className="w-4 h-4 text-indigo-500" />
              {badgeCount}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">Badges Earned</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
