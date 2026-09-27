'use client';

import React from 'react';
import { X, BookOpen, Clock, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

interface MicroLesson {
  id: string;
  title: string;
  content: string;
  resource_url?: string;
  estimated_minutes: number;
}

interface MicroLessonViewProps {
  lesson: MicroLesson;
  onClose: () => void;
}

export function MicroLessonView({ lesson, onClose }: MicroLessonViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 flex items-center gap-1 w-fit">
              <Sparkles className="w-3 h-3 text-indigo-500" /> AI Micro-Lesson
            </span>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{lesson.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/60 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            Estimated Duration: {lesson.estimated_minutes} mins
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/60 rounded-lg">
            <BookOpen className="w-3.5 h-3.5 text-purple-500" />
            Concept Reinforcement
          </span>
        </div>

        <div className="p-4 bg-muted/30 rounded-xl border border-border/60 text-foreground text-sm leading-relaxed whitespace-pre-wrap">
          {lesson.content}
        </div>

        {lesson.resource_url && (
          <div className="pt-2">
            <a
              href={lesson.resource_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Open supplementary interactive simulation ({lesson.resource_url})
            </a>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition shadow-sm active:scale-95"
          >
            Got it, Complete Lesson
          </button>
        </div>
      </div>
    </div>
  );
}
