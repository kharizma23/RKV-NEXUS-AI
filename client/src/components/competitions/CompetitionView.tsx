'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { CompetitionLeaderboard } from './CompetitionLeaderboard';

export function CompetitionView() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any[]>('/competitions');
      setCompetitions(data || []);
      if (data && data.length > 0) {
        setSelectedCompId(data[0].id);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-amber-500/20 shadow-xl">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 flex items-center gap-1 w-fit">
            <Trophy className="w-3 h-3 text-amber-400" /> Inter-Collegiate Arena
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inter-College CO Attainment Competitions</h1>
          <p className="text-sm text-slate-300">
            Universities compete in real time based on verified student Course Outcome attainment, patent submissions, and hackathon milestones.
          </p>
        </div>
        <button
          onClick={fetchCompetitions}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competitions list */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Active Competitions</h3>
          {competitions.map((comp) => (
            <div
              key={comp.id}
              onClick={() => setSelectedCompId(comp.id)}
              className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                selectedCompId === comp.id
                  ? 'bg-amber-950/30 border-amber-500/50'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">{comp.category}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                  {comp.status}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">{comp.title}</h4>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Until {new Date(comp.end_date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {/* Live Leaderboard */}
        <div className="lg:col-span-2">
          {selectedCompId ? (
            <CompetitionLeaderboard competitionId={selectedCompId} />
          ) : (
            <div className="p-12 text-center text-sm text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
              Select a competition to view university rankings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
