'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, ArrowRight, Clock, HelpCircle } from 'lucide-react';

interface QuickQuizItem {
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

interface MicroLessonPreviewProps {
  lesson: {
    title: string;
    concept_explanation: string;
    common_mistakes?: string;
    correct_approach?: string;
    duration?: number;
    quick_quiz?: QuickQuizItem[];
  };
}

export function MicroLessonPreview({ lesson }: MicroLessonPreviewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl border bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> 5-Minute Student Micro-Lesson Booster
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-muted-foreground">
            <Clock className="w-3 h-3 text-indigo-400" /> {lesson.duration || 5} mins
          </span>
        </div>
        <h3 className="font-extrabold text-sm text-foreground">{lesson.title}</h3>
      </div>

      {/* Concept Explanation */}
      <div className="p-4 rounded-xl border bg-card space-y-2">
        <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-500" /> Concept Core
        </h4>
        <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground font-medium">
          {lesson.concept_explanation}
        </div>
      </div>

      {/* Common Mistakes vs Correct Approach Grid */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
          <h4 className="font-bold text-xs text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Common Mistakes
          </h4>
          <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {lesson.common_mistakes || 'Overlooking subtle boundary invariants.'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
          <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Correct Approach
          </h4>
          <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {lesson.correct_approach || 'Verify serialization graphs step-by-step.'}
          </div>
        </div>
      </div>

      {/* Quick Quiz */}
      {lesson.quick_quiz && lesson.quick_quiz.length > 0 && (
        <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-500" /> Embedded Interactive Check ({lesson.quick_quiz.length} Questions)
            </h4>
            <button
              onClick={() => setShowResults(!showResults)}
              className="text-[11px] font-bold text-indigo-500 hover:underline"
            >
              {showResults ? 'Hide Solutions' : 'Reveal Answer Keys'}
            </button>
          </div>

          <div className="space-y-3">
            {lesson.quick_quiz.map((q, qIdx) => (
              <div key={qIdx} className="p-3.5 rounded-xl border bg-card space-y-2">
                <p className="font-bold text-foreground">
                  Q{qIdx + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oIdx) => {
                    const isChosen = selectedAnswers[qIdx] === oIdx;
                    const isCorrect = q.correct_option_index === oIdx;
                    let style = 'border hover:border-indigo-500/40 bg-background';
                    if (isChosen) style = 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold';
                    if (showResults && isCorrect) style = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold';

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelect(qIdx, oIdx)}
                        className={`w-full p-2.5 rounded-lg text-left transition-colors flex items-center justify-between text-xs ${style}`}
                      >
                        <span>{opt}</span>
                        {showResults && isCorrect && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {showResults && (
                  <p className="text-[11px] text-muted-foreground pt-1 border-t italic">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
