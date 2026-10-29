'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { MapPin, Clock } from 'lucide-react';

interface RoomScheduleProps {
  timetableId?: string;
}

export function RoomSchedule({ timetableId }: RoomScheduleProps) {
  const [room, setRoom] = useState('Lecture Hall 101');
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoomSlots = async (rm: string) => {
    if (!timetableId) return;
    setLoading(true);
    try {
      const res = await apiClient<any>(`/timetable/${timetableId}/room?room_id=${encodeURIComponent(rm)}`);
      setSlots(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomSlots(room);
  }, [timetableId, room]);

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Lecture Hall & Lab Utilization</h3>
            <p className="text-xs text-muted-foreground">Verify venue occupancy and prevent double-booking</p>
          </div>
        </div>

        <select
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="px-3 py-1.5 bg-background border rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
        >
          <option value="Lecture Hall 101">Lecture Hall 101</option>
          <option value="Lecture Hall 102">Lecture Hall 102</option>
          <option value="Computing Lab 3">Computing Lab 3</option>
          <option value="Seminar Hall A">Seminar Hall A</option>
        </select>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground p-6 text-center animate-pulse">Loading room schedule...</div>
      ) : slots.length === 0 ? (
        <div className="text-xs text-muted-foreground p-6 text-center">Room is vacant during these hours.</div>
      ) : (
        <div className="divide-y text-xs">
          {slots.map((s) => (
            <div key={s.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground">{s.subject_name}</span>
                <span className="text-[11px] text-muted-foreground ml-2 font-medium">({s.faculty_name})</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-indigo-600 font-semibold font-mono">
                <span>{s.day}</span>
                <span>•</span>
                <span>{s.start_time} - {s.end_time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RoomSchedule;
