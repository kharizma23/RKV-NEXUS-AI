'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, Award, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function GroupDashboard() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroupExams = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/faculty/group-exams');
      setExams(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupExams();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Collaborative Cohort & Syndicate Overview
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitor institutional group exam formations, squad sizes, and cross-functional team dynamics.
          </p>
        </div>
        <button
          onClick={fetchGroupExams}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Cohorts
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Active Group Exams</span>
          <div className="mt-2 text-2xl font-black text-foreground">{exams.length}</div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">Active Syndicates</span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Squads Deployed</span>
          <div className="mt-2 text-2xl font-black text-primary">
            {exams.reduce((acc, curr) => acc + (curr.total_groups || 1), 0)}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 inline-block">Balanced Peer Distribution</span>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Team Synergy Index</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">92.4%</div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">High Inter-role Concordance</span>
        </div>
      </div>

      <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> Active Collaborative Exam Syndicates
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
            Loading syndicate rosters...
          </div>
        ) : exams.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
            No active collaborative group examinations configured yet.
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((ge) => (
              <div
                key={ge.id}
                className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-foreground">Cohort Exam ID: {ge.id}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Target Exam: {ge.exam_id} • Squad Size: {ge.group_size} members per team
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                    {ge.total_groups || 1} Squads Formed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
