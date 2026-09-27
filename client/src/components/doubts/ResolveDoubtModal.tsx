'use client';

import React, { useState } from 'react';
import { X, CheckSquare, CheckCircle2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';

interface ResolveDoubtModalProps {
  misconceptionId: string;
  concept: string;
  onClose: () => void;
  onResolved: () => void;
}

export function ResolveDoubtModal({
  misconceptionId,
  concept,
  onClose,
  onResolved,
}: ResolveDoubtModalProps) {
  const [notes, setNotes] = useState(
    'Addressed via dedicated remedial lecture and interactive whiteboard trace. Re-assessment passed with >85% class competency.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setSubmitting(true);
    try {
      await apiClient(`/faculty/doubts/${misconceptionId}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ resolution_notes: notes }),
      });
      setSuccess(true);
      setTimeout(() => {
        onResolved();
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(err?.message || 'Failed to mark misconception as resolved.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-card border rounded-2xl max-w-lg w-full shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">Mark Misconception as Resolved</h2>
              <p className="text-xs text-muted-foreground">Archive to resolved pedagogical audit history</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {success ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
              <p className="font-bold text-foreground">Misconception Marked as Resolved!</p>
              <p className="text-[11px] text-muted-foreground">
                Archived into resolution telemetry history.
              </p>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-xl border bg-muted/10 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Target Conceptual Bottleneck
                </span>
                <p className="font-bold text-foreground text-sm">{concept}</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  Resolution Notes & Evidence of Remediation
                </label>
                <textarea
                  rows={4}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe instructional intervention, re-test outcomes, or remedial lab sessions..."
                  className="w-full p-3 bg-background border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[11px] text-muted-foreground">
                This item will be removed from the active alerts dashboard and logged in your OBE accreditation continuous improvement loop.
              </div>

              <div className="pt-2 border-t flex items-center justify-end gap-2">
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
                  {submitting ? 'Resolving...' : 'Confirm & Mark Resolved'}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
