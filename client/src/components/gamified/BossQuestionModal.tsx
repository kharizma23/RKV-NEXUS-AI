'use client';

import React, { useState } from 'react';
import { Skull, Zap, X, ShieldAlert, Award, Send, RefreshCw } from 'lucide-react';

interface BossQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitBoss: (solution: string) => Promise<void>;
}

export function BossQuestionModal({ isOpen, onClose, onSubmitBoss }: BossQuestionModalProps) {
  const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solution.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitBoss(solution.trim());
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border-2 border-rose-500/60 max-w-xl w-full rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-rose-500/20 text-rose-500 rounded-2xl animate-pulse">
              <Skull className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-2 py-0.5 rounded">
                  BOSS BATTLE
                </span>
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> 200 XP BONUS
                </span>
              </div>
              <h2 className="text-base font-black text-foreground mt-1">
                The Omega Proof: P vs NP Algorithmic Barrier
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs space-y-2 text-rose-900 dark:text-rose-200">
          <p className="font-semibold leading-relaxed">
            Construct an approximation algorithm with a performance guarantee strictly better than 2 for the Metric Traveling Salesperson Problem, or formally demonstrate why the Christofides-Serdyukov 1.5-approximation bound remained unbroken for over 4 decades.
          </p>
          <div className="text-[11px] text-muted-foreground font-mono">
            Restrictions: No external references. All lemmas must be substantiated from first principles.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Your Formal Boss Solution & Proof Formulation
            </label>
            <textarea
              rows={6}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Formulate your lemma, spanning tree weight bounds, Eulerian tour shortcuts, and approximation ratio..."
              className="w-full p-3.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-rose-500 outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground"
            >
              Retreat & Practice More
            </button>
            <button
              type="submit"
              disabled={submitting || !solution.trim()}
              className="px-5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Slay Boss & Claim Crown
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
