'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Calendar, Clock, UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CounselorBookingProps {
  onBooked?: () => void;
  onScheduled?: () => void;
}

export function CounselorBooking({ onBooked, onScheduled }: CounselorBookingProps) {
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) return;

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/wellness/counselor/schedule', {
        method: 'POST',
        body: JSON.stringify({
          scheduled_at: new Date(scheduledAt).toISOString(),
          notes: notes.trim() || undefined
        })
      });
      setSuccess(res.data);
      if (onBooked) onBooked();
      if (onScheduled) onScheduled();
    } catch (err: any) {
      setError(err?.message || 'Failed to schedule counseling session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Schedule Confidential Counselor Session</h2>
          <p className="text-xs text-muted-foreground">
            Free 1-on-1 counseling with campus certified clinical psychologists and academic coaches
          </p>
        </div>
      </div>

      {success ? (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Counselor Appointment Confirmed!</span>
          </div>
          <p className="text-xs text-foreground font-medium">
            Session scheduled for: <span className="font-bold">{new Date(success.scheduled_at).toLocaleString()}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            A private calendar invite and Google Meet/In-Person room token has been sent to your student portal.
          </p>
          <button
            onClick={() => setSuccess(null)}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Book Another Time
          </button>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Preferred Date & Time:</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Discussion Topic / Reason for Consultation:</label>
            <textarea
              rows={3}
              placeholder="e.g. Exam anxiety management, coping with project deadlines, time management strategies..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
            />
          </div>

          <div className="p-3 bg-muted/40 rounded-xl flex items-center space-x-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Strict FERPA & HIPAA student confidentiality protocols applied. Faculty are not notified.</span>
          </div>

          <button
            type="submit"
            disabled={loading || !scheduledAt}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span>{loading ? 'Reserving Slot...' : 'Confirm Counselor Booking'}</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default CounselorBooking;
