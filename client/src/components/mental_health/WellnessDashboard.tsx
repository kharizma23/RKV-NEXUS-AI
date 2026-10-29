'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart, Activity, CheckCircle2, RefreshCw, AlertTriangle,
  UserCheck, Bell, Shield, ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';

export function WellnessDashboard() {
  const [data, setData] = useState<any>({
    campus_wellness_score: 84.6,
    open_alerts: 5,
    interventions_active: 12,
    support_satisfaction_rate: 94.2
  });
  const [loading, setLoading] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/admin/mental-health/overview');
      if (res && typeof res === 'object') {
        setData((prev: any) => ({ ...prev, ...res }));
      }
    } catch {
      // Baseline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const activeAlerts = [
    { id: '1', scholar: 'Student #10842 (CSE 3rd Yr)', issue: 'High Cognitive Fatigue & Sleep Disruption', severity: 'Critical', counselor: 'Dr. Sarah Jenkins', date: '2h ago' },
    { id: '2', scholar: 'Student #10915 (ECE 2nd Yr)', issue: 'Pre-Exam Anxiety & Attendance Drop', severity: 'Warning', counselor: 'Dr. Michael Chen', date: '5h ago' },
    { id: '3', scholar: 'Student #10721 (Mech 4th Yr)', issue: 'Post-Interview Stress Burnout', severity: 'Suggestion', counselor: 'Counselor Assigned', date: '1d ago' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-rose-400" /> Cognitive Wellness Sentinel
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">Institutional Wellness & Mental Health Telemetry</h1>
          <p className="text-slate-300 text-xs mt-1">
            Real-time aggregate campus wellness index, proactive counselor caseloads, and student care satisfaction metrics.
          </p>
        </div>

        <Button
          size="sm"
          onClick={fetchOverview}
          disabled={loading}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Sentinel
        </Button>
      </div>

      {/* 4 Vibrant Metric KPI Cards (Image 1 Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:border-rose-500/40 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Campus Wellness Score</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-600">{data.campus_wellness_score}%</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Positive sentiment index</p>
          </CardContent>
        </Card>

        <Card className="hover:border-amber-500/40 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Sentinel Alerts</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600">{data.open_alerts}</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Early intervention queues</p>
          </CardContent>
        </Card>

        <Card className="hover:border-cyan-500/40 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Active Interventions</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-cyan-600">{data.interventions_active}</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Under counselor advisory</p>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-500/40 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Care Satisfaction</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">{data.support_satisfaction_rate}%</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Student feedback rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Proactive Intervention Queue Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Proactive Counselor Intervention Queue</h3>
            <p className="text-xs text-muted-foreground">Automated behavioral pattern anomalies requiring confidential guidance</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b text-muted-foreground uppercase text-[10px] font-bold">
                <th className="py-3 px-2">Scholar Tag</th>
                <th className="py-3 px-2">Behavioral / Wellness Concern</th>
                <th className="py-3 px-2">Severity</th>
                <th className="py-3 px-2">Lead Counselor</th>
                <th className="py-3 px-2">Detected</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {activeAlerts.map((a) => (
                <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3.5 px-2 font-bold text-foreground">{a.scholar}</td>
                  <td className="py-3.5 px-2 text-muted-foreground font-medium">{a.issue}</td>
                  <td className="py-3.5 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      a.severity === 'Critical'
                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        : a.severity === 'Warning'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        : 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 font-semibold text-foreground">{a.counselor}</td>
                  <td className="py-3.5 px-2 text-muted-foreground">{a.date}</td>
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => alert(`Opening confidential wellness intervention plan for ${a.scholar}`)}
                      className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition"
                    >
                      Coordinate Care
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
