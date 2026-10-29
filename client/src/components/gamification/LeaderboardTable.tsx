'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Flame, Award, Medal } from 'lucide-react';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  department: string;
  total_points: number;
  streak_days: number;
  badge_count: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="p-1 rounded-full bg-amber-500/20 text-amber-500 font-black text-xs">🥇 #1</span>;
    if (rank === 2) return <span className="p-1 rounded-full bg-slate-300/30 text-slate-400 font-black text-xs">🥈 #2</span>;
    if (rank === 3) return <span className="p-1 rounded-full bg-amber-700/20 text-amber-700 font-black text-xs">🥉 #3</span>;
    return <span className="font-bold text-xs text-muted-foreground">#{rank}</span>;
  };

  return (
    <Card className="border">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Department Leaderboard
          </CardTitle>
          <span className="text-xs text-muted-foreground font-semibold">Top Ranked Scholars</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {entries.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No points recorded on leaderboard yet.
            </div>
          ) : (
            entries.map((entry) => {
              const isCurrentUser = currentUserId && entry.user_id === currentUserId;
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-3.5 px-4 transition-colors ${
                    isCurrentUser ? 'bg-primary/10 border-l-4 border-l-primary font-bold' : 'hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-center">{getRankBadge(entry.rank)}</div>
                    <div>
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        {entry.full_name}
                        {isCurrentUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary">You</span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{entry.department}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden sm:block">
                      <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center justify-end gap-1">
                        <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                        {entry.streak_days}d
                      </div>
                      <div className="text-[9px] text-muted-foreground">Streak</div>
                    </div>

                    <div className="hidden sm:block">
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-end gap-1">
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
                        {entry.badge_count}
                      </div>
                      <div className="text-[9px] text-muted-foreground">Badges</div>
                    </div>

                    <div className="min-w-16">
                      <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {entry.total_points}
                      </div>
                      <div className="text-[9px] text-muted-foreground">Pts</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
