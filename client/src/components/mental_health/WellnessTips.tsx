'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, RefreshCw, Sun, Moon, Coffee } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function WellnessTips() {
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTips = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any[]>('/student/mental-health/tips');
      setTips(data || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-rose-950/40 via-pink-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-rose-500/20 shadow-xl space-y-2">
        <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30 flex items-center gap-1 w-fit">
          <Heart className="w-3 h-3 text-rose-400" /> Cognitive Rest & Mindfulness
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Early Wellness & Cognitive Tips</h1>
        <p className="text-sm text-slate-300">
          Personalized recommendations tailored to your recent assessment intensity and examination workload.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="p-6 bg-slate-900/70 border border-slate-800 hover:border-rose-500/30 rounded-2xl space-y-3 transition shadow-lg"
          >
            <div className="p-2 bg-rose-500/10 rounded-xl w-fit">
              <Sun className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-base font-semibold text-white">{tip.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{tip.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
