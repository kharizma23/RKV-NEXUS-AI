'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Heart, Activity, AlertCircle, Calendar, Sparkles, Moon, Sun, ArrowUpRight } from 'lucide-react';

export function WellnessDashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [histRes, alertsRes] = await Promise.all([
        apiClient<any>('/wellness/history'),
        apiClient<any>('/wellness/alerts')
      ]);
      setHistory(histRes.data || []);
      setAlerts(alertsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const latest = history[0];
  const avgMood = history.length ? (history.reduce((a, b) => a + b.mood_score, 0) / history.length).toFixed(1) : '7.5';
  const avgSleep = history.length ? (history.reduce((a, b) => a + b.sleep_hours, 0) / history.length).toFixed(1) : '7.0';
  const avgStress = history.length ? (history.reduce((a, b) => a + b.stress_level, 0) / history.length).toFixed(1) : '4.5';

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase">
            <span>Average Mood</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{avgMood} <span className="text-xs font-normal text-muted-foreground">/ 10</span></div>
          <p className="text-[11px] text-emerald-600 font-semibold">Positive psychological stability</p>
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase">
            <span>Stress Index</span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{avgStress} <span className="text-xs font-normal text-muted-foreground">/ 10</span></div>
          <p className="text-[11px] text-muted-foreground font-medium">Controlled exam pressure</p>
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase">
            <span>Sleep Duration</span>
            <Moon className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{avgSleep} <span className="text-xs font-normal text-muted-foreground">hours</span></div>
          <p className="text-[11px] text-indigo-600 font-semibold">Consistent circadian rhythm</p>
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase">
            <span>Active Alerts</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{alerts.length}</div>
          <p className="text-[11px] text-muted-foreground font-medium">Preventive radar tracking</p>
        </div>
      </div>

      {/* Alerts Feed */}
      {alerts.length > 0 && (
        <div className="p-5 bg-card border border-amber-500/30 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>AI Mental Health Radar Alerts</span>
          </div>
          <div className="space-y-2">
            {alerts.map((al) => (
              <div key={al.id} className="p-3 bg-muted/40 rounded-xl flex items-start justify-between text-xs">
                <div>
                  <span className={`font-black text-[10px] px-2 py-0.5 rounded-full ${al.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-600' : 'bg-amber-500/20 text-amber-600'}`}>
                    {al.severity}
                  </span>
                  <span className="font-bold ml-2 text-foreground">{al.alert_type.replace(/_/g, ' ')}</span>
                  <p className="text-muted-foreground text-[11px] mt-1">{al.recommended_action}</p>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-4">
                  {new Date(al.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Log */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Recent Check-In History</h3>
        {loading ? (
          <div className="text-xs text-muted-foreground animate-pulse">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-xs text-muted-foreground">No wellness logs recorded yet.</div>
        ) : (
          <div className="divide-y text-xs">
            {history.map((item) => (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-4">
                  <div className="text-[11px] font-mono text-muted-foreground w-20">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-foreground">Mood: {item.mood_score}/10</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-bold text-rose-600">Stress: {item.stress_level}/10</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-bold text-indigo-600">Sleep: {item.sleep_hours}h</span>
                  </div>
                </div>
                {item.notes && (
                  <p className="text-[11px] text-muted-foreground italic truncate max-w-sm">
                    &quot;{item.notes}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WellnessDashboard;
