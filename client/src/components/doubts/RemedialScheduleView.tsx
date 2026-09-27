'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle2, MapPin, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function RemedialScheduleView() {
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcoming = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any[]>('/faculty/remedial/upcoming');
      setUpcoming(data || []);
    } catch (err) {
      console.error('Failed to load upcoming remedial classes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  return (
    <div className="p-5 bg-card border rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Upcoming Scheduled Remedial Clinics</span>
        </div>
        <button
          onClick={fetchUpcoming}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center text-xs text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
        </div>
      ) : upcoming.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No upcoming remedial sessions scheduled yet. Click "Schedule Remedial" on any misconception to plan a clinic.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {upcoming.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl border bg-muted/10 hover:border-emerald-500/30 transition space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-foreground line-clamp-1">{c.title}</p>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                  {c.status || 'CONFIRMED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{c.scheduled_at}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{c.duration} Mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{c.enrolled_students_count} Enrolled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{c.venue || 'Hall C-204 / Virtual Lab'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
