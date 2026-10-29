'use client';

import React from 'react';
import { TARGET_COHORTS, getSemestersForBatch } from '@/lib/academic-matrix';
import { Users, GraduationCap, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  selectedBatch: string;
  onBatchChange: (batch: string) => void;
  selectedSemester: number | '';
  onSemesterChange: (sem: number | '') => void;
  disabled?: boolean;
}

export function FacultyExamTargetingConfigurator({
  selectedBatch,
  onBatchChange,
  selectedSemester,
  onSemesterChange,
  disabled = false,
}: Props) {
  const activeSemesters = getSemestersForBatch(selectedBatch);
  const selectedCohort = TARGET_COHORTS.find((c) => c.batch === selectedBatch);

  const handleBatchSelect = (batch: string) => {
    onBatchChange(batch);
    // Reset semester when batch changes so an invalid pairing is never retained
    onSemesterChange('');
  };

  return (
    <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-4">
      <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/40 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 tracking-tight">
              2026 Academic Anchor Matrix • Cohort Targeting
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Simultaneous multi-generation engineering cohort alignment
            </p>
          </div>
        </div>

        {selectedCohort && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            {selectedCohort.yearLabel}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Target Student Batch Dropdown */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Target Student Batch *
          </label>
          <select
            id="target-student-batch-select"
            value={selectedBatch}
            disabled={disabled}
            onChange={(e) => handleBatchSelect(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:opacity-50"
          >
            <option value="">-- Select Active Student Generation --</option>
            {TARGET_COHORTS.map((cohort) => (
              <option key={cohort.batch} value={cohort.batch}>
                {cohort.batchLabel}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Select 1st, 2nd, 3rd, or Final Year 4-year engineering framework.
          </p>
        </div>

        {/* Dependent Target Semester Dropdown */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Target Semester *
          </label>
          <select
            id="target-student-semester-select"
            value={selectedSemester}
            disabled={disabled || !selectedBatch}
            onChange={(e) => onSemesterChange(e.target.value ? Number(e.target.value) : '')}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!selectedBatch ? (
              <option value="">Choose Batch First to Unlock Semesters</option>
            ) : (
              <>
                <option value="">-- Select Semester from {selectedBatch} --</option>
                {activeSemesters.map((sem) => (
                  <option key={sem.number} value={sem.number}>
                    {sem.label}
                  </option>
                ))}
              </>
            )}
          </select>

          {!selectedBatch ? (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              Locked until Student Batch is selected.
            </p>
          ) : (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Showing strictly Semesters [{activeSemesters.map((s) => s.number).join(', ')}] for batch {selectedBatch}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
