'use client';

import React from 'react';
import { Bell, CheckCircle2, Clock, Calendar, Sparkles } from 'lucide-react';

interface Reminder {
  id: string;
  reminder_type: string;
  acknowledged: boolean;
}

interface RevisionSchedule {
  id: string;
  topic: string;
  revision_date: string;
  status: string;
  completed_at?: string;
  reminders?: Reminder[];
}

interface RevisionReminderProps {
  schedule: RevisionSchedule;
  onComplete: (id: string) => void;
  completing: boolean;
}

export function RevisionReminder({ schedule, onComplete, completing }: RevisionReminderProps) {
  const isDone = schedule.status === 'COMPLETED';
  const revDate = new Date(schedule.revision_date);

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 ${
        isDone
          ? 'bg-slate-900/40 border-slate-800 opacity-75'
          : 'bg-slate-900/80 border-cyan-500/30 hover:border-cyan-500/50 shadow-lg'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isDone
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {isDone ? 'Completed' : 'Revision Due'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Scheduled: {revDate.toLocaleDateString()}
            </span>
          </div>

          <h3 className="text-base font-semibold text-white tracking-tight">{schedule.topic}</h3>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Ebbinghaus Optimal Retention Interval
            </span>
            {schedule.reminders && schedule.reminders.length > 0 && (
              <span className="flex items-center gap-1 text-cyan-300">
                <Bell className="w-3.5 h-3.5" />
                {schedule.reminders.length} Active Reminder(s)
              </span>
            )}
          </div>
        </div>

        {!isDone && (
          <button
            onClick={() => onComplete(schedule.id)}
            disabled={completing}
            className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition shadow-md shadow-cyan-600/20 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {completing ? 'Completing...' : 'Mark Done'}
          </button>
        )}
      </div>
    </div>
  );
}
