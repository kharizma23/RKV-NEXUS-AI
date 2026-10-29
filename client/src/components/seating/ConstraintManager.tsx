'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { ShieldAlert, PlusCircle, CheckCircle2 } from 'lucide-react';

interface ConstraintManagerProps {
  examId: string;
  onAdded?: () => void;
}

export function ConstraintManager({ examId, onAdded }: ConstraintManagerProps) {
  const [constraintType, setConstraintType] = useState('SEPARATE_STUDENTS');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddConstraint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !examId) return;

    setLoading(true);
    setSuccess(false);
    try {
      await apiClient('/seating/constraints', {
        method: 'POST',
        body: JSON.stringify({
          exam_id: examId,
          constraint_type: constraintType,
          reason: reason.trim()
        })
      });
      setSuccess(true);
      setReason('');
      if (onAdded) onAdded();
    } catch (err: any) {
      alert(err?.message || 'Failed to add constraint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Anti-Collusion Seating Constraints</h3>
          <p className="text-xs text-muted-foreground">Define separation rules, cohort isolation, or special accessibility accommodations</p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Seating constraint registered into optimization solver!</span>
        </div>
      )}

      <form onSubmit={handleAddConstraint} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-foreground">Constraint Mode:</label>
          <select
            value={constraintType}
            onChange={(e) => setConstraintType(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground font-semibold"
          >
            <option value="SEPARATE_STUDENTS">Separate Specific Candidates</option>
            <option value="ALTERNATE_DEPT">Strict Interleaved Branches</option>
            <option value="ACCESSIBILITY_ROW1">Front Row Wheelchair / Medical Priority</option>
          </select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="font-bold text-foreground">Constraint Reason / Audit Note:</label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="e.g. Flagged for suspected collusion during Mid-Term 1"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
              required
            />
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center space-x-1.5 transition-colors shadow-sm shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ConstraintManager;
