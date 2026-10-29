'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';

interface DisagreementQueueProps {
  items: any[];
  selectedId: string | null;
  onSelect: (item: any) => void;
}

export function DisagreementQueue({ items, selectedId, onSelect }: DisagreementQueueProps) {
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
        No active model disagreements detected. All multi-evaluator scoring converges within acceptable bounds.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        return (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm font-semibold'
                : 'border-border/60 hover:bg-muted/30'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Submission: {item.submission_id?.slice(0, 8)}...</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Consensus: {item.consensus_score} pts • Disagreement: {item.disagreement ? 'Yes' : 'No'}
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        );
      })}
    </div>
  );
}
