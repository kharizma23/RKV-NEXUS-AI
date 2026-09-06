'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Edit3, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function CounterfactualReview() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/faculty/counterfactual/review');
      setFeedbacks(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Counterfactual Explanation Verification Queue
          </h1>
          <p className="text-xs text-muted-foreground">
            Review and refine AI-generated conditional feedback ("If candidate wrote X, marks would increase by Y").
          </p>
        </div>
        <button
          onClick={fetchFeedbacks}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Reviews
        </button>
      </div>

      <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
          Generated Counterfactual Feedbacks ({feedbacks.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
            Loading counterfactual explanations...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
            No counterfactual feedbacks currently flagged for faculty revision.
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Submission: {item.submission_id?.slice(0, 12)}...</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                    +{item.additional_marks_possible} Marks Possible
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">"{item.feedback_text}"</p>
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-semibold">Suggested Improvement:</span> {item.suggested_improvements}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
