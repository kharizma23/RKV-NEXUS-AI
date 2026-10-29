'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function CompetitionLeaderboard({ competitionId }: { competitionId: string }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any[]>(`/competitions/${competitionId}/leaderboard`);
      setEntries(data || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [competitionId]);

  return (
    <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> Inter-Collegiate Live Standings
        </h3>
        <button
          onClick={fetchLeaderboard}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="divide-y divide-slate-800/80">
        {entries.map((e, idx) => (
          <div key={idx} className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  idx === 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : idx === 1
                    ? 'bg-slate-400/20 text-slate-200 border border-slate-400/40'
                    : 'bg-indigo-500/20 text-indigo-300'
                }`}
              >
                #{e.rank}
              </span>
              <span className="text-sm font-semibold text-white">{e.institution_name}</span>
            </div>
            <span className="text-sm font-bold text-amber-400">{e.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
