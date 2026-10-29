'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Radio, Sparkles, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function StudentEngagement({ sessionId = 'default-live-session' }: { sessionId?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEngagement = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>(`/student/live-session/my-engagement?session_id=${sessionId}`);
      setData(res);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagement();
  }, [sessionId]);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-teal-950/40 via-cyan-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-teal-500/20 shadow-xl space-y-2">
        <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30 flex items-center gap-1 w-fit">
          <Activity className="w-3 h-3 text-teal-400" /> Focus Telemetry
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Your Real-time Class Engagement</h1>
        <p className="text-sm text-slate-300">
          Personal attention score and interactive poll participation metrics recorded during active lecture sessions.
        </p>
      </div>

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-medium">Attention Score</span>
            <p className="text-3xl font-extrabold text-cyan-400">{data.attention_score}%</p>
          </div>
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-medium">Interactions Logged</span>
            <p className="text-3xl font-extrabold text-white">{data.interaction_count}</p>
          </div>
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-medium">Focus Tier</span>
            <p className="text-xl font-bold text-emerald-400 truncate mt-1">{data.engagement_tier}</p>
          </div>
        </div>
      )}
    </div>
  );
}
