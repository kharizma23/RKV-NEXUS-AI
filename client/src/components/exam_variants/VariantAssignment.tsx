'use client';

import React, { useState } from 'react';
import { Users, Shuffle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function VariantAssignment({ examId = 'default-exam' }: { examId?: string }) {
  const [studentIdsText, setStudentIdsText] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = studentIdsText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (ids.length === 0) return;
    setAssigning(true);
    setError(null);
    try {
      const res = await apiClient<any>(`/faculty/exams/${examId}/assign-variants`, {
        method: 'POST',
        body: JSON.stringify({ student_ids: ids }),
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to assign variants to student cohort.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-400" /> Random Variant Cohort Assigner
      </h3>
      <p className="text-xs text-slate-400">
        Input student UUIDs (one per line). The engine evenly balances variants to ensure neighboring desk scholars never receive identical question sequences.
      </p>

      {result && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Successfully mapped {result.assigned_count} scholars to randomized variants!</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleAssign} className="space-y-3">
        <textarea
          rows={4}
          value={studentIdsText}
          onChange={(e) => setStudentIdsText(e.target.value)}
          placeholder="Paste student UUIDs here (one per line)..."
          className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
          required
        />
        <button
          type="submit"
          disabled={assigning}
          className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shuffle className="w-3.5 h-3.5" />}
          {assigning ? 'Assigning...' : 'Execute Balanced Distribution'}
        </button>
      </form>
    </div>
  );
}
