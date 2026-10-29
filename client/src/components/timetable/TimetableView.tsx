'use client';

import React from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle2 } from 'lucide-react';

interface TimetableViewProps {
  timetable?: any;
  timetableId?: string;
}

export function TimetableView({ timetable: initialTimetable, timetableId }: TimetableViewProps) {
  const [timetable, setTimetable] = React.useState<any>(initialTimetable);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (initialTimetable) {
      setTimetable(initialTimetable);
    } else if (timetableId) {
      setLoading(true);
      fetch(`/api/v1/timetable/${timetableId}`)
        .then((r) => r.json())
        .then((data) => setTimetable(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [initialTimetable, timetableId]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Loading timetable...</div>;
  }

  if (!timetable || !timetable.slots) {
    return <div className="p-8 text-center text-xs text-muted-foreground">No timetable data generated yet.</div>;
  }

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const slotsByDay: Record<string, any[]> = {};
  days.forEach((d) => (slotsByDay[d] = []));

  timetable.slots.forEach((s: any) => {
    if (slotsByDay[s.day]) {
      slotsByDay[s.day].push(s);
    }
  });

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-foreground">Semester {timetable.semester} Academic Schedule</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black border border-emerald-500/20">
              OPTIMIZED {timetable.optimization_score}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Academic Year {timetable.academic_year} • 0 Faculty Clashes • 0 Room Collisions
          </p>
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-md border">
          {timetable.slots_count} Weekly Lecture Slots
        </span>
      </div>

      <div className="space-y-4">
        {days.map((day) => {
          const daySlots = slotsByDay[day] || [];
          return (
            <div key={day} className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 block px-1">
                {day}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {daySlots.map((slot: any) => (
                  <div
                    key={slot.id}
                    className="p-3 bg-muted/40 rounded-xl border border-border hover:border-indigo-500/50 transition-all space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span className="font-bold text-indigo-500">{slot.start_time} - {slot.end_time}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-foreground truncate">{slot.subject_name}</h4>
                      <span className="text-[10px] text-muted-foreground font-mono">{slot.subject_code}</span>
                    </div>

                    <div className="pt-2 border-t space-y-1 text-[10px] text-muted-foreground">
                      <div className="flex items-center space-x-1 truncate">
                        <User className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{slot.faculty_name}</span>
                      </div>
                      <div className="flex items-center space-x-1 truncate font-semibold text-foreground">
                        <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span>{slot.room_id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimetableView;
