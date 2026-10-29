'use client';

import React, { useState } from 'react';
import FacultyTimetable from '@/components/timetable/FacultyTimetable';
import RoomSchedule from '@/components/timetable/RoomSchedule';
import TimetableView from '@/components/timetable/TimetableView';
import { Calendar, User, Building } from 'lucide-react';

export default function FacultyTimetablePage() {
  const [activeTab, setActiveTab] = useState<'my' | 'rooms' | 'master'>('my');

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Faculty Academic Schedule & Workload
          </h1>
          <p className="text-slate-400 text-sm">
            View your weekly teaching load, laboratory allocations, and room occupancy schedules.
          </p>
        </div>

        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'my' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            My Weekly Schedule
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'rooms' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Classroom & Lab Finder
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'master' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Master Schedule
          </button>
        </div>
      </div>

      {activeTab === 'my' && <FacultyTimetable />}
      {activeTab === 'rooms' && <RoomSchedule />}
      {activeTab === 'master' && <TimetableView />}
    </div>
  );
}
