'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Flame, Star, Plus, Shield, CheckCircle } from 'lucide-react';

export function GamificationLeaderboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/leaderboard');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            🏆 Gamification Leaderboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Gamified learning rankings, achievement badges, and student streak milestones</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => alert("Create Challenge modal opened!")} className="text-xs font-bold">
            <Plus className="w-3.5 h-3.5 mr-1" /> Create Challenge
          </Button>
          <Button size="sm" variant="outline" onClick={() => alert("Badge awarded to selected student!")} className="text-xs font-bold">
            <Award className="w-3.5 h-3.5 mr-1" /> Award Badge
          </Button>
          <Button size="sm" onClick={fetchLeaderboard} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 mr-1" /> Refresh Rankings
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Rankings Table */}
        <Card className="md:col-span-2 border">
          <CardHeader className="py-3 border-b bg-amber-500/5 border-amber-500/20">
            <CardTitle className="text-xs font-bold flex items-center gap-2 text-amber-700 dark:text-amber-300">
              🥇 Top Student Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {((Array.isArray(data) ? data : data?.rankings) || []).map((rk: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl border bg-card hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 font-black text-xs flex items-center justify-center border border-amber-500/20">
                    {rk.rank === 1 ? '🥇' : rk.rank === 2 ? '🥈' : rk.rank === 3 ? '🥉' : rk.rank}
                  </span>
                  <div>
                    <p className="text-xs font-black text-foreground">{rk.full_name || rk.name}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">{rk.department || rk.dept || 'Computer Science'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-amber-600 font-mono">{rk.total_points ?? rk.points ?? 0} pts</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {rk.badge_count ? `${rk.badge_count} Badges` : (rk.badge || 'Level 1')}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Available Badges */}
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              🏅 Available Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {data?.badges?.map((bd: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                <span className="text-xs font-bold text-foreground">{bd.title}</span>
                <span className="text-[10px] font-semibold text-muted-foreground font-mono">
                  {bd.earnedCount} Students
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
