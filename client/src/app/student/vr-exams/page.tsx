'use client';

import React, { useState } from 'react';
import VRExamList from '@/components/vr/VRExamList';
import VRResults from '@/components/vr/VRResults';
import { Box, Award } from 'lucide-react';

export default function StudentVRExamsPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'results'>('available');

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Box className="w-5 h-5" />
            </div>
            AR / VR Virtual Lab & Practical Exams
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-1 font-medium">
            Immersive 3D interactive simulations, engineering lab trials, and WebXR practical evaluations.
          </p>
        </div>

        <div className="flex p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-sm gap-1">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'available'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Box className="w-4 h-4" />
            Available VR Exams
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'results'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Award className="w-4 h-4" />
            My Performance History
          </button>
        </div>
      </div>

      {activeTab === 'available' ? <VRExamList /> : <VRResults />}
    </div>
  );
}
