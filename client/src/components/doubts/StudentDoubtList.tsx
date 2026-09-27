'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, BookOpen, Clock, ExternalLink, Sparkles, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { MicroLessonView } from './MicroLessonView';

interface MicroLesson {
  id: string;
  title: string;
  content: string;
  resource_url?: string;
  estimated_minutes: number;
}

interface StudentDoubt {
  id: string;
  concept: string;
  doubt_description: string;
  detected_at: string;
  resolved: boolean;
  micro_lessons: MicroLesson[];
}

export function StudentDoubtList() {
  const [doubts, setDoubts] = useState<StudentDoubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<MicroLesson | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchDoubts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<StudentDoubt[]>('/student/doubts');
      setDoubts(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve conceptual doubts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handleResolve = async (doubtId: string) => {
    setResolvingId(doubtId);
    setSuccessMsg(null);
    try {
      await apiClient(`/student/doubts/${doubtId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Concept resolved through micro-lesson practice.' }),
      });
      setSuccessMsg('Conceptual gap marked as resolved! Retention progress updated.');
      setDoubts(prev =>
        prev.map(d => (d.id === doubtId ? { ...d, resolved: true } : d))
      );
    } catch (err: any) {
      setError(err?.message || 'Could not resolve doubt.');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-card border border-border/70 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> AI Diagnostic Sentinel
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">AI Conceptual Doubt Detection</h1>
          <p className="text-xs text-muted-foreground">
            Automated analysis of assessment responses mapping conceptual misconceptions into high-impact micro-lessons.
          </p>
        </div>
        <button
          onClick={fetchDoubts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-foreground bg-card hover:bg-muted border border-border rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : 'text-primary'}`} />
          Refresh Doubts
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted/40 rounded-2xl animate-pulse border border-border/50" />
          ))}
        </div>
      ) : doubts.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
          <h3 className="text-lg font-bold text-foreground">No Conceptual Doubts Detected</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            Excellent work! Your recent assessment answers show robust conceptual alignment without persistent misconceptions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {doubts.map(doubt => (
            <div
              key={doubt.id}
              className={`p-6 rounded-2xl border transition-all duration-200 ${
                doubt.resolved
                  ? 'bg-card/60 border-border/60 opacity-80'
                  : 'bg-card border-border/80 shadow-sm'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      {doubt.concept}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        doubt.resolved
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {doubt.resolved ? 'Resolved' : 'Active Gap'}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Detected {new Date(doubt.detected_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-foreground text-sm leading-relaxed">{doubt.doubt_description}</p>
                </div>

                <div className="flex items-center gap-3">
                  {!doubt.resolved && (
                    <button
                      onClick={() => handleResolve(doubt.id)}
                      disabled={resolvingId === doubt.id}
                      className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {resolvingId === doubt.id ? 'Resolving...' : 'Mark Resolved'}
                    </button>
                  )}
                </div>
              </div>

              {/* Micro lessons section */}
              {doubt.micro_lessons && doubt.micro_lessons.length > 0 && (
                <div className="mt-5 pt-4 border-t border-border/60 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    Targeted Remediation Micro-Lessons
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doubt.micro_lessons.map(lesson => (
                      <div
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className="p-3.5 bg-muted/20 hover:bg-muted/40 border border-border/60 rounded-xl cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="space-y-1 pr-3">
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {lesson.title}
                          </h4>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.estimated_minutes} min lesson
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MicroLesson Modal */}
      {selectedLesson && (
        <MicroLessonView lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />
      )}
    </div>
  );
}
