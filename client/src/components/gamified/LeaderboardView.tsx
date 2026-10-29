'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame, RefreshCw, Crown } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function LeaderboardView({ gamifiedExamId = 'default-gamified' }: { gamifiedExamId?: string }) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>(`/gamified-exams/${gamifiedExamId}/leaderboard`);
      setLeaderboard(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [gamifiedExamId]);

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Real-Time Exam Arena Leaderboard</h3>
            <p className="text-xs text-muted-foreground">
              Live ranking computed across level points, boss challenges, and speed multipliers.
            </p>
          </div>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Fetching live arena rankings...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
          No candidates have completed arena levels yet. Be the first to claim Rank #1!
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((item, index) => {
            const rank = item.rank || index + 1;
            let rankBadge = (
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                #{rank}
              </span>
            );
            if (rank === 1) {
              rankBadge = (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                </div>
              );
            } else if (rank === 2) {
              rankBadge = (
                <div className="w-6 h-6 rounded-full bg-neutral-300 text-neutral-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
              );
            } else if (rank === 3) {
              rankBadge = (
                <div className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
              );
            }

            return (
              <div
                key={index}
                className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  {rankBadge}
                  <div>
                    <span className="font-bold text-foreground block">{item.name}</span>
                    <span className="text-[11px] text-muted-foreground">{item.highest_tier || 'Level 1'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
                    <span>{item.total_points} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
