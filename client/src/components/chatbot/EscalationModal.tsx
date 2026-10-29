'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Clock, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultQuestion?: string;
  onSuccess?: (ticketId: string) => void;
}

export function EscalationModal({ isOpen, onClose, defaultQuestion = '', onSuccess }: EscalationModalProps) {
  const [question, setQuestion] = useState(defaultQuestion);
  const [category, setCategory] = useState('Conceptual Doubt');
  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/student/ai-tutor/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `[${category}] ${question.trim()}` })
      });

      if (res.ok) {
        const json = await res.json();
        const id = json.data?.id || 'ESC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        setSubmittedTicket(id);
        if (onSuccess) onSuccess(id);
      } else {
        setError('Failed to submit escalation. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error submitting question.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmittedTicket(null);
    setQuestion('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-foreground">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedTicket ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Escalated to Faculty</h3>
              <p className="text-sm text-slate-400 mt-1">
                Your question has been forwarded to the department faculty queue.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 max-w-xs mx-auto text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Ticket Ref:</span>
                <span className="font-mono text-indigo-400 font-semibold">{submittedTicket.slice(0, 10)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Response SLA:</span>
                <span className="text-amber-400 font-medium">Within 24 Hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-medium">Faculty Assigned</span>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 mt-2"
            >
              Done
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Escalate Doubt to Faculty</h3>
                <p className="text-xs text-slate-400">Directly consult your course instructors when needed</p>
              </div>
            </div>

            <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
              <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <span>
                Faculty will review your academic doubt along with your recent test evaluations and respond within <strong>24 hours</strong>.
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Doubt Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="Conceptual Doubt">Conceptual Syllabus Doubt</option>
                  <option value="Exam Rubric Discrepancy">Mid-Term Rubric Clarification</option>
                  <option value="Course Outcome Gap">CO3 / CO4 Improvement Guidance</option>
                  <option value="Lab / Practical Doubt">Practical Code & Simulation Help</option>
                  <option value="Other Academic Query">Other Academic Query</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Question / Clarification Request</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={4}
                  placeholder="Explain what specific part you need human faculty assistance with..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting...' : 'Send to Faculty'}</span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
