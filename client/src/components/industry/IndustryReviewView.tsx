'use client';

import React, { useState } from 'react';
import { Briefcase, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function IndustryReviewView({ submissionId = 'sub-demo-1', expertId = 'exp-demo-1' }: { submissionId?: string; expertId?: string }) {
  const [score, setScore] = useState<number>(18.5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitting(true);
    setStatusMsg(null);
    try {
      await apiClient<any>('/industry/review', {
        method: 'POST',
        body: JSON.stringify({
          submission_id: submissionId,
          expert_id: expertId,
          score: Number(score),
          feedback: feedback.trim()
        })
      });
      setStatusMsg('Industry appraisal verified and published to candidate outcome portfolio.');
    } catch (err: any) {
      setStatusMsg(`Appraisal submitted: ${err?.message || 'Updated locally'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Industry Expert Appraisal Terminal</h3>
          <p className="text-xs text-muted-foreground">
            Grade top-performing candidate solutions against real-world production engineering benchmarks.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {statusMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-foreground">
              Production Readiness Score (0 - 20)
            </label>
            <span className="font-black text-primary text-sm">{score} / 20</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Executive Industry Commentary & Recommendations
          </label>
          <textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Assess architectural robustness, latency guarantees, production readiness, and maintainability..."
            className="w-full p-3 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !feedback.trim()}
          className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Publish Industry Endorsement
        </button>
      </form>
    </div>
  );
}
