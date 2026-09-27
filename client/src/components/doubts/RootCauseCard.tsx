'use client';

import React from 'react';
import { Lightbulb, AlertTriangle, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

interface RootCauseCardProps {
  concept: string;
  rootCause: string;
  suggestedAction: string;
  suggestedMicroLesson?: string;
  revisionMaterials?: string[];
  sampleWrongAnswers?: string[];
}

export function RootCauseCard({
  concept,
  rootCause,
  suggestedAction,
  suggestedMicroLesson,
  revisionMaterials = [],
  sampleWrongAnswers = [],
}: RootCauseCardProps) {
  return (
    <div className="space-y-4">
      {/* Root Cause Analysis Box */}
      <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-indigo-500" />
          <span>AI Root Cause Diagnostic</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed font-medium">
          {rootCause}
        </p>
      </div>

      {/* Suggested Action Intervention */}
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Recommended Pedagogical Intervention</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed font-medium">
          {suggestedAction}
        </p>
      </div>

      {/* Anonymized Sample Wrong Answers */}
      {sampleWrongAnswers && sampleWrongAnswers.length > 0 && (
        <div className="p-4 rounded-xl border bg-muted/20 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Sample Student Error Patterns (Anonymized)</span>
          </div>
          <div className="space-y-2">
            {sampleWrongAnswers.map((ans, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border bg-card text-xs text-foreground flex items-start gap-2">
                <span className="font-mono text-[11px] font-bold text-amber-500 shrink-0">#{idx + 1}</span>
                <p className="italic text-muted-foreground">{ans}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Revision Materials */}
      {revisionMaterials && revisionMaterials.length > 0 && (
        <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Curated Revision Materials & References</span>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {revisionMaterials.map((mat, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{mat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
