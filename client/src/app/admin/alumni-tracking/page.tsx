'use client';

import React, { useState } from 'react';
import AlumniAnalytics from '@/components/alumni/AlumniAnalytics';
import COCareerMapping from '@/components/alumni/COCareerMapping';
import AlumniDirectory from '@/components/alumni/AlumniDirectory';
import { Briefcase, Map, Users } from 'lucide-react';

export default function AdminAlumniPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'co-mapping' | 'directory'>('analytics');

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Alumni Career Tracking & OBE Feedback Loop
          </h1>
          <p className="text-slate-400 text-sm">
            Correlate Course Outcome (CO) attainment with alumni salary packages and industry roles.
          </p>
        </div>

        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Placement Analytics
          </button>
          <button
            onClick={() => setActiveTab('co-mapping')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'co-mapping' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            CO-to-Career Mapping
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'directory' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Alumni Directory
          </button>
        </div>
      </div>

      {activeTab === 'analytics' && <AlumniAnalytics />}
      {activeTab === 'co-mapping' && <COCareerMapping />}
      {activeTab === 'directory' && <AlumniDirectory />}
    </div>
  );
}
