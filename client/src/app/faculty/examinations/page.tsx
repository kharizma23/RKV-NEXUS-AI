'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bot, FileText, Calendar, Clock, Award, ShieldCheck, 
  Trash2, Search, Filter, Sparkles, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface Examination {
  id: string;
  title: string;
  exam_type: string;
  total_marks: number;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  is_published: boolean;
  status: string;
  question_count?: number;
  exam_questions?: any[];
}

const DEFAULT_FACULTY_EXAMS: Examination[] = [
  {
    id: 'e1a00000-0000-0000-0000-000000000001',
    title: 'Autonomous Systems & Concurrency Final Examination',
    exam_type: 'Comprehensive Exam',
    total_marks: 50,
    duration_minutes: 60,
    start_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    end_time: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
    is_published: true,
    status: 'published',
    question_count: 5,
  },
  {
    id: 'e1a00000-0000-0000-0000-000000000002',
    title: '⚡ 2-Mark Quick Diagnostic Quiz: Mutex & Deadlock Invariants',
    exam_type: '2-Mark Quiz',
    total_marks: 20,
    duration_minutes: 25,
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    is_published: true,
    status: 'published',
    question_count: 10,
  },
  {
    id: 'e1a00000-0000-0000-0000-000000000003',
    title: 'Transformer Attention Models & LLM Fine-Tuning Assessment',
    exam_type: 'Internal Continuous Assessment',
    total_marks: 100,
    duration_minutes: 120,
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 74).toISOString(),
    is_published: false,
    status: 'draft',
    question_count: 8,
  },
];

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('antigravity_token') ||
      localStorage.getItem('token') ||
      '';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const userStr = localStorage.getItem('antigravity_auth_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) headers['X-User-Email'] = u.email;
        if (u.role || (u.roles && u.roles[0])) headers['X-Demo-Role'] = String(u.role || u.roles[0]).toLowerCase();
      } catch {}
    }
  }
  return headers;
};

export default function FacultyExaminationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | '2mark' | 'draft' | 'published'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: exams = [], isLoading } = useQuery<Examination[]>({
    queryKey: ['faculty-created-exams'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/faculty/exams', { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (e) {
        // Fallback for demo testing
      }
      return DEFAULT_FACULTY_EXAMS;
    },
  });

  // Handle Delete Draft
  const handleDelete = async (examId: string, examTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${examTitle}"?`)) return;
    try {
      setDeletingId(examId);
      const res = await fetch(`/api/v1/faculty/exams/${examId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['faculty-created-exams'] });
      } else {
        alert('Could not delete examination.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while deleting examination.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered examinations
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exam.exam_type.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedFilter === '2mark') return exam.total_marks <= 20;
    if (selectedFilter === 'draft') return exam.status !== 'published';
    if (selectedFilter === 'published') return exam.status === 'published';
    return true;
  });

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-8 h-8 text-indigo-600" />
              Examinations & Blueprints
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
              Manage your 2-mark quizzes, mid-terms, question papers, and paper quality gates.
            </p>
          </div>
          <Button 
            onClick={() => router.push('/faculty/examinations/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Bot className="w-4 h-4" /> + Create Exam with AI
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or exam type..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <Button
              size="sm"
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
              className="text-xs h-8 font-semibold"
            >
              All ({exams.length})
            </Button>
            <Button
              size="sm"
              variant={selectedFilter === '2mark' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('2mark')}
              className="text-xs h-8 font-semibold text-cyan-600 border-cyan-500/30"
            >
              ⚡ 2-Mark / Quizzes
            </Button>
            <Button
              size="sm"
              variant={selectedFilter === 'published' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('published')}
              className="text-xs h-8 font-semibold text-emerald-600 border-emerald-500/30"
            >
              Published
            </Button>
            <Button
              size="sm"
              variant={selectedFilter === 'draft' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('draft')}
              className="text-xs h-8 font-semibold text-amber-600 border-amber-500/30"
            >
              Drafts
            </Button>
          </div>
        </div>

        {/* Examinations List */}
        <Card className="border shadow-lg">
          <CardHeader className="py-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              📋 Created Examinations ({filteredExams.length})
            </CardTitle>
            <span className="text-xs text-slate-400">
              {exams.length > 0 ? 'Click any card to inspect or test' : ''}
            </span>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="py-16 text-center text-slate-500 font-medium animate-pulse">Loading examinations...</div>
            ) : filteredExams.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-semibold text-sm">No matching examinations found.</p>
                <p className="text-xs text-slate-400">Try adjusting your filter or generate a new 2-mark quiz.</p>
                <Button 
                  onClick={() => router.push('/faculty/examinations/create')} 
                  variant="outline"
                  size="sm"
                  className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 font-bold"
                >
                  <Bot className="w-4 h-4 mr-1.5" /> Generate 2-Mark Exam with AI
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredExams.map((exam) => {
                  const is2MarkQuiz = exam.total_marks <= 20;
                  const isMidTerm = exam.total_marks >= 50;
                  const qCount = exam.exam_questions?.length || exam.question_count || (is2MarkQuiz ? Math.round(exam.total_marks / 2) : 5);

                  return (
                    <Card 
                      key={exam.id} 
                      className="border border-slate-200 dark:border-slate-800 bg-card hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <CardContent className="p-5 space-y-3.5 text-xs">
                        {/* Header Badge Row */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            {is2MarkQuiz ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 flex items-center gap-1">
                                ⚡ 2-MARK TEST
                              </span>
                            ) : isMidTerm ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                                🎓 COMPREHENSIVE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                                📘 ASSESSMENT
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {exam.exam_type}
                            </span>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                            exam.status === 'published' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-300' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-300'
                          }`}>
                            {exam.status === 'published' ? '● PUBLISHED' : '○ DRAFT'}
                          </span>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-slate-100 line-clamp-1">
                            {exam.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Contains {qCount} Questions • {is2MarkQuiz ? '2 Marks each' : `${exam.total_marks} Marks total`}
                          </p>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 font-semibold border-t border-b py-2.5 my-1">
                          <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Total: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{exam.total_marks} Marks</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Duration: <strong>{exam.duration_minutes} Mins</strong></span>
                          </div>
                        </div>

                        {/* Schedule (if published) */}
                        {exam.status === 'published' && (
                          <div className="space-y-1 bg-slate-50 dark:bg-slate-900/40 p-2 rounded border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
                            <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                              <Calendar className="w-3 h-3 text-indigo-500" />
                              <span>Active Time Window:</span>
                            </div>
                            <p className="font-mono text-slate-400">
                              {new Date(exam.start_time).toLocaleDateString()} — {new Date(exam.end_time).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {/* Interactive Actions */}
                        <div className="flex items-center justify-between pt-2 gap-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/faculty/examinations/${exam.id}/quality`)}
                            className="text-[11px] h-8 font-bold flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            Quality Gate
                          </Button>

                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={deletingId === exam.id}
                              onClick={() => handleDelete(exam.id, exam.title)}
                              className="text-[11px] h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2"
                              title="Delete this examination"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
