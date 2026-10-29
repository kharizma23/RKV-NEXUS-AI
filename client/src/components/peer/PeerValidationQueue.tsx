'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, CheckCircle, RefreshCw, Sparkles, Scale } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function PeerValidationQueue() {
  const [outliers, setOutliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOutliers = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/faculty/peer/validate');
      setOutliers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutliers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-500" />
            Peer Assessment AI Validation & Outlier Queue
          </h1>
          <p className="text-xs text-muted-foreground">
            Faculty review of peer grades deviating significantly from the AI benchmark baseline (|AI Score - Peer Score| &gt; 3.0).
          </p>
        </div>
        <button
          onClick={fetchOutliers}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Outliers
        </button>
      </div>

      <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Flagged Discrepant Evaluations ({outliers.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
            Analyzing peer-AI concordance variance...
          </div>
        ) : outliers.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
            No discrepant peer outliers detected. All peer evaluations align tightly with AI benchmarks.
          </div>
        ) : (
          <div className="space-y-3">
            {outliers.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Assessment: {item.assessment_id?.slice(0, 12)}...</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold text-[10px]">
                    OUTLIER DETECTED
                  </span>
                </div>
                <div className="flex gap-4 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Peer Score:</span>{' '}
                    <span className="font-bold text-foreground">{item.peer_marks} / 20</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">AI Benchmark:</span>{' '}
                    <span className="font-bold text-primary">{item.ai_score} / 20</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Variance:</span>{' '}
                    <span className="font-bold text-rose-500">{Math.abs(item.peer_marks - item.ai_score).toFixed(1)} pts</span>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{item.feedback}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
