'use client';

import React, { useState } from 'react';
import WellnessCheckin from '@/components/wellness/WellnessCheckin';
import WellnessDashboard from '@/components/wellness/WellnessDashboard';
import CounselorBooking from '@/components/wellness/CounselorBooking';
import { Heart, Activity, Calendar } from 'lucide-react';

export default function StudentWellnessPage() {
  const [activeTab, setActiveTab] = useState<'trends' | 'checkin' | 'counselor'>('trends');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            Student Wellness & Mental Health
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-1 font-medium">
            AI-driven mood check-ins, burnout alerts, and confidential counselor bookings.
          </p>
        </div>

        <div className="flex p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-sm gap-1">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'trends' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            My Trends
          </button>
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'checkin' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Heart className="w-4 h-4" />
            Daily Check-In
          </button>
          <button
            onClick={() => setActiveTab('counselor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'counselor' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Book Counselor
          </button>
        </div>
      </div>

      {activeTab === 'trends' && <WellnessDashboard key={refreshKey} />}
      {activeTab === 'checkin' && (
        <div className="max-w-xl mx-auto">
          <WellnessCheckin
            onCheckinSuccess={() => {
              setRefreshKey((k) => k + 1);
              setActiveTab('trends');
            }}
          />
        </div>
      )}
      {activeTab === 'counselor' && (
        <div className="max-w-xl mx-auto">
          <CounselorBooking
            onScheduled={() => {
              setActiveTab('trends');
            }}
          />
        </div>
      )}
    </div>
  );
}
