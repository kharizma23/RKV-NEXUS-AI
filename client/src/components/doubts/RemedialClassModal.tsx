'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AffectedStudent } from './AffectedStudentsList';
import { apiClient } from '@/lib/api/client';

interface RemedialClassModalProps {
  misconceptionId?: string;
  concept?: string;
  students?: AffectedStudent[];
  onClose: () => void;
  onScheduled?: () => void;
}

export function RemedialClassModal({
  misconceptionId,
  concept = 'Class Conceptual Remediation',
  students = [],
  onClose,
  onScheduled,
}: RemedialClassModalProps) {
  const [title, setTitle] = useState(`Remedial Clinic: Master ${concept}`);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('15:30');
  const [duration, setDuration] = useState('60');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    students.map((s) => s.id)
  );
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);

    const scheduledAt = `${date}T${time}:00`;

    try {
      await apiClient('/faculty/remedial/schedule', {
        method: 'POST',
        body: JSON.stringify({
          misconception_id: misconceptionId,
          title: title,
          scheduled_at: scheduledAt,
          duration: parseInt(duration),
          student_ids: selectedStudentIds,
          notes: `Targeting misconceptions in ${concept}. Mandatory attendance.`,
        }),
      });

      setSuccessMsg('Remedial class scheduled! Automated calendar events & student alerts dispatched.');
      setTimeout(() => {
        if (onScheduled) onScheduled();
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err?.message || 'Failed to schedule remedial session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-card border rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">Schedule Remedial Class</h2>
              <p className="text-xs text-muted-foreground">
                Targeting: <strong className="text-foreground">{concept}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {successMsg && (
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Session Title */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Session Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Date, Time, Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" /> Start Time
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" /> Duration (Mins)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
                <option value="90">90 Minutes</option>
              </select>
            </div>
          </div>

          {/* Enrolled Students Selector */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>Enrolled Affected Students ({selectedStudentIds.length} Selected)</span>
              </label>
              {students.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-emerald-500 hover:underline"
                >
                  {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {students.length === 0 ? (
              <p className="p-3 text-muted-foreground border rounded-xl bg-muted/10">
                All identified class students will be auto-enrolled and notified via portal.
              </p>
            ) : (
              <div className="border rounded-xl max-h-48 overflow-y-auto divide-y">
                {students.map((s) => {
                  const checked = selectedStudentIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleStudent(s.id)}
                      className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        checked ? 'bg-emerald-500/10' : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleStudent(s.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-foreground">{s.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {s.roll_number}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-rose-500">
                        Score: {s.score_on_concept}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 bg-muted/30 rounded-xl border text-[11px] text-muted-foreground space-y-1">
            <p className="font-bold text-foreground flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Automated Workflow:
            </p>
            <p>1. Syncs session with Faculty & Student Academic Calendars.</p>
            <p>2. Automatically pushes in-app notifications and email reminders to enrolled students.</p>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8"
            >
              {submitting ? 'Scheduling...' : 'Schedule & Notify Students'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
