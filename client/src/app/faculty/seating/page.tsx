'use client';

import React, { useState } from 'react';
import SeatingGenerator from '@/components/seating/SeatingGenerator';
import SeatingArrangement from '@/components/seating/SeatingArrangement';
import ConstraintManager from '@/components/seating/ConstraintManager';
import SeatingExport from '@/components/seating/SeatingExport';
import { Grid, Sliders, Printer } from 'lucide-react';

export default function FacultySeatingPage() {
  const [examId, setExamId] = useState('');
  const [activeTab, setActiveTab] = useState<'view' | 'constraints' | 'export'>('view');

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Grid className="w-6 h-6 text-indigo-400" />
            AI Anti-Cheating Seating Arrangement
          </h1>
          <p className="text-slate-400 text-sm">
            Generate balanced, conflict-free examination seating grids preventing adjacent same-programme allocations.
          </p>
        </div>

        {examId && (
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'view' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Seating Chart
            </button>
            <button
              onClick={() => setActiveTab('constraints')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'constraints' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Constraints
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'export' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              Export & Print
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          1. Generate or Select Examination
        </h2>
        <SeatingGenerator
          onGenerated={(id) => {
            setExamId(id);
            setActiveTab('view');
          }}
        />
      </div>

      {examId && (
        <div className="space-y-6">
          {activeTab === 'view' && <SeatingArrangement examId={examId} />}
          {activeTab === 'constraints' && <ConstraintManager examId={examId} />}
          {activeTab === 'export' && <SeatingExport examId={examId} examTitle="Final Semester Examination" />}
        </div>
      )}
    </div>
  );
}
