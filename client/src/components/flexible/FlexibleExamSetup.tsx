'use client';

import React, { useState } from 'react';
import { Clock, Calendar, Check, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { TimeWindowSelector } from './TimeWindowSelector';

export function FlexibleExamSetup({ onCreated }: { onCreated?: (flexibleExamId: string) => void }) {
  const [examId, setExamId] = useState('');
  const [windowStart, setWindowStart] = useState('2026-10-06T00:00');
  const [windowEnd, setWindowEnd] = useState('2026-10-08T23:59');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [loading, setLoading] = useState(false);
  const [createdData, setCreatedData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId.trim()) {
      setError('Please provide an Examination ID.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/flexible-exams/create', {
        method: 'POST',
        body: JSON.stringify({
          exam_id: examId.trim(),
          window_start: new Date(windowStart).toISOString(),
          window_end: new Date(windowEnd).toISOString(),
          duration_minutes: durationMinutes
        })
      });
      setCreatedData(res.data);
      if (onCreated) onCreated(res.data.id);
    } catch (err: any) {
      setError(err?.message || 'Failed to create flexible examination window');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Configure Flexible Examination Window</h3>
          <p className="text-xs text-muted-foreground">
            Allow students to take the exam at any time within a 48-hour window. Dynamic item difficulty adjusts to attempt timestamps.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {createdData ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-2">
          <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Flexible Window Configured Successfully!
          </div>
          <p className="text-muted-foreground">
            Flexible Exam ID: <span className="font-mono text-foreground font-semibold">{createdData.id}</span>
          </p>
          <p className="text-muted-foreground">
            Duration: <span className="font-semibold text-foreground">{createdData.duration_minutes} Minutes</span>
          </p>
          <button
            onClick={() => {
              setCreatedData(null);
              setExamId('');
            }}
            className="mt-2 px-3 py-1.5 bg-background border border-border rounded-lg font-semibold hover:bg-muted"
          >
            Configure Another Window
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Examination Target UUID
            </label>
            <input
              type="text"
              placeholder="e.g. 888e8400-e29b-41d4-a716-446655440000"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <TimeWindowSelector
            windowStart={windowStart}
            windowEnd={windowEnd}
            durationMinutes={durationMinutes}
            onStartChange={setWindowStart}
            onEndChange={setWindowEnd}
            onDurationChange={setDurationMinutes}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Publish 48-Hour Flexible Window
          </button>
        </form>
      )}
    </div>
  );
}
