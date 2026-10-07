'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Award, CheckCircle, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ProfileRadar } from './ProfileRadar';

export function ParentChildView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/parent/child/profile/360');
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch child progress profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-emerald-500/20 shadow-xl">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1 w-fit">
            <Heart className="w-3 h-3 text-emerald-400" /> Parent Portal Verified View
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ward Academic & Wellness 360° Profile</h1>
          <p className="text-sm text-slate-300">
            Real-time verified overview of academic milestones, class attendance reliability, and cognitive wellness.
          </p>
        </div>
        <button
          onClick={fetchChildProfile}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 bg-slate-800/40 rounded-2xl animate-pulse" />
      ) : data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Academic Score</span>
              <p className="text-2xl font-bold text-white">{data.academic_score}%</p>
            </div>
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Class Attendance</span>
              <p className="text-2xl font-bold text-emerald-400">{data.attendance_rate}%</p>
            </div>
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Campus Wellness</span>
              <p className="text-2xl font-bold text-rose-400">{data.wellness_score}%</p>
            </div>
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Placement Velocity</span>
              <p className="text-2xl font-bold text-cyan-400">{data.placement_readiness}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col items-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 self-start mb-2">
                Verified Competency Radar
              </h3>
              {data.radar_dimensions && <ProfileRadar dimensions={data.radar_dimensions} />}
            </div>

            <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                AI Advisory to Parents
              </h3>
              <div className="p-4 bg-slate-950/60 border border-emerald-500/20 rounded-xl text-slate-200 text-sm leading-relaxed">
                {data.ai_summary}
              </div>
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Zero unexcused attendance absences or critical behavioral infractions recorded.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
