'use client';

import React from 'react';
import { Target, BookOpen, HelpCircle, Calendar, TrendingUp, Brain, Sparkles } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPT_ITEMS = [
  { text: "What is my weakest topic?", icon: Target, tag: "Diagnostic" },
  { text: "Teach me DBMS normalization", icon: BookOpen, tag: "Syllabus" },
  { text: "Give me 5 practice questions on AI", icon: HelpCircle, tag: "Exam Prep" },
  { text: "When is my next exam?", icon: Calendar, tag: "Schedule" },
  { text: "How can I improve CO3?", icon: TrendingUp, tag: "Outcome" },
  { text: "Explain Neural Networks with examples", icon: Brain, tag: "Concept" },
  { text: "What should I study today?", icon: Sparkles, tag: "Plan" },
];

export function SuggestedPrompts({ onSelectPrompt, disabled }: SuggestedPromptsProps) {
  return (
    <div className="w-full overflow-x-auto py-2 no-scrollbar">
      <div className="flex items-center gap-2 min-w-max px-1">
        {PROMPT_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.text)}
              disabled={disabled}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 border border-border/70 hover:border-indigo-400/60 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-indigo-500/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
            >
              <Icon className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-110 transition-transform" />
              <span>{item.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
