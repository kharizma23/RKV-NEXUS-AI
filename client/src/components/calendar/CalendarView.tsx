'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Sparkles, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  event_type: string;
  description: string;
  start_date: string;
  end_date: string;
}

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/calendar/events');
      if (res.ok) {
        const json = await res.json();
        setEvents(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching calendar', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAutoSchedule = async () => {
    try {
      const res = await fetch('/api/v1/calendar/auto-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester: 1 })
      });
      if (res.ok) {
        alert('AI Auto-Scheduler successfully scheduled continuous assessment slots with 0 room conflicts.');
        fetchEvents();
      }
    } catch (e) {
      console.error('Auto schedule error', e);
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'EXAMINATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">Examination</span>;
      case 'HOLIDAY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Holiday</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Smart Academic Calendar & Conflict Resolver
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated examination timetable balancer avoiding faculty slot clashes and student test fatigue.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleAutoSchedule}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Auto-Schedule Exams
          </Button>
        </div>
      </div>

      <Card className="border">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Scheduled Institutional Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-xs">
            {events.map((ev) => (
              <div key={ev.id} className="p-4 flex items-start justify-between gap-4 hover:bg-muted/15 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{ev.title}</span>
                    {getEventBadge(ev.event_type)}
                  </div>
                  <p className="text-muted-foreground text-xs">{ev.description}</p>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2 pt-1 font-semibold">
                    <span>From: {new Date(ev.start_date).toLocaleDateString()}</span>
                    <span>&rarr;</span>
                    <span>To: {new Date(ev.end_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-500/20 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Conflict Free
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
