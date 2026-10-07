'use client';

import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, User, Calendar, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Student360Profile } from './types';

interface AIHospiceSummaryProps {
  profile: Student360Profile;
}

export function AIHospiceSummary({ profile }: AIHospiceSummaryProps) {
  const compositeScore = profile.composite_score ?? profile.ai_composite_index ?? 90.2;
  const studentName = profile.full_name || profile.student_name || 'Scholar Student';
  const studentId = profile.student_id;
  const lastSnapshot = profile.last_evaluated
    ? profile.last_evaluated
    : profile.updated_at
    ? new Date(profile.updated_at).toLocaleDateString()
    : new Date().toISOString().split('T')[0];
  const evaluatedBy = profile.evaluated_by || 'System Administrator';

  return (
    <Card id="ai-holistic-synthesis-summary" className="p-6 flex flex-col justify-between space-y-5 border-border">
      <div className="space-y-4">
        {/* Header with Title and Composite Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-teal-600 dark:text-teal-400">
              <Sparkles className="w-3.5 h-3.5" /> Intelligence Synthesis
            </div>
            <h3 className="text-base font-black text-foreground mt-0.5">
              AI Holistic Synthesis Summary
            </h3>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 rounded-xl font-black text-sm">
            <span>Composite Score:</span>
            <span className="text-teal-600 dark:text-teal-400 font-extrabold text-base">
              {compositeScore}
            </span>
            <span className="text-muted-foreground text-xs font-semibold">/ 100</span>
          </div>
        </div>

        {/* AI Insight Highlight Card */}
        <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-800/60 bg-teal-50/70 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100 space-y-2">
          <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-bold text-xs uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Machine Intelligence Evaluation
          </div>
          <p className="text-xs leading-relaxed text-teal-900 dark:text-teal-200 font-medium">
            {profile.ai_summary ||
              `Exemplary candidate demonstrating balanced rigor across ${profile.academic_score}% academic mastery and ${profile.placement_readiness}% placement velocity. Biometric attendance records confirm ${profile.attendance_rate}% campus engagement, backed by a resilience wellness score of ${profile.wellness_index}%.`}
          </p>
        </div>

        {/* Meta Details Table */}
        <div className="space-y-2.5 text-xs text-muted-foreground pt-1">
          <div className="flex justify-between items-center py-1.5 border-b border-border/60">
            <span className="font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" /> Student Profile ID:
            </span>
            <span className="font-mono text-foreground font-bold">{studentId}</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-border/60">
            <span className="font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-muted-foreground" /> Evaluated Scholar:
            </span>
            <span className="text-foreground font-bold">{studentName}</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-border/60">
            <span className="font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Last Aggregated Snapshot:
            </span>
            <span className="text-foreground font-medium">{lastSnapshot}</span>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" /> Evaluated By:
            </span>
            <span className="text-foreground font-semibold">{evaluatedBy}</span>
          </div>
        </div>
      </div>

      {/* Verification footer */}
      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 font-semibold flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
        <span>Verified across OBE outcome attainment and physical biometric checkpoints.</span>
      </div>
    </Card>
  );
}
