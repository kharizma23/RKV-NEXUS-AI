'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, HelpCircle, TrendingUp, AlertTriangle, RefreshCw, Sparkles,
  CheckCircle2, Calendar, BookOpen, GitCompare, Filter, Layers, CheckSquare,
  ArrowRight, Send, History, ShieldAlert, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { DoubtFilters, DoubtFilterState } from './DoubtFilters';
import { MisconceptionDetailModal } from './MisconceptionDetailModal';
import { InterventionPlanModal } from './InterventionPlanModal';
import { RemedialClassModal } from './RemedialClassModal';
import { RemedialScheduleView } from './RemedialScheduleView';
import { MicroLessonGenerator } from './MicroLessonGenerator';
import { DoubtTrendChart } from './DoubtTrendChart';
import { SectionComparison } from './SectionComparison';
import { ExportButton } from './ExportButton';
import { ResolveDoubtModal } from './ResolveDoubtModal';
import { NotifyStudentsModal } from './NotifyStudentsModal';

interface ClassDoubtItem {
  id: string;
  concept: string;
  frequency: number;
  severity: string;
  status: string;
  last_detected: string;
  subject_id?: string;
  subject_name?: string;
  subject_code?: string;
  department_name?: string;
  semester?: number;
  affected_students_count: number;
}

interface DoubtStats {
  dominant_bottlenecks: number;
  affected_student_instances: number;
  recommended_lecture_focus: string;
  resolved_historical_doubts: number;
  top_misconception_id?: string;
}

