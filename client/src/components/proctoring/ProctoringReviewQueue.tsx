'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, ExternalLink, RefreshCw, AlertTriangle, Eye, User, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { RiskScoreBadge } from './RiskScoreBadge';

export function ProctoringReviewQueue() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchFlaggedSessions = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/faculty/proctoring/flagged');
      setSessions(res.data || []);
      if (res.data?.length > 0 && !selectedSession) {
        loadSessionDetails(res.data[0].session_id);
      }
    } catch (err) {
      console.error('Failed to load flagged sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (sessionId: string) => {
    try {
      const res = await apiClient<any>(`/proctoring/session/${sessionId}`);
      setSelectedSession(res.data);
    } catch (err) {
      console.error('Failed to load session details', err);
    }
  };

  const resolveFlag = async (flagId: string) => {
    setResolvingId(flagId);
    try {
      await apiClient<any>(`/faculty/proctoring/${flagId}/resolve`, {
        method: 'PUT'
      });
      setToastMsg('Flag resolved successfully.');
      setTimeout(() => setToastMsg(null), 3000);
      fetchFlaggedSessions();
      if (selectedSession?.session?.id) {
        loadSessionDetails(selectedSession.session.id);
      }
    } catch (err: any) {
      setToastMsg(`Error: ${err?.message || 'Failed to resolve'}`);
    } finally {
      setResolvingId(null);
    }
  };

  useEffect(() => {
    fetchFlaggedSessions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            AI Proctoring Anomaly Review Queue
          </h1>
          <p className="text-xs text-muted-foreground">
            Review suspicious telemetry, phone detection, and multiple faces flagged during automated examination proctoring.
          </p>
        </div>
        <button
          onClick={fetchFlaggedSessions}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Flagged Queue
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {toastMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Flagged Sessions List */}
        <div className="lg:col-span-5 bg-card border border-border/70 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Suspicious Candidates ({sessions.length})</span>
            <span className="text-[10px] text-rose-500 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full">
              Risk &gt; 30%
            </span>
          </h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
              Scanning proctoring logs...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No flagged sessions currently require faculty review.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {sessions.map((sess) => {
                const isSelected = selectedSession?.session?.id === sess.session_id;
                return (
                  <div
                    key={sess.session_id}
                    onClick={() => loadSessionDetails(sess.session_id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/60 hover:border-border hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-foreground truncate">{sess.student_name}</span>
                      <RiskScoreBadge score={sess.risk_score} size="sm" />
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>{sess.student_email}</span>
                      <span className="text-rose-500 font-semibold">
                        {sess.unresolved_flags} active flag{sess.unresolved_flags !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Session Evidence & Resolution */}
        <div className="lg:col-span-7 bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-5">
          {!selectedSession ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              Select a candidate from the queue to inspect proctoring evidence and resolve flags.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
                <div>
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Session ID: {selectedSession.session.id.slice(0, 13)}...
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Started at: {new Date(selectedSession.session.started_at).toLocaleString()}
                  </p>
                </div>
                <RiskScoreBadge score={selectedSession.session.risk_score} size="lg" />
              </div>

              {/* Flags requiring resolution */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Active Behavioral Flags
                </h4>
                {selectedSession.flags.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No unresolved behavioral flags.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedSession.flags.map((flag: any) => (
                      <div
                        key={flag.id}
                        className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            {flag.flag_type}
                          </div>
                          <p className="text-muted-foreground mt-1 text-[11px]">{flag.description}</p>
                        </div>
                        {flag.resolved ? (
                          <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Resolved
                          </span>
                        ) : (
                          <button
                            onClick={() => resolveFlag(flag.id)}
                            disabled={resolvingId === flag.id}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px] shadow-sm transition disabled:opacity-50"
                          >
                            {resolvingId === flag.id ? 'Resolving...' : 'Dismiss & Mark Clean'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Event Timeline with Evidence Snapshot */}
              <div className="space-y-3 border-t border-border/40 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Captured Event Timeline ({selectedSession.events.length})
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {selectedSession.events.map((evt: any) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-lg border border-border/40 bg-background flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            evt.severity === 'CRITICAL'
                              ? 'bg-rose-600'
                              : evt.severity === 'HIGH'
                              ? 'bg-amber-500'
                              : 'bg-cyan-500'
                          }`}
                        ></span>
                        <span className="font-medium text-foreground">{evt.event_type}</span>
                        <span className="text-[10px] text-muted-foreground">({evt.severity})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                        {evt.evidence_url && (
                          <a
                            href={evt.evidence_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            Snapshot <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
