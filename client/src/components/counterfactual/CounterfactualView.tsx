'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Lightbulb, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function CounterfactualView({ submissionId = 'demo-sub-1' }: { submissionId?: string }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>(`/student/counterfactual/${submissionId}`);
      setData(res.data);
    } catch (e) {
      // Local demo fallback
      setData({
        feedback_text: 'If you had included the inductive hypothesis step explicitly and derived the recurrence base cases, you would have earned full marks.',
        additional_marks_possible: 2.5,
        suggested_improvements: 'Include proof by induction base case n=1 and state induction step k -> k+1 clearly with invariants.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [submissionId]);

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
            AI Counterfactual Reasoning Engine
          </span>
          <h3 className="font-bold text-foreground text-sm mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> What-If Grade Optimization Analysis
          </h3>
        </div>
        {data && (
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full border border-emerald-500/20 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +{data.additional_marks_possible} Marks Possible
          </span>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Generating counterfactual condition analysis...
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
            <span className="font-bold text-primary flex items-center gap-1.5 text-xs">
              <Lightbulb className="w-4 h-4" /> Counterfactual Insight
            </span>
            <p className="text-foreground leading-relaxed font-medium">
              "{data?.feedback_text}"
            </p>
          </div>

          <div className="p-4 bg-muted/20 border border-border/50 rounded-xl space-y-2">
            <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block">
              Suggested Conceptual Improvements:
            </span>
            <p className="text-muted-foreground leading-relaxed">
              {data?.suggested_improvements}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