export function ClassDoubtDashboard() {
  const [activeTab, setActiveTab] = useState<'bottlenecks' | 'trends' | 'remedials' | 'resolved'>('bottlenecks');
  const [doubts, setDoubts] = useState<ClassDoubtItem[]>([]);
  const [resolvedDoubts, setResolvedDoubts] = useState<any[]>([]);
  const [stats, setStats] = useState<DoubtStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<DoubtFilterState>({
    subject: '',
    department: '',
    semester: '',
    dateRange: 'all',
    sortBy: 'frequency',
  });

  // Modals State
  const [selectedMisconceptionId, setSelectedMisconceptionId] = useState<string | null>(null);
  const [interventionModal, setInterventionModal] = useState<{ open: boolean; id?: string; concept?: string }>({ open: false });
  const [microLessonModal, setMicroLessonModal] = useState<{ open: boolean; id?: string; concept?: string }>({ open: false });
  const [remedialModal, setRemedialModal] = useState<{ open: boolean; id?: string; concept?: string; students?: any[] }>({ open: false });
  const [notifyModal, setNotifyModal] = useState<{ open: boolean; id?: string; concept?: string }>({ open: false });
  const [resolveModal, setResolveModal] = useState<{ open: boolean; id?: string; concept?: string }>({ open: false });

  const fetchDoubts = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.subject) queryParams.append('subject_id', filters.subject);
      if (filters.department) queryParams.append('department_id', filters.department);
      if (filters.semester) queryParams.append('semester_id', filters.semester);
      
      if (filters.dateRange === '7d') {
        const d = new Date(Date.now() - 7 * 86400000);
        queryParams.append('date_from', d.toISOString());
      } else if (filters.dateRange === '30d') {
        const d = new Date(Date.now() - 30 * 86400000);
        queryParams.append('date_from', d.toISOString());
      } else if (filters.dateRange === '90d') {
        const d = new Date(Date.now() - 90 * 86400000);
        queryParams.append('date_from', d.toISOString());
      }

      if (filters.sortBy) queryParams.append('sort', filters.sortBy);

      const [doubtsData, resolvedData, statsData] = await Promise.all([
        apiClient<ClassDoubtItem[]>(`/faculty/doubts?${queryParams.toString()}`),
        apiClient<any[]>('/faculty/doubts/resolved'),
        apiClient<DoubtStats>('/faculty/doubts/stats'),
      ]);

      setDoubts(doubtsData || []);
      setResolvedDoubts(resolvedData || []);
      setStats(statsData || null);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch class conceptual bottlenecks.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDoubts();
    setRefreshing(false);
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 3000);
  };

  useEffect(() => {
    fetchDoubts();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      subject: '',
      department: '',
      semester: '',
      dateRange: 'all',
      sortBy: 'frequency',
    });
  };

  const dominantCount = stats?.dominant_bottlenecks ?? doubts.length;
  const affectedCount = stats?.affected_student_instances ?? doubts.reduce((acc, curr) => acc + curr.frequency, 0);
  const recommendedFocus = stats?.recommended_lecture_focus ?? (doubts[0]?.concept || 'Dynamic Programming Memoization vs Tabulation Invariants');
  const resolvedCount = stats?.resolved_historical_doubts ?? resolvedDoubts.length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-500/20 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/30 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Faculty Class Diagnostics & Remediation Center</span>
            </span>
            {refreshSuccess && (
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Telemetry refreshed</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Class Conceptual Bottlenecks & Interventions
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Real-time telemetry clustering student misconceptions across ongoing quizzes, lab assessments, and midterms. Formulate targeted AI intervention plans and schedule live remedial clinics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <ExportButton />
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing || loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Dominant Bottlenecks */}
        <div
          onClick={() => setActiveTab('bottlenecks')}
          className="p-4 bg-card border rounded-2xl shadow-sm space-y-1 hover:border-amber-500/50 hover:bg-muted/20 transition-all cursor-pointer group"
          title="Click to view Active Bottlenecks"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Dominant Bottlenecks</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">{dominantCount}</div>
          <p className="text-[11px] text-amber-500 font-semibold flex items-center justify-between">
            <span>Active Misconceptions</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* CARD 2: Affected Student Instances */}
        <div
          onClick={() => {
            const targetId = stats?.top_misconception_id || doubts[0]?.id;
            if (targetId) setSelectedMisconceptionId(targetId);
          }}
          className="p-4 bg-card border rounded-2xl shadow-sm space-y-1 hover:border-rose-500/50 hover:bg-muted/20 transition-all cursor-pointer group"
          title="Click to inspect affected student instances"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Affected Student Instances</span>
            <Users className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-rose-500 font-mono">{affectedCount}</div>
          <p className="text-[11px] text-rose-400 font-semibold flex items-center justify-between">
            <span>Identified in recent tests</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* CARD 3: Recommended Lecture Focus */}
        <div
          onClick={() => {
            const targetId = stats?.top_misconception_id || doubts[0]?.id;
            setInterventionModal({ open: true, id: targetId, concept: recommendedFocus });
          }}
          className="p-4 bg-card border rounded-2xl shadow-sm space-y-1 hover:border-indigo-500/50 hover:bg-muted/20 transition-all cursor-pointer group"
          title="Click to generate intervention plan"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Recommended Lecture Focus</span>
            <Sparkles className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-sm font-bold text-indigo-400 line-clamp-1 pt-1 group-hover:underline">
            {recommendedFocus}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Highest aggregate frequency</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* CARD 4: Resolved Historical Doubts */}
        <div
          onClick={() => setActiveTab('resolved')}
          className="p-4 bg-card border rounded-2xl shadow-sm space-y-1 hover:border-emerald-500/50 hover:bg-muted/20 transition-all cursor-pointer group"
          title="Click to switch to Resolved Archive"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Resolved Historical Doubts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-500 font-mono">{resolvedCount}</div>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-between">
            <span>Archived in continuous improvement</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b flex gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('bottlenecks')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'bottlenecks'
              ? 'border-indigo-500 text-indigo-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Bottlenecks ({dominantCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'trends'
              ? 'border-indigo-500 text-indigo-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Velocity Trends & Section Benchmark</span>
        </button>

        <button
          onClick={() => setActiveTab('remedials')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'remedials'
              ? 'border-indigo-500 text-indigo-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Remedial Clinics Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'resolved'
              ? 'border-indigo-500 text-indigo-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Resolved Archive ({resolvedCount})</span>
        </button>
      </div>


      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Tab 1: Active Bottlenecks */}
      {activeTab === 'bottlenecks' && (
        <div className="space-y-4">
          <DoubtFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />

          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              <span>Analyzing class-wide assessment error vectors...</span>
            </div>
          ) : doubts.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border rounded-2xl bg-card">
              No conceptual bottlenecks found matching your filter criteria.
            </div>
          ) : (
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Identified Conceptual Bottlenecks (Click row to inspect root cause & affected students)
                </span>
                <span className="text-xs text-indigo-400 font-bold">
                  {doubts.length} Records
                </span>
              </div>

              <div className="divide-y text-xs">
                {doubts.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-muted/15 transition-all"
                  >
                    {/* Left: Concept Information */}
                    <div
                      onClick={() => setSelectedMisconceptionId(d.id)}
                      className="cursor-pointer space-y-1.5 flex-1"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          d.severity === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {d.severity} SEVERITY
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {d.subject_code || 'CS301'} • {d.subject_name || 'DBMS'}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Last detected: {new Date(d.last_detected).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-foreground hover:text-indigo-400 transition-colors flex items-center gap-2">
                        <span>{d.concept}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                      </h3>

                      <p className="text-[11px] text-muted-foreground">
                        Afflicts <strong className="text-foreground">{d.frequency} student assessment instances</strong> • Click to view anonymized wrong answers and AI root-cause
                      </p>
                    </div>

                    {/* Right: Quick Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => setInterventionModal({ open: true, id: d.id, concept: d.concept })}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 text-xs shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" /> Intervention Plan
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMicroLessonModal({ open: true, id: d.id, concept: d.concept })}
                        className="h-8 text-xs font-bold border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10"
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1" /> Micro-Lesson
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRemedialModal({ open: true, id: d.id, concept: d.concept })}
                        className="h-8 text-xs font-bold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1" /> Schedule Remedial
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNotifyModal({ open: true, id: d.id, concept: d.concept })}
                        className="h-8 text-xs font-bold border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" /> Notify Students
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setResolveModal({ open: true, id: d.id, concept: d.concept })}
                        className="h-8 text-xs font-bold border-slate-700 hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <CheckSquare className="w-3.5 h-3.5 mr-1" /> Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Velocity Trends & Section Benchmark */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <DoubtTrendChart />
          <SectionComparison />
        </div>
      )}

      {/* Tab 3: Remedials Schedule */}
      {activeTab === 'remedials' && (
        <RemedialScheduleView />
      )}

      {/* Tab 4: Resolved Archive */}
      {activeTab === 'resolved' && (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm space-y-4">
          <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Resolved Pedagogical Misconceptions Archive</span>
            </span>
            <span className="text-xs text-muted-foreground">{resolvedDoubts.length} Records</span>
          </div>

          <div className="divide-y text-xs p-4 space-y-3">
            {resolvedDoubts.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border bg-muted/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">{r.concept}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    RESOLVED
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Remediation Summary:</strong> {r.resolution_notes}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 border-t">
                  <span>Resolved By: <strong className="text-foreground">{r.resolved_by_name}</strong></span>
                  <span>Date: {r.resolved_at}</span>
                  <span>Historical Affliction: {r.frequency} Instances</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Drill-down per misconception */}
      {selectedMisconceptionId && (
        <MisconceptionDetailModal
          misconceptionId={selectedMisconceptionId}
          onClose={() => setSelectedMisconceptionId(null)}
          onOpenIntervention={(id, concept) => {
            setSelectedMisconceptionId(null);
            setInterventionModal({ open: true, id, concept });
          }}
          onOpenMicroLesson={(id, concept) => {
            setSelectedMisconceptionId(null);
            setMicroLessonModal({ open: true, id, concept });
          }}
          onOpenRemedial={(id, concept, students) => {
            setSelectedMisconceptionId(null);
            setRemedialModal({ open: true, id, concept, students });
          }}
          onOpenNotify={(id, concept) => {
            setSelectedMisconceptionId(null);
            setNotifyModal({ open: true, id, concept });
          }}
          onOpenResolve={(id, concept) => {
            setSelectedMisconceptionId(null);
            setResolveModal({ open: true, id, concept });
          }}
        />
      )}

      {/* MODAL 2: AI Intervention Plan */}
      {interventionModal.open && (
        <InterventionPlanModal
          misconceptionId={interventionModal.id}
          concept={interventionModal.concept}
          onClose={() => setInterventionModal({ open: false })}
        />
      )}

      {/* MODAL 3: 5-Minute Micro-Lesson Generator */}
      {microLessonModal.open && (
        <MicroLessonGenerator
          misconceptionId={microLessonModal.id || doubts[0]?.id}
          concept={microLessonModal.concept}
          onClose={() => setMicroLessonModal({ open: false })}
          onShareToStudents={(id) => {
            setNotifyModal({ open: true, id, concept: microLessonModal.concept });
          }}
        />
      )}

      {/* MODAL 4: Schedule Remedial Class */}
      {remedialModal.open && (
        <RemedialClassModal
          misconceptionId={remedialModal.id}
          concept={remedialModal.concept}
          students={remedialModal.students || []}
          onClose={() => setRemedialModal({ open: false })}
          onScheduled={() => {
            fetchDoubts();
            setActiveTab('remedials');
          }}
        />
      )}

      {/* MODAL 5: Notify Students */}
      {notifyModal.open && (
        <NotifyStudentsModal
          misconceptionId={notifyModal.id || doubts[0]?.id}
          concept={notifyModal.concept || 'Conceptual Review'}
          onClose={() => setNotifyModal({ open: false })}
        />
      )}

      {/* MODAL 6: Resolve Doubt */}
      {resolveModal.open && (
        <ResolveDoubtModal
          misconceptionId={resolveModal.id || doubts[0]?.id}
          concept={resolveModal.concept || 'Misconception'}
          onClose={() => setResolveModal({ open: false })}
          onResolved={() => {
            fetchDoubts();
          }}
        />
      )}
    </div>
  );
}
