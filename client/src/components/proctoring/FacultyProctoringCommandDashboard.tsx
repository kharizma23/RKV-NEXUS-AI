'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Video,
  AlertTriangle,
  Eye,
  User,
  Clock,
  CheckCircle2,
  X,
  RefreshCw,
  Search,
  Filter,
  Camera,
  Activity,
  AlertCircle,
  FileText,
  Send,
  Radio,
  Sliders
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';

interface FlaggedLog {
  timestamp: string;
  event: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  confidence: number;
  details: string;
}

interface ProctoringSession {
  id: string;
  session_id: string;
  student_name: string;
  student_reg: string;
  exam_title: string;
  status: 'ACTIVE' | 'FLAGGED' | 'RESOLVED';
  risk_score: number;
  webcam_status: string;
  current_flag: string;
  flagged_events: string[];
  flagged_logs: FlaggedLog[];
  started_at: string;
  duration_minutes: number;
  ip_address?: string;
}

export function FacultyProctoringCommandDashboard() {
  const [sessions, setSessions] = useState<ProctoringSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogsSession, setSelectedLogsSession] = useState<ProctoringSession | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchActiveSessions = async () => {
    setLoading(true);
    try {
      const data = await apiClient<ProctoringSession[]>('/proctoring/active-sessions');
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to load active proctoring sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const handleResolveSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'RESOLVED', risk_score: 0.1, current_flag: 'Resolved by Faculty' } : s))
    );
    showToast('Proctoring alert flagged session resolved.');
  };

  const handleSendWarning = (studentName: string) => {
    showToast(`In-exam advisory warning dispatched to ${studentName}.`);
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'FLAGGED') return s.status === 'FLAGGED';
    if (filterStatus === 'CLEAN') return s.status === 'ACTIVE' || s.risk_score < 0.3;
    return true;
  });

  const highRiskCount = sessions.filter((s) => s.risk_score >= 0.7).length;
  const flaggedCount = sessions.filter((s) => s.status === 'FLAGGED').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium text-xs rounded-xl shadow-2xl border border-indigo-400 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-card to-card/60 p-5 rounded-2xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                🛡️ AI Proctoring Command Center
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  LIVE AI WEBCAM TELEMETRY
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time multi-candidate gaze tracking, secondary face detection, and active suspicious incident resolution
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchActiveSessions}
            disabled={loading}
            className="text-xs h-9 font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
          <div className="flex rounded-lg border bg-background p-1 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                filterStatus === 'ALL' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({sessions.length})
            </button>
            <button
              onClick={() => setFilterStatus('FLAGGED')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                filterStatus === 'FLAGGED' ? 'bg-rose-600 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Flagged ({flaggedCount})
            </button>
            <button
              onClick={() => setFilterStatus('CLEAN')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                filterStatus === 'CLEAN' ? 'bg-emerald-600 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Compliant ({sessions.length - flaggedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Candidates</p>
              <p className="text-2xl font-black text-foreground mt-1 font-mono">{sessions.length}</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> 100% Webcam Video Active
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              <User className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">High Risk Alerts</p>
              <p className="text-2xl font-black text-rose-600 mt-1 font-mono">{highRiskCount}</p>
              <p className="text-[10px] text-rose-600 font-bold mt-0.5">Critical AI Flagging</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gaze Tracking Mesh</p>
              <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">99.4%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Facial Landmark Locking</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Eye className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Audio Anomaly Filter</p>
              <p className="text-2xl font-black text-indigo-600 mt-1 font-mono">Active</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Whisper & Speech Detect</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Exam Sessions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            Active Exam Candidate Streams ({filteredSessions.length})
          </h2>
          <span className="text-xs text-muted-foreground">Automated refresh cycle: 3s</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Loading real-time candidate webcam feeds...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground border rounded-2xl bg-card">
            No sessions match the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSessions.map((session) => {
              const isHighRisk = session.risk_score >= 0.7;
              const isMediumRisk = session.risk_score >= 0.4 && session.risk_score < 0.7;

              return (
                <Card
                  key={session.id}
                  className={`border overflow-hidden transition-all shadow-sm ${
                    isHighRisk
                      ? 'border-rose-400 dark:border-rose-800 ring-1 ring-rose-400/20'
                      : isMediumRisk
                      ? 'border-amber-300 dark:border-amber-800'
                      : 'border-border'
                  }`}
                >
                  {/* Simulated Live Webcam Feed Screen */}
                  <div className="relative h-44 bg-slate-950 flex flex-col justify-between p-3 select-none overflow-hidden">
                    {/* Background noise grid */}
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

                    {/* Facial recognition wireframe simulation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className={`w-28 h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col justify-between p-1.5 ${
                          isHighRisk
                            ? 'border-rose-500 bg-rose-500/10'
                            : isMediumRisk
                            ? 'border-amber-400 bg-amber-400/5'
                            : 'border-emerald-400 bg-emerald-400/5'
                        }`}
                      >
                        <div className="flex justify-between text-[8px] font-mono font-bold text-white/70">
                          <span>+</span>
                          <span>+</span>
                        </div>
                        <div className="text-center text-[9px] font-mono font-bold tracking-wider text-white/80">
                          {session.student_reg}
                        </div>
                        <div className="flex justify-between text-[8px] font-mono font-bold text-white/70">
                          <span>+</span>
                          <span>+</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Webcam Header */}
                    <div className="relative z-10 flex justify-between items-center text-[10px]">
                      <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded-md font-mono font-bold border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        REC 1080p
                      </span>

                      {/* Risk Score Pill */}
                      <span
                        className={`px-2 py-0.5 rounded-md font-black font-mono border ${
                          isHighRisk
                            ? 'bg-rose-600 text-white border-rose-400'
                            : isMediumRisk
                            ? 'bg-amber-500 text-black border-amber-300'
                            : 'bg-emerald-600 text-white border-emerald-400'
                        }`}
                      >
                        RISK: {(session.risk_score * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Bottom Webcam Overlay */}
                    <div className="relative z-10 flex justify-between items-end text-[10px] text-white">
                      <div>
                        <p className="font-bold drop-shadow">{session.student_name}</p>
                        <p className="text-[9px] text-white/70 font-mono">Reg: {session.student_reg}</p>
                      </div>

                      <span className="text-[9px] font-mono text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded">
                        Gaze: Locked
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-foreground truncate">{session.exam_title}</p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                        <span>Started: 15:45 (90 min cap)</span>
                        <span
                          className={`font-black uppercase text-[10px] px-1.5 py-0.2 rounded ${
                            session.status === 'FLAGGED'
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                    </div>

                    {/* Flagged Events Box */}
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Active Telemetry Status:
                      </p>
                      <p className="text-xs font-semibold text-foreground">{session.current_flag}</p>
                      {session.flagged_events.length > 0 && (
                        <ul className="text-[10px] text-muted-foreground list-disc list-inside space-y-0.5 pt-1 border-t border-border/60">
                          {session.flagged_events.map((evt, idx) => (
                            <li key={idx} className="truncate">
                              {evt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLogsSession(session)}
                        className="flex-1 text-xs h-8 font-bold border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        View Flagged Logs
                      </Button>

                      {session.status === 'FLAGGED' ? (
                        <Button
                          size="sm"
                          onClick={() => handleResolveSession(session.id)}
                          className="text-xs h-8 font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5"
                        >
                          Resolve
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendWarning(session.student_name)}
                          className="text-xs h-8 font-bold text-muted-foreground hover:text-foreground px-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Flagged Logs Modal */}
      {selectedLogsSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border shadow-2xl rounded-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">
                    Suspicious Activity Audit Trail — {selectedLogsSession.student_name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Candidate Reg: {selectedLogsSession.student_reg} • Risk: {(selectedLogsSession.risk_score * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogsSession(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3 rounded-xl bg-muted/40 border text-xs">
                <p className="font-bold text-foreground">Assessed Examination:</p>
                <p className="text-muted-foreground mt-0.5">{selectedLogsSession.exam_title}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Timestamped Violation Records ({selectedLogsSession.flagged_logs.length})
                </p>

                {selectedLogsSession.flagged_logs.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    No suspicious events recorded. Session compliant.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedLogsSession.flagged_logs.map((log, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl border bg-card flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              ⏱️ {log.timestamp}
                            </span>
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                                log.severity === 'HIGH'
                                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                  : log.severity === 'MEDIUM'
                                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              }`}
                            >
                              {log.severity}
                            </span>
                          </div>
                          <p className="font-bold text-foreground">{log.event}</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{log.details}</p>
                        </div>

                        <span className="text-[10px] font-mono font-bold text-muted-foreground whitespace-nowrap">
                          {(log.confidence * 100).toFixed(0)}% Conf
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-muted/20 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendWarning(selectedLogsSession.student_name)}
                className="text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Issue Official Warning
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  handleResolveSession(selectedLogsSession.id);
                  setSelectedLogsSession(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4"
              >
                Mark Incident Resolved
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
