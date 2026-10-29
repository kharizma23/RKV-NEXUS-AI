'use client';

import React from 'react';
import { AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

interface FlaggedQuestionsProps {
  flags: any[];
  onReplaceClick?: (questionId: string) => void;
}

export function FlaggedQuestions({ flags, onReplaceClick }: FlaggedQuestionsProps) {
  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Psychometric Anomaly Flags</h3>
          <p className="text-xs text-muted-foreground">Items with negative discrimination index or excessive difficulty variance</p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
          {flags.length} Flagged
        </span>
      </div>

      {flags.length === 0 ? (
        <div className="p-6 text-center text-xs text-muted-foreground border rounded-xl bg-muted/20">
          No anomalous question items detected. The active question bank meets item response theory standards.
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((f) => (
            <div key={f.id} className="p-4 bg-muted/40 rounded-xl border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-500/20 inline-block w-fit">
                  {f.flag_type?.replace(/_/g, ' ')}
                </span>
                <button
                  onClick={() => onReplaceClick && onReplaceClick(f.question_id)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Regenerate & Replace</span>
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-foreground">&quot;{f.question_text}&quot;</p>
                <p className="text-[11px] text-muted-foreground mt-1">{f.reason}</p>
              </div>

              <div className="p-2.5 bg-background rounded-lg border text-[11px] text-foreground flex items-center space-x-2">
                <span className="font-bold text-indigo-500">Action:</span>
                <span>{f.suggested_action}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
