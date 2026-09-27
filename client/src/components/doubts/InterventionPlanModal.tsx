'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, CheckCircle2, BookOpen, RefreshCw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanPDFExport } from './PlanPDFExport';
import { apiClient } from '@/lib/api/client';

interface InterventionPlanModalProps {
  misconceptionId?: string;
  concept?: string;
  onClose: () => void;
}

export function InterventionPlanModal({
  misconceptionId,
  concept = 'ACID Isolation Levels & Phantom Reads',
  onClose,
}: InterventionPlanModalProps) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any>('/faculty/doubts/generate-intervention-plan', {
        method: 'POST',
        body: JSON.stringify({
          misconception_id: misconceptionId,
          concept: concept,
        }),
      });
      setPlan(data);
    } catch (err) {
      console.error('Failed to generate intervention plan', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [misconceptionId, concept]);

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-card border rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                AI Remedial Lecture Intervention Plan
              </h2>
              <p className="text-xs text-muted-foreground">
                Target: <strong className="text-foreground">{concept}</strong>
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <RefreshCw className="w-7 h-7 animate-spin text-indigo-500" />
              <div className="text-center">
                <p className="font-bold text-foreground">Synthesizing Pedagogical Strategy...</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Analyzing common wrong answer vectors and crafting active learning steps
                </p>
              </div>
            </div>
          ) : plan ? (
            <>
              {/* Overview Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border bg-card space-y-1">
                  <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Topic to Re-Teach
                  </span>
                  <p className="font-bold text-foreground line-clamp-1">{plan.topic_to_reteach}</p>
                </div>

                <div className="p-3.5 rounded-xl border bg-card space-y-1">
                  <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" /> Target Duration
                  </span>
                  <p className="font-bold text-emerald-500 font-mono">{plan.duration_minutes} Minutes</p>
                </div>

                <div className="p-3.5 rounded-xl border bg-card space-y-1">
                  <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Assessment Mode
                  </span>
                  <p className="font-bold text-foreground line-clamp-1">{plan.assessment_method}</p>
                </div>
              </div>

              {/* Step by Step Lecture Guide */}
              <div className="p-4 rounded-xl border bg-card space-y-2">
                <h3 className="font-black text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-500" /> Lecture Blueprint & Timeline
                </h3>
                <div className="whitespace-pre-wrap leading-relaxed text-foreground font-medium text-xs">
                  {plan.plan_text}
                </div>
              </div>

              {/* Example Problems */}
              {plan.example_problems && plan.example_problems.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="font-black text-xs uppercase tracking-wider text-muted-foreground">
                    Walkthrough Problem Sets (With Invariants)
                  </h3>
                  <div className="space-y-2">
                    {plan.example_problems.map((p: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border bg-muted/20 space-y-1.5">
                        <p className="font-bold text-foreground">Problem #{idx + 1}: {p.title}</p>
                        <p className="text-muted-foreground leading-relaxed">{p.scenario}</p>
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                          <strong>Solution Invariant:</strong> {p.solution_key}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Questions */}
              {plan.practice_questions && plan.practice_questions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-black text-xs uppercase tracking-wider text-muted-foreground">
                    Recommended Formative Exit Questions
                  </h3>
                  <div className="space-y-1.5">
                    {plan.practice_questions.map((q: string, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg border bg-card flex items-start gap-2">
                        <span className="font-mono text-indigo-500 font-bold shrink-0">{idx + 1}.</span>
                        <p className="text-foreground">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              Unable to generate intervention plan. Please retry.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchPlan}
            disabled={loading}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate Plan
          </Button>

          <div className="flex items-center gap-2">
            {plan && <PlanPDFExport planData={plan} />}
            <Button
              size="sm"
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8"
            >
              Done & Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
