'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Globe, Award, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { GlobalRankingChart } from './GlobalRankingChart';
import { UniversityComparison } from './UniversityComparison';
import { BestPracticesList } from './BestPracticesList';

export function GlobalBenchmarkingDashboard() {
  const [unis, setUnis] = useState<any[]>([]);
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [practices, setPractices] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, bRes, pRes] = await Promise.all([
        apiClient<any>('/global/universities'),
        apiClient<any>('/admin/global-benchmarking'),
        apiClient<any>('/global/best-practices')
      ]);
      setUnis(uRes.data || []);
      setBenchmarks(bRes.data);
      setPractices(pRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const res = await apiClient<any>('/admin/global-benchmarking/generate-report', {
        method: 'POST'
      });
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">Global University Benchmarking Hub</h1>
          <p className="text-xs text-muted-foreground">
            International OBE standards comparison, gap telemetry, and strategic accreditation roadmap
          </p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-2 shadow-sm"
        >
          {generating ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{generating ? 'Analyzing with Gemini 3.6 Flash...' : 'Generate AI Executive Roadmap'}</span>
        </button>
      </div>

      {report && (
        <div className="p-6 bg-card border border-indigo-500/40 rounded-2xl shadow-md space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
              <FileText className="w-4 h-4" />
              <span>AI Strategic Roadmap: {report.global_ranking_target}</span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Report ID: {report.report_id}</span>
          </div>
          <div className="text-xs text-foreground whitespace-pre-line leading-relaxed font-medium bg-muted/30 p-4 rounded-xl border">
            {report.executive_summary}
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
          Aggregating international university metrics...
        </div>
      ) : (
        <div className="space-y-6">
          <GlobalRankingChart universities={unis} />
          {benchmarks?.metrics && (
            <UniversityComparison metrics={benchmarks.metrics} targetUniversity={benchmarks.target_university} />
          )}
          <BestPracticesList practices={practices} />
        </div>
      )}
    </div>
  );
}

export default GlobalBenchmarkingDashboard;
