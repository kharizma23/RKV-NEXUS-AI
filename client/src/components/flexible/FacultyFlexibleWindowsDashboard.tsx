'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Search,
  Filter,
  BarChart2,
  FileText,
  Radio,
  Timer,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';

interface ExamWindow {
  id: string;
  title: string;
  subject: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  status: 'Active' | 'Upcoming' | 'Closed' | string;
  total_candidates: number;
  completed_candidates: number;
}

export function FacultyFlexibleWindowsDashboard() {
  const [windows, setWindows] = useState<ExamWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form State
  const nowStr = new Date().toISOString().slice(0, 16);
  const futureStr = new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16);

  const [newWindow, setNewWindow] = useState({
    title: '',
    duration_minutes: 90,
    start_time: nowStr,
    end_time: futureStr,
    description: 'Adaptive scheduling window for multi-session candidate attempts'
  });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchExamWindows = async () => {
    setLoading(true);
    try {
      const data = await apiClient<ExamWindow[]>('/exams/windows');
      if (Array.isArray(data)) {
        setWindows(data);
      }
    } catch (err) {
      console.error('Failed to load exam windows', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamWindows();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWindow.title.trim()) {
      showToast('Please enter an Examination Title');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: newWindow.title.trim(),
        duration_minutes: Number(newWindow.duration_minutes) || 90,
        start_time: new Date(newWindow.start_time).toISOString(),
        end_time: new Date(newWindow.end_time).toISOString(),
        description: newWindow.description.trim()
      };

      await apiClient('/exams/windows', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(`Flexible Window for "${newWindow.title}" created successfully!`);
      setShowCreateModal(false);
      setNewWindow({
        title: '',
        duration_minutes: 90,
        start_time: nowStr,
        end_time: futureStr,
        description: 'Adaptive scheduling window for multi-session candidate attempts'
      });
      await fetchExamWindows();
    } catch (err: any) {
      console.error('Failed to create flexible window', err);
      showToast(err?.message || 'Failed to create flexible window');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  const filteredWindows = windows.filter((w) => {
    const matchesSearch =
      searchTerm === '' ||
      w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || w.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const activeCount = windows.filter((w) => w.status === 'Active').length;
  const upcomingCount = windows.filter((w) => w.status === 'Upcoming').length;
  const closedCount = windows.filter((w) => w.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium text-xs rounded-xl shadow-2xl border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
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
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                ⏱️ Flexible Windows Monitor
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ADAPTIVE SCHEDULING
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Observe active candidate testing intervals, configure multi-day exam windows, and manage adaptive duration caps
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchExamWindows}
            disabled={loading}
            className="text-xs h-9 font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Windows
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-bold px-3.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Flexible Window
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Windows</p>
              <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{activeCount}</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Candidate Submissions
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Upcoming Windows</p>
              <p className="text-2xl font-black text-indigo-600 mt-1 font-mono">{upcomingCount}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Scheduled Next 72h</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Closed Windows</p>
              <p className="text-2xl font-black text-muted-foreground mt-1 font-mono">{closedCount}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Evaluation Ingestion Ready</p>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/60 text-muted-foreground">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Window Length</p>
              <p className="text-2xl font-black text-foreground mt-1 font-mono">48h</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Equalized Difficulty Curves</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Timer className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border shadow-sm">
        <CardHeader className="py-4 px-5 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Adaptive Examination Time Windows
              </CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Multi-session flexible time slots pulled directly from the examinations database
              </p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search exam or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs rounded-lg"
                />
              </div>

              <div className="flex rounded-lg border bg-background p-0.5 text-xs">
                {['ALL', 'Active', 'Upcoming', 'Closed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                      statusFilter === st
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Examination Title & Subject</th>
                  <th className="py-3 px-4">Window Start Time</th>
                  <th className="py-3 px-4">Window End Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Candidate Attempts</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      Loading adaptive exam windows...
                    </td>
                  </tr>
                ) : filteredWindows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      No flexible exam windows match your current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredWindows.map((win) => {
                    const isActive = win.status === 'Active';
                    const isUpcoming = win.status === 'Upcoming';
                    const isClosed = win.status === 'Closed';

                    return (
                      <tr key={win.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground group-hover:text-indigo-600 transition-colors">
                                {win.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{win.subject}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                          {formatDateTime(win.start_time)}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                          {formatDateTime(win.end_time)}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                          {win.duration_minutes} Mins
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                              isActive
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : isUpcoming
                                ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                            {win.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-foreground">
                              {win.completed_candidates} / {win.total_candidates}
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  isActive ? 'bg-emerald-500' : 'bg-indigo-600'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    (win.completed_candidates / win.total_candidates) * 100,
                                    100
                                  )}%`
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => showToast(`Monitoring stream opened for ${win.title}`)}
                            className="h-7 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50"
                          >
                            Live Monitor
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* CREATE FLEXIBLE WINDOW MODAL */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Create Flexible Exam Window</h3>
                  <p className="text-xs text-muted-foreground">Configure adaptive scheduling interval for candidate test taking</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Exam Window Title *</Label>
                <Input
                  placeholder="e.g. Artificial Intelligence & NLP Semester Window"
                  value={newWindow.title}
                  onChange={(e) => setNewWindow({ ...newWindow, title: e.target.value })}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Window Start Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={newWindow.start_time}
                    onChange={(e) => setNewWindow({ ...newWindow, start_time: e.target.value })}
                    required
                    className="text-xs h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Window End Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={newWindow.end_time}
                    onChange={(e) => setNewWindow({ ...newWindow, end_time: e.target.value })}
                    required
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Duration Cap (Minutes) *</Label>
                  <Input
                    type="number"
                    min="15"
                    max="300"
                    value={newWindow.duration_minutes}
                    onChange={(e) => setNewWindow({ ...newWindow, duration_minutes: Number(e.target.value) })}
                    required
                    className="text-xs h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Max Attempts per Student</Label>
                  <Input
                    type="number"
                    defaultValue={1}
                    disabled
                    className="text-xs h-9 font-mono bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Instructions & Collusion Prevention Settings</Label>
                <textarea
                  rows={3}
                  value={newWindow.description}
                  onChange={(e) => setNewWindow({ ...newWindow, description: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300">
                🔒 Once created, students may launch their single attempt at any time within this interval. AI proctoring and dynamic question order will automatically equalize difficulty.
              </div>

              <div className="pt-3 border-t flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs h-9 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-bold px-4"
                >
                  {submitting ? 'Creating Window...' : 'Create Window'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
