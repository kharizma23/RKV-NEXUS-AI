'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Award, Brain, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export function COCareerMapping() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient<any>('/admin/alumni/co-mapping');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Computing CO-career correlation coefficients...</div>;
  if (!data) return null;

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">{data.analysis_title}</h3>
          <p className="text-xs text-muted-foreground">{data.correlation_summary}</p>
        </div>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          OBE Accreditation Feedback Loop
        </span>
      </div>

      <div className="space-y-4">
        {data.co_impact_rankings?.map((co: any, idx: number) => (
          <div key={idx} className="p-4 bg-muted/40 rounded-xl border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  {co.co_code}
                </span>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{co.title}</h4>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    Relevance to Industry: {co.industry_relevance_pct}%
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                  co.importance_rating === 'CRITICAL' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                }`}>
                  {co.importance_rating}
                </span>
                <span className="font-mono text-emerald-600 font-bold text-xs">
                  Avg: {co.avg_package_correlation_lpa} LPA
                </span>
              </div>
            </div>

            <div className="p-3 bg-background rounded-lg border text-xs text-muted-foreground flex items-start space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">Continuous Quality Improvement (CQI) Action:</span>
                <p className="mt-0.5">{co.curriculum_action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default COCareerMapping;
