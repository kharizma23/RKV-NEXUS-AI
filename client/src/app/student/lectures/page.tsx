'use client';

import React, { useState } from 'react';
import { SummaryView } from '@/components/lectures/SummaryView';
import { MCQPractice } from '@/components/lectures/MCQPractice';
import { BookOpen, CheckSquare, Video } from 'lucide-react';

export default function StudentLecturesPage() {
  const [tab, setTab] = useState<'summary' | 'mcq'>('summary');

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            AI Lecture Summaries & Formative MCQs
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-1 font-medium">
            AI-extracted key takeaways, algorithmic notes, and auto-generated formative quizzes.
          </p>
        </div>

        <div className="flex p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-sm gap-1">
          <button
            onClick={() => setTab('summary')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              tab === 'summary' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <BookOpen className="w-4 h-4" /> AI Lecture Summary
          </button>
          <button
            onClick={() => setTab('mcq')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              tab === 'mcq' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Formative MCQs
          </button>
        </div>
      </div>

      {tab === 'summary' ? <SummaryView /> : <MCQPractice />}
    </div>
  );
}
