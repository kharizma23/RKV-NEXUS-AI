'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar, Plus, Radio, RefreshCw, Clock,
  BookOpen, Briefcase, Users, Trophy, Edit, Trash2
} from 'lucide-react';

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'EXAM' | 'PLACEMENT' | 'MEETING' | 'HACKATHON';
  institution: string;
  date: string;
  status: string;
}

export function AcademicCalendarManager() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInst, setSelectedInst] = useState('All');
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'evt-1', title: 'AI & Data Science Mid-Term Exam', type: 'EXAM', institution: 'BIT', date: '2026-08-25', status: 'UPCOMING' },
    { id: 'evt-2', title: 'TCS & Infosys Campus Placement Drive', type: 'PLACEMENT', institution: 'VIT', date: '2026-08-28', status: 'UPCOMING' },
    { id: 'evt-3', title: 'Board of Studies Curriculum Meeting', type: 'MEETING', institution: 'All', date: '2026-09-01', status: 'SCHEDULED' },
    { id: 'evt-4', title: 'National Level Hackathon 2026', type: 'HACKATHON', institution: 'SRM', date: '2026-09-05', status: 'SCHEDULED' }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'EXAM',
    institution: 'BIT',
    date: '2026-09-10'
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/v1/admin/events');
      if (res.ok) {
        const json = await res.json();
        if (json.data) setEvents(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    const item: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newEvent.title,
      type: newEvent.type as any,
      institution: newEvent.institution,
      date: newEvent.date,
      status: 'UPCOMING'
    };
    setEvents([...events, item]);
    setShowAddModal(false);
    setNewEvent({ title: '', type: 'EXAM', institution: 'BIT', date: '2026-09-10' });
    alert(`📅 Event '${item.title}' scheduled and broadcasted!`);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'EXAM':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-600 border border-rose-500/20 font-bold">📝 Exam</span>;
      case 'PLACEMENT':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">💼 Placement Drive</span>;
      case 'MEETING':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 font-bold">👥 Meeting</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold">🏆 Hackathon</span>;
    }
  };

  const filtered = selectedInst === 'All' ? events : events.filter((e) => e.institution === selectedInst || e.institution === 'All');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-500" />
            📅 Academic Calendar & Event Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage academic examinations, placement drives, and holidays across all institutions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Event
          </Button>
          <Button size="sm" variant="outline" onClick={() => alert('Broadcasted event notifications across student & faculty dashboards!')} className="text-xs font-bold">
            <Radio className="w-3.5 h-3.5 mr-1.5 text-rose-500" /> Broadcast
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border p-3 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-muted-foreground">Institution:</span>
          <select
            value={selectedInst}
            onChange={(e) => setSelectedInst(e.target.value)}
            className="px-3 py-1.5 border rounded-lg bg-background text-foreground focus:outline-none"
          >
            <option value="All">All Institutions</option>
            <option value="BIT">BIT</option>
            <option value="VIT">VIT</option>
            <option value="SRM">SRM</option>
          </select>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{filtered.length} Upcoming Scheduled Events</span>
      </Card>

      {/* Calendar Quick Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['Mon 25', 'Tue 26', 'Wed 27', 'Thu 28'].map((day, idx) => (
          <Card key={idx} className="border text-center p-3">
            <p className="text-xs font-bold text-muted-foreground">{day}</p>
            <div className="mt-2 p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-600">
              {idx === 0 ? '📝 Mid-Term Exam (BIT)' : idx === 3 ? '💼 Placement Drive (VIT)' : '📅 Academic Hours'}
            </div>
          </Card>
        ))}
      </div>

      {/* Event List Table */}
      <Card className="border overflow-hidden">
        <CardHeader className="pb-3 bg-muted/40 border-b">
          <CardTitle className="text-sm font-bold">Scheduled Institutional Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/20 border-b text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Event Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Institution</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((evt) => (
                  <tr key={evt.id} className="hover:bg-muted/20">
                    <td className="p-3 font-bold text-foreground">{evt.title}</td>
                    <td className="p-3">{getEventBadge(evt.type)}</td>
                    <td className="p-3 font-mono font-semibold">{evt.institution}</td>
                    <td className="p-3 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {evt.date}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => alert(`Editing event ${evt.title}`)} className="text-[10px] h-7 px-2">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteEvent(evt.id)} className="text-[10px] h-7 px-2 text-rose-500 hover:bg-rose-500/10">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form onSubmit={handleAddEvent} className="bg-card border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-sm text-foreground">Schedule Academic Event</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-xs font-bold text-muted-foreground">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground">Event Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End Semester Exam 2026"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full mt-1 p-2 border rounded bg-background text-foreground"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground">Event Category:</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full mt-1 p-2 border rounded bg-background text-foreground"
                >
                  <option value="EXAM">Examination</option>
                  <option value="PLACEMENT">Placement Drive</option>
                  <option value="MEETING">Faculty Meeting</option>
                  <option value="HACKATHON">Hackathon / Event</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-muted-foreground">Target Institution:</label>
                <select
                  value={newEvent.institution}
                  onChange={(e) => setNewEvent({ ...newEvent, institution: e.target.value })}
                  className="w-full mt-1 p-2 border rounded bg-background text-foreground"
                >
                  <option value="All">All Institutions</option>
                  <option value="BIT">BIT</option>
                  <option value="VIT">VIT</option>
                  <option value="SRM">SRM</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-muted-foreground">Scheduled Date:</label>
                <input
                  type="date"
                  required
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full mt-1 p-2 border rounded bg-background text-foreground"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                Schedule & Broadcast
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
