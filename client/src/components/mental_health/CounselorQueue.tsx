'use client';

import React, { useState } from 'react';
import { X, Calendar, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface CounselorQueueProps {
  alert: any;
  onClose: () => void;
  onScheduled: () => void;
}

export function CounselorQueue({ alert, onClose, onScheduled }: CounselorQueueProps) {
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient('/counselor/intervention', {
        method: 'POST',
        body: JSON.stringify({
          alert_id: alert.id,
          notes: notes.trim(),
          scheduled_at: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
        }),
      });
      onScheduled();
    } catch (err: any) {
      setError(err?.message || 'Failed to record intervention.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" /> Counselor Care Intervention
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300">
          Target Scholar: <span className="font-semibold text-white">{alert.student_name}</span> ({alert.alert_type})
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Appointment Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Intervention Notes & Workload Adjustments</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Prescribed 1-on-1 counseling check-in and 48hr deadline decompression buffer..."
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
              {submitting ? 'Recording...' : 'Confirm Intervention'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
