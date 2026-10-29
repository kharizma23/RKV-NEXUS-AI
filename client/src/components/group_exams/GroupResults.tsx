'use client';

import React, { useState, useEffect } from 'react';
import { Award, Users, CheckCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function GroupResults({ groupExamId = 'default-group-exam' }: { groupExamId?: string }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>(`/group-exams/${groupExamId}/results`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [groupExamId]);

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Collaborative Squad Grading & Peer Contribution
          </h3>
          <p className="text-xs text-muted-foreground">
            Combined squad score weighted by role-based contributions and peer cross-validation.
          </p>
        </div>
        <button
          onClick={fetchResults}
          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Calculating squad and individual performance marks...
        </div>
      ) : !data?.groups || data.groups.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
          No squad evaluation scores published yet.
        </div>
      ) : (
        <div className="space-y-4">
          {data.groups.map((group: any) => (
            <div key={group.group_id} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-foreground text-xs">{group.group_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Squad Composite Score:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                    {group.group_score}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-border/40">
                {group.members?.map((m: any, i: number) => (
                  <div key={i} className="p-2.5 bg-background rounded-lg border border-border/50 text-xs">
                    <div className="font-semibold text-foreground">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground capitalize">{m.role}</div>
                    <div className="text-[11px] text-emerald-500 font-bold mt-1">
                      Individual Grade: {(group.group_score + (m.role === 'leader' ? 2 : 1)).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
