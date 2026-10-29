'use client';

import React, { useState, useEffect } from 'react';
import { Heart, AlertTriangle, CheckCircle2, User, RefreshCw, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { CounselorQueue } from './CounselorQueue';

export function MentalHealthAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any[]>('/faculty/mental-health/alerts');
      setAlerts(data || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-rose-950/40 via-red-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-rose-500/20 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Early Mental Health Sentinel Alerts</h1>
          <p className="text-sm text-slate-300">
            AI detects chronic stress, assessment fatigue, and sudden attendance drop patterns to trigger proactive counseling interventions.
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {alt.alert_type}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {alt.severity} SEVERITY
                </span>
                <span className="text-xs text-slate-500">
                  Status: {alt.status}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">Scholar: {alt.student_name}</h4>
              <p className="text-xs text-slate-400">{alt.student_email}</p>
            </div>

            <button
              onClick={() => setSelectedAlert(alt)}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow-md active:scale-95"
            >
              Schedule Intervention
            </button>
          </div>
        ))}
      </div>

      {selectedAlert && (
        <CounselorQueue
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onScheduled={() => {
            setSelectedAlert(null);
            fetchAlerts();
          }}
        />
      )}
    </div>
  );
}
