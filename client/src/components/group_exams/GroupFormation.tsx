'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function GroupFormation({ onCreated }: { onCreated?: (groupExamId: string) => void }) {
  const [examId, setExamId] = useState('');
  const [groupSize, setGroupSize] = useState(3);
  const [loading, setLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId.trim()) {
      setError('Please provide an Exam ID.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/group-exams/create', {
        method: 'POST',
        body: JSON.stringify({
          exam_id: examId.trim(),
          group_size: Number(groupSize)
        })
      });
      setCreatedResult(res.data);
      if (onCreated) onCreated(res.data.id);
    } catch (err: any) {
      setError(err?.message || 'Failed to create group exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Form Collaborative Examination Cohort</h3>
          <p className="text-xs text-muted-foreground">
            Automatically group students into balanced squads with designated roles (Leader, Researcher, Presenter, Contributor).
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {createdResult ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-2">
          <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Collaborative Group Exam Created Successfully!
          </div>
          <p className="text-muted-foreground">
            Group Exam ID: <span className="font-mono text-foreground font-semibold">{createdResult.id}</span>
          </p>
          <p className="text-muted-foreground">
            Team Size: <span className="font-semibold text-foreground">{createdResult.group_size} students per squad</span>
          </p>
          <button
            onClick={() => {
              setCreatedResult(null);
              setExamId('');
            }}
            className="mt-2 px-3 py-1.5 bg-background border border-border rounded-lg font-semibold hover:bg-muted"
          >
            Create Another Cohort
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Target Examination UUID
              </label>
              <input
                type="text"
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Group Capacity (Students per Squad)
              </label>
              <select
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
              >
                <option value={2}>2 Candidates (Pair Problem-Solving)</option>
                <option value={3}>3 Candidates (Standard Squad: Leader, Researcher, Presenter)</option>
                <option value={4}>4 Candidates (Advanced Engineering Squad)</option>
                <option value={5}>5 Candidates (System Architecture Guild)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Auto-Generate Collaborative Groups & Allocate Roles
          </button>
        </form>
      )}
    </div>
  );
}
