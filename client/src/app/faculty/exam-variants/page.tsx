'use client';

import React, { useState } from 'react';
import { VariantGenerator } from '@/components/exam_variants/VariantGenerator';
import { VariantAssignment } from '@/components/exam_variants/VariantAssignment';
import { Layers, Users } from 'lucide-react';

export default function FacultyExamVariantsPage() {
  const [tab, setTab] = useState<'generate' | 'assign'>('generate');

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setTab('generate')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            tab === 'generate' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> Synthesize Variants
        </button>
        <button
          onClick={() => setTab('assign')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            tab === 'assign' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Distribute to Cohort
        </button>
      </div>

      {tab === 'generate' ? <VariantGenerator /> : <VariantAssignment />}
    </div>
  );
}
