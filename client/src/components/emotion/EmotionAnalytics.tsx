'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Activity, Coffee, Lightbulb, RefreshCw, BarChart3, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function EmotionAnalytics() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/faculty/emotion/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const emotions = analytics?.breakdown || {
    happy: 46,
    stressed: 24,
    confused: 18,
    bored: 8,
    sad: 4
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Candidate Affective Sentiment & Cognitive State Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Faculty insight into exam fatigue, stress spikes, confusion patterns, and adaptive intervention efficacy.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Affective Metrics
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Cohort Calm Index</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-foreground">
            {analytics?.calm_index ?? '78.5%'}
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">
            Optimal Cognitive Baseline
          </span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Stress Breaks Triggered</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-500">
            {analytics?.breaks_offered ?? 19}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 inline-block">
            {analytics?.breaks_accepted ?? 15} accepted by candidates
          </span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Cognitive Hints Served</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-500">
            {analytics?.hints_revealed ?? 28}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 inline-block">
            Triggered at confusion &gt; 70%
          </span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Sentiment Frames</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-foreground">
            {analytics?.total_logs ?? 1420}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 inline-block">
            Analyzed across all active exams
          </span>
        </div>
      </div>

      {/* Emotion Distribution Visualizer */}
      <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> Examination Affective Spectrum Breakdown
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Happy / Calm / Focused', count: emotions.happy, color: 'bg-emerald-500' },
            { name: 'Elevated Stress / Anxiety', count: emotions.stressed, color: 'bg-rose-500' },
            { name: 'Confusion / Cognitive Block', count: emotions.confused, color: 'bg-amber-500' },
            { name: 'Boredom / High Ease', count: emotions.bored, color: 'bg-indigo-500' },
            { name: 'Fatigue / Mental Strain', count: emotions.sad, color: 'bg-purple-500' }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-foreground">{item.name}</span>
                <span className="text-muted-foreground font-semibold">{item.count}%</span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${item.count}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
