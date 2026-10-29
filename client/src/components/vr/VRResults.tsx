'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Award, Clock, CheckCircle2, ShieldAlert, BarChart2 } from 'lucide-react';

export function VRResults() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient<any>('/vr/attempt/results');
        setResults(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">VR Practical Performance History</h3>
        <span className="text-xs text-muted-foreground font-mono">{results.length} Attempts Evaluated</span>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground animate-pulse">Loading VR evaluation results...</div>
      ) : results.length === 0 ? (
        <div className="text-xs text-muted-foreground">No completed virtual lab attempts recorded yet.</div>
      ) : (
        <div className="divide-y text-xs">
          {results.map((r) => (
            <div key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-foreground">{r.exam_title}</span>
                <div className="flex items-center space-x-2 text-[11px] text-muted-foreground mt-0.5">
                  <span className="font-mono">{r.experiment_type}</span>
                  <span>•</span>
                  <span>Completed: {r.completed_at ? new Date(r.completed_at).toLocaleDateString() : 'In Progress'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-black text-indigo-600">{r.score} / 100</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  r.score >= 50 ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'
                }`}>
                  {r.score >= 50 ? 'PASSED' : 'RETRY NEEDED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VRResults;
