'use client';

import React, { useState } from 'react';
import { Users, Search, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface AffectedStudent {
  id: string;
  name: string;
  roll_number: string;
  department: string;
  score_on_concept: string;
  sample_wrong_answer: string;
  risk_tier?: 'CRITICAL' | 'AT_RISK' | 'MODERATE';
}

interface AffectedStudentsListProps {
  students: AffectedStudent[];
  selectedStudentIds?: string[];
  onToggleSelect?: (id: string) => void;
  selectable?: boolean;
}

export function AffectedStudentsList({
  students,
  selectedStudentIds = [],
  onToggleSelect,
  selectable = false,
}: AffectedStudentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Users className="w-4 h-4 text-indigo-500" />
          <span>Affected Students ({students.length} instances)</span>
        </div>

        <div className="relative w-48">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden divide-y text-xs">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-xs">
            No matching students found.
          </div>
        ) : (
          filtered.map((s) => {
            const isSelected = selectedStudentIds.includes(s.id);
            return (
              <div
                key={s.id}
                onClick={() => selectable && onToggleSelect && onToggleSelect(s.id)}
                className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                  selectable ? 'cursor-pointer hover:bg-muted/40' : ''
                } ${isSelected ? 'bg-indigo-500/10' : 'bg-card'}`}
              >
                <div className="flex items-center gap-3">
                  {selectable && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect && onToggleSelect(s.id)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{s.name}</span>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {s.roll_number}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {s.department}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 italic">
                      Observed: "{s.sample_wrong_answer}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg border ${
                      s.risk_tier === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        : s.risk_tier === 'AT_RISK'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}
                  >
                    Score: {s.score_on_concept}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
