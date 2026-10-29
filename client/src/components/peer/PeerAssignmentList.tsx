'use client';

import React from 'react';
import { UserCheck, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

interface PeerAssignmentListProps {
  assignments: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PeerAssignmentList({ assignments, selectedId, onSelect }: PeerAssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
        No anonymous peer assessments assigned to you currently.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {assignments.map((item, index) => {
        const isSelected = selectedId === item.id;
        return (
          <div
            key={item.id || index}
            onClick={() => onSelect(item.id)}
            className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm font-semibold'
                : 'border-border/60 hover:bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-foreground block">
                  Anonymous Peer Review #{index + 1}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Task ID: {item.id ? item.id.slice(0, 8) : 'Pending'}...
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.is_completed ? (
                <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Evaluated ({item.marks} pts)
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Awaiting Review
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
