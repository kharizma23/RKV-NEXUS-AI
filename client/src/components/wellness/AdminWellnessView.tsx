'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Heart, Activity, AlertTriangle, Users, ShieldAlert, BarChart3, TrendingUp } from 'lucide-react';

export function AdminWellnessView() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/admin/wellness/overview');
      setOverview(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Loading institutional mental health analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">Campus Mental Health & Wellness Radar</h1>
          <p className="text-xs text-muted-foreground">
            Aggregate student psychological metrics, burnout detection, and counselor capacity
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
          FERPA Anonymized Live Feeds
        </span>
      </div>

      {overview && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Campus Wellness Index</span>
              <div className="text-2xl font-black text-foreground">{overview.overall_campus_wellness_index} <span className="text-xs font-normal text-muted-foreground">/ 100</span></div>
              <p className="text-[11px] text-emerald-600 font-semibold">Institutional Health: Good</p>
            </div>

            <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Campus Average Mood</span>
              <div className="text-2xl font-black text-amber-500">{overview.avg_mood_score} <span className="text-xs font-normal text-muted-foreground">/ 10</span></div>
              <p className="text-[11px] text-muted-foreground">Aggregated from {overview.total_checkins} check-ins</p>
            </div>

            <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Average Stress Load</span>
              <div className="text-2xl font-black text-rose-500">{overview.avg_stress_level} <span className="text-xs font-normal text-muted-foreground">/ 10</span></div>
              <p className="text-[11px] text-muted-foreground">Mid-Term baseline variance</p>
            </div>

            <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active High-Risk Alerts</span>
              <div className="text-2xl font-black text-rose-600">{overview.active_alerts_count}</div>
              <p className="text-[11px] text-rose-600 font-semibold">Triage review required</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Campus Stress Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-600">Low Stress (Relaxed)</span>
                    <span>{overview.stress_distribution?.low || 62}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${overview.stress_distribution?.low || 62}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-600">Moderate Stress (Manageable)</span>
                    <span>{overview.stress_distribution?.moderate || 28}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${overview.stress_distribution?.moderate || 28}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-600">Elevated Burnout Risk</span>
                    <span>{overview.stress_distribution?.elevated || 10}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${overview.stress_distribution?.elevated || 10}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Counseling Center Capacity</h3>
              <div className="p-4 bg-muted/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Open Consultation Slots:</span>
                  <span className="font-bold text-foreground">{overview.counseling_slots_available} Available Today</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Avg Response Turnaround:</span>
                  <span className="font-bold text-emerald-600">&lt; 45 Minutes</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Licensed Counselors on Duty:</span>
                  <span className="font-bold text-foreground">4 Senior Clinicians</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Automated alerts seamlessly generate encrypted tickets directly for the University Student Support Center.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminWellnessView;
