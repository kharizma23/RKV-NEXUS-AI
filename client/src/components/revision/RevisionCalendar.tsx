'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { RevisionReminder } from './RevisionReminder';

export function RevisionCalendar() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<any[]>('/student/revision-schedule');
      setSchedules(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load personalized revision schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleComplete = async (id: string) => {
    setCompletingId(id);
    try {
      await apiClient(`/student/revision/${id}/complete`, { method: 'POST' });
      setSchedules(prev =>
        prev.map(s => (s.id === id ? { ...s, status: 'COMPLETED', completed_at: new Date().toISOString() } : s))
      );
    } catch (err: any) {
      setError(err?.message || 'Could not update revision status.');
    } finally {
      setCompletingId(null);
    }
  };

  const filtered = schedules.filter(s => {
    if (filter === 'PENDING') return s.status !== 'COMPLETED';
    if (filter === 'COMPLETED') return s.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-cyan-900/40 via-blue-900/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-cyan-500/20 shadow-xl">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30 flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Spaced Repetition Engine
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Personalized Revision Scheduler</h1>
          <p className="text-sm text-slate-300">
            Algorithmic spacing based on human forgetting curves (Ebbinghaus intervals: 1d, 3d, 7d, 21d).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSchedule}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Timeline
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 border border-slate-800 rounded-xl w-fit">
        {(['ALL', 'PENDING', 'COMPLETED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              filter === tab
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'ALL' ? 'All Schedules' : tab === 'PENDING' ? 'Pending Review' : 'Completed'}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 mx-auto text-cyan-400 mb-3" />
          <h3 className="text-lg font-semibold text-white">No Revision Tasks Found</h3>
          <p className="text-sm text-slate-400 mt-1">
            You are fully up to date on your memory consolidation milestones.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(sched => (
            <RevisionReminder
              key={sched.id}
              schedule={sched}
              onComplete={handleComplete}
              completing={completingId === sched.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
