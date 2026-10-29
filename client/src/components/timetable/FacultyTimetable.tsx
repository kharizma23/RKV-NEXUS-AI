'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { User, Clock, MapPin } from 'lucide-react';

interface FacultyTimetableProps {
  timetableId?: string;
}

export function FacultyTimetable({ timetableId }: FacultyTimetableProps) {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!timetableId) return;
      setLoading(true);
      try {
        const res = await apiClient<any>(`/timetable/${timetableId}/faculty`);
        setSlots(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timetableId]);

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
          <User className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Faculty Weekly Workload Roster</h3>
          <p className="text-xs text-muted-foreground">Individual assigned lecture and practical laboratory sessions</p>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground p-6 text-center animate-pulse">Loading faculty schedule...</div>
      ) : slots.length === 0 ? (
        <div className="text-xs text-muted-foreground p-6 text-center">No assigned slots in current timetable.</div>
      ) : (
        <div className="divide-y text-xs">
          {slots.map((s) => (
            <div key={s.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground">{s.subject_name}</span>
                <div className="flex items-center space-x-2 text-[11px] text-muted-foreground mt-0.5">
                  <span className="font-semibold text-indigo-500">{s.day}</span>
                  <span>•</span>
                  <span>{s.start_time} - {s.end_time}</span>
                </div>
              </div>
              <span className="font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded border">
                {s.room_id}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FacultyTimetable;
