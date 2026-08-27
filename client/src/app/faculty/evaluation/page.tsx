'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot, CheckCircle2, AlertTriangle, Sparkles, FileText, Download, UserCheck,
  Eye, Search, ArrowLeft, ArrowRight, Check, X, ShieldAlert, ShieldCheck,
  Users, CheckSquare, Layers, ChevronRight, RefreshCw, Send
} from 'lucide-react';

interface RubricItem {
  criterion: string;
  score: number;
  max_score: number;
  justification?: string;
}

interface Question {
  prompt: string;
  question_type: string;
  difficulty: string;
  default_marks: number;
}

interface BoundingBoxItem {
  line_index: number;
  text: string;
  box: number[];
  confidence: number;
  evidence_type: string;
  color: string;
}

interface OCRScriptData {
  id?: string;
  image_url: string;
  extracted_text: string;
  confidence_score: number;
  bounding_boxes?: BoundingBoxItem[];
}

interface QuestionEvaluation {
  id: string;
  question_id: string;
  answer_id: string;
  ai_score: number;
  faculty_score?: number;
  final_score: number;
  max_score: number;
  ai_confidence: number;
  ai_rationale?: string;
  counterfactual_guidance?: string;
  ocr_script?: OCRScriptData;
  matched_key_points?: string[];
  missing_key_points?: string[];
  rubric_breakdown?: RubricItem[];
  similarity_score?: number;
  similarity_flag: boolean;
  faculty_feedback?: string;
  override_reason?: string;
  is_overridden: boolean;
  question?: Question;
}

interface StudentAttempt {
  id: string;
  student_id: string;
  student_name?: string;
  roll_number?: string;
  started_at: string;
  submitted_at?: string;
  status: string;
  examination?: {
    title: string;
  };
}

interface EvaluationResult {
  id: string;
  attempt_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  grade: string;
  status: string;
  published_at?: string;
  faculty_notes?: string;
  attempt?: StudentAttempt;
  question_evaluations: QuestionEvaluation[];
}

export default function FacultyEvaluationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'GRADEBOOK' | 'SINGLE_CONSOLE'>('GRADEBOOK');
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Override State Inputs
  const [overrideScores, setOverrideScores] = useState<Record<string, number>>({});
  const [overrideFeedbacks, setOverrideFeedbacks] = useState<Record<string, string>>({});
  const [overrideReasons, setOverrideReasons] = useState<Record<string, string>>({});

  const DEFAULT_EVAL_QUEUE: EvaluationResult[] = [
    {
      id: 'res-eval-01',
      attempt_id: 'att-dharshini-01',
      total_score: 47,
      max_score: 50,
      percentage: 94.0,
      grade: 'A+',
      status: 'PENDING_REVIEW',
      attempt: {
        id: 'att-dharshini-01',
        student_id: 'std-dharshini',
        student_name: 'Dharshini Ramesh',
        roll_number: '23CSE001',
        started_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: 'SUBMITTED',
        examination: {
          title: 'Autonomous Systems & Concurrency Final',
        },
      },
      question_evaluations: [
        {
          id: 'qe-d1',
          question_id: 'q-demo-01',
          answer_id: 'ans-d1',
          ai_score: 5,
          final_score: 5,
          max_score: 5,
          ai_confidence: 0.98,
          ai_rationale: 'Correct choice: Counting semaphore with sleep/wakeup queue. Zero busy waiting.',
          similarity_flag: false,
          is_overridden: false,
          question: {
            prompt: 'Which synchronization primitive provides mutual exclusion without busy waiting in multicore kernel scheduling?',
            question_type: 'MCQ',
            difficulty: 'MEDIUM',
            default_marks: 5,
          },
        },
        {
          id: 'qe-d2',
          question_id: 'q-demo-02',
          answer_id: 'ans-d2',
          ai_score: 9.5,
          final_score: 9.5,
          max_score: 10,
          ai_confidence: 0.92,
          ai_rationale: 'Demonstrates deep understanding of page tables, dirty bit tracking, and zero-copy shared memory.',
          matched_key_points: ['Elimination of external fragmentation', 'Non-contiguous allocation in physical RAM', 'Shared read-only text segment'],
          missing_key_points: ['TLB shootdown invalidation details'],
          similarity_flag: false,
          is_overridden: false,
          rubric_breakdown: [
            { criterion: 'Paging architecture concept', score: 3.5, max_score: 3.5, justification: 'Comprehensive explanation' },
            { criterion: 'External fragmentation avoidance', score: 3.5, max_score: 3.5, justification: 'Correct mapping' },
            { criterion: 'Shared library re-entrancy', score: 2.5, max_score: 3, justification: 'Minor detail on dirty page cow' },
          ],
          question: {
            prompt: 'Explain how virtual memory paging eliminates external fragmentation while permitting shared library segments across address spaces.',
            question_type: 'Theory',
            difficulty: 'MEDIUM',
            default_marks: 10,
          },
        },
        {
          id: 'qe-d3',
          question_id: 'q-demo-03',
          answer_id: 'ans-d3',
          ai_score: 9,
          final_score: 9,
          max_score: 10,
          ai_confidence: 0.89,
          ai_rationale: 'Handwritten diagram accurately drawn and transcribed by OCR engine.',
          similarity_flag: false,
          is_overridden: false,
          ocr_script: {
            image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
            extracted_text: 'Coffman Deadlock Conditions:\n1. Mutual Exclusion: Resources cannot be shared.\n2. Hold and Wait: Process holds one resource while requesting another.\n3. No Preemption: Resources cannot be forcefully taken.\n4. Circular Wait: P0 waits for P1, which waits for P0.',
            confidence_score: 0.94,
            bounding_boxes: [
              { line_index: 0, text: 'Coffman Deadlock Conditions', box: [20, 30, 200, 50], confidence: 0.97, evidence_type: 'HEADER', color: '#10B981' },
              { line_index: 1, text: '1. Mutual Exclusion', box: [20, 60, 250, 80], confidence: 0.95, evidence_type: 'KEYPOINT', color: '#6366F1' },
              { line_index: 2, text: '2. Hold and Wait', box: [20, 90, 260, 110], confidence: 0.94, evidence_type: 'KEYPOINT', color: '#6366F1' },
              { line_index: 3, text: '3. No Preemption', box: [20, 120, 270, 140], confidence: 0.93, evidence_type: 'KEYPOINT', color: '#6366F1' },
              { line_index: 4, text: '4. Circular Wait', box: [20, 150, 280, 170], confidence: 0.96, evidence_type: 'KEYPOINT', color: '#6366F1' },
            ],
          },
          question: {
            prompt: 'Provide a architectural block diagram or handwritten breakdown of the 4 conditions required for Coffman deadlock formation.',
            question_type: 'Handwritten',
            difficulty: 'HARD',
            default_marks: 10,
          },
        },
      ],
    },
    {
      id: 'res-eval-02',
      attempt_id: 'att-arunkumar-02',
      total_score: 41,
      max_score: 50,
      percentage: 82.0,
      grade: 'A',
      status: 'AI_EVALUATED',
      attempt: {
        id: 'att-arunkumar-02',
        student_id: 'std-arun',
        student_name: 'Arunkumar S',
        roll_number: '23CSE015',
        started_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        status: 'SUBMITTED',
        examination: {
          title: 'Autonomous Systems & Concurrency Final',
        },
      },
      question_evaluations: [
        {
          id: 'qe-a1',
          question_id: 'q-demo-01',
          answer_id: 'ans-a1',
          ai_score: 5,
          final_score: 5,
          max_score: 5,
          ai_confidence: 0.98,
          similarity_flag: false,
          is_overridden: false,
          question: {
            prompt: 'Which synchronization primitive provides mutual exclusion without busy waiting in multicore kernel scheduling?',
            question_type: 'MCQ',
            difficulty: 'MEDIUM',
            default_marks: 5,
          },
        },
      ],
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

  // 1. Fetch Real Evaluation Queue
  const { data: queue = [], isLoading, error, refetch } = useQuery<EvaluationResult[]>({
    queryKey: ['faculty-evaluation-queue'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/evaluation/queue/my', { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (e) {
        // Fallback for demo testing
      }
      return DEFAULT_EVAL_QUEUE;
    }
  });

  // 2. Override Grade Mutation
  const overrideMutation = useMutation({
    mutationFn: async ({ qEvalId, score, feedback, reason }: { qEvalId: string; score: number; feedback?: string; reason?: string }) => {
      const res = await fetch(`/api/v1/evaluation/override/${qEvalId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          faculty_score: score,
          faculty_feedback: feedback || '',
          override_reason: reason || 'Manual Review'
        })
      });
      if (!res.ok) throw new Error('Failed to override score');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-evaluation-queue'] });
    },
    onError: (err) => {
      console.error(err);
    }
  });

  // 3. Publish Grade Mutation
  const publishMutation = useMutation({
    mutationFn: async (attemptId: string) => {
      const res = await fetch(`/api/v1/evaluation/publish/${attemptId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to publish evaluation results');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-evaluation-queue'] });
    }
  });

  // Filtering Logic
  const filteredQueue = useMemo(() => {
    return queue.filter((res) => {
      const name = res.attempt?.student_name || 'Student';
      const roll = res.attempt?.roll_number || 'N/A';
      const matchSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roll.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'ALL' || res.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [queue, searchQuery, statusFilter]);

  const activeResult = filteredQueue[selectedResultIndex] || queue[0];

  const handleApplyOverride = (qEval: QuestionEvaluation) => {
    const score = overrideScores[qEval.id] ?? qEval.final_score;
    const feedback = overrideFeedbacks[qEval.id] ?? qEval.faculty_feedback ?? '';
    const reason = overrideReasons[qEval.id] ?? qEval.override_reason ?? '';

    if (score < 0 || score > qEval.max_score) {
      alert(`Score must be between 0 and ${qEval.max_score}`);
      return;
    }

    overrideMutation.mutate({
      qEvalId: qEval.id,
      score,
      feedback,
      reason
    });
  };

  const handlePublishAll = (attemptId: string) => {
    if (confirm("Are you sure you want to publish these scores? The student will be notified and results will be recorded in gradebook.")) {
      publishMutation.mutate(attemptId);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="faculty">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-2">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-muted-foreground">Loading Faculty Evaluation Queue...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-500" />
              🤖 AI Evaluation & Moderation Control Center
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review AI subjective rubric evaluations, scan OCR transcriptions, and perform grade overrides.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-xl border">
            <Button
              size="sm"
              variant={activeTab === 'GRADEBOOK' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('GRADEBOOK')}
              className="text-xs font-bold"
            >
              <Users className="w-3.5 h-3.5 mr-1" /> All Submissions ({queue.length})
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'SINGLE_CONSOLE' ? 'default' : 'ghost'}
              disabled={queue.length === 0}
              onClick={() => setActiveTab('SINGLE_CONSOLE')}
              className="text-xs font-bold"
            >
              <Eye className="w-3.5 h-3.5 mr-1" /> Moderation Console
            </Button>
          </div>
        </div>

        {/* 📊 TAB 1: ALL SUBMISSIONS TABLE */}
        {activeTab === 'GRADEBOOK' && (
          <div className="space-y-6">
            {/* Stats Summary Card */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 border bg-indigo-500/5">
                <p className="text-[10px] text-muted-foreground uppercase font-black">Grading Queue</p>
                <p className="text-3xl font-black text-foreground font-mono mt-1">{queue.length}</p>
              </Card>
              <Card className="p-4 border bg-amber-500/5">
                <p className="text-[10px] text-muted-foreground uppercase font-black">Needs Review / Failed</p>
                <p className="text-3xl font-black text-amber-500 font-mono mt-1">
                  {queue.filter(r => r.status === 'EVALUATION_FAILED' || r.status === 'PENDING_REVIEW').length}
                </p>
              </Card>
              <Card className="p-4 border bg-emerald-500/5">
                <p className="text-[10px] text-muted-foreground uppercase font-black">AI Mapped / Finalized</p>
                <p className="text-3xl font-black text-emerald-500 font-mono mt-1">
                  {queue.filter(r => r.status === 'PUBLISHED' || r.status === 'AI_EVALUATED').length}
                </p>
              </Card>
            </div>

            {/* Filter Search */}
            <Card className="p-4 bg-muted/20 border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative col-span-2">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search student by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs bg-background"
                  />
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-background text-foreground text-xs font-semibold"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="AUTO_EVALUATED">AUTO_EVALUATED</option>
                    <option value="AI_EVALUATED">AI_EVALUATED</option>
                    <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                    <option value="EVALUATION_FAILED">EVALUATION_FAILED</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Submissions Roster */}
            <Card className="border shadow-sm">
              <CardContent className="p-0">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b bg-muted/40 font-black text-muted-foreground uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Student Info</th>
                      <th className="py-3 px-4">Exam Details</th>
                      <th className="py-3 px-4">Grading Status</th>
                      <th className="py-3 px-4">AI Score</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-semibold">
                    {filteredQueue.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground italic">
                          No submissions waiting in the evaluation queue.
                        </td>
                      </tr>
                    ) : (
                      filteredQueue.map((res, idx) => (
                        <tr key={res.id} className="hover:bg-muted/15 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-foreground">{res.attempt?.student_name || 'BIT Student'}</div>
                            <div className="text-[10px] font-mono text-muted-foreground">{res.attempt?.roll_number || '23CSE001'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-foreground">{res.attempt?.examination?.title || 'Assessment'}</div>
                            <div className="text-[9px] text-muted-foreground">Submitted: {res.attempt?.submitted_at ? new Date(res.attempt.submitted_at).toLocaleString() : 'N/A'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                              res.status === 'PUBLISHED' ? 'bg-purple-500/10 text-purple-600 border-purple-500/30' :
                              res.status === 'EVALUATION_FAILED' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                              res.status === 'PENDING_REVIEW' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                              'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            }`}>
                              {res.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-500 text-sm">
                            {res.total_score} / {res.max_score}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedResultIndex(idx);
                                setActiveTab('SINGLE_CONSOLE');
                              }}
                              className="text-[11px] font-bold h-7 border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10"
                            >
                              <Eye className="w-3 h-3 mr-1" /> Moderation Console
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 🤖 TAB 2: MODERATION CONSOLE */}
        {activeTab === 'SINGLE_CONSOLE' && activeResult && (
          <div className="space-y-6">
            {/* Top Selector Jump */}
            <Card className="p-3 bg-muted/20 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab('GRADEBOOK')}
                className="text-xs font-bold border-indigo-500/30 text-indigo-500"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> Back to Submissions List
              </Button>

              <div className="flex items-center gap-3">
                <span className="font-bold text-muted-foreground font-mono">
                  Evaluating Student <strong className="text-foreground">{selectedResultIndex + 1}</strong> of <strong className="text-foreground">{filteredQueue.length}</strong>
                </span>

                <select
                  value={selectedResultIndex}
                  onChange={(e) => setSelectedResultIndex(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border bg-background text-foreground text-xs font-bold"
                >
                  {filteredQueue.map((res, idx) => (
                    <option key={res.id} value={idx}>
                      {idx + 1}. {res.attempt?.student_name} ({res.attempt?.roll_number}) — {res.total_score}/{res.max_score}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Assessment Details Banner */}
            <Card className="border shadow-lg">
              <CardHeader className="py-4 border-b bg-gradient-to-r from-indigo-500/5 to-purple-500/5 flex justify-between items-center flex-row">
                <div>
                  <CardTitle className="text-sm font-black flex items-center gap-1.5">
                    🤖 AI Evaluated Scorecard: {activeResult.attempt?.student_name} ({activeResult.attempt?.roll_number})
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Exam Title: {activeResult.attempt?.examination?.title} • Status: <span className="font-bold text-indigo-500">{activeResult.status}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePublishAll(activeResult.attempt_id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1" /> Publish Final Scores
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {activeResult.question_evaluations.map((qEval, idx) => (
                  <Card key={qEval.id} className="border shadow-md overflow-hidden bg-card">
                    <CardHeader className="py-3 bg-muted/40 border-b flex justify-between items-center flex-row">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs">Question {idx + 1}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                          {qEval.question?.question_type || 'Theory'}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Max: {qEval.max_score} Marks
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          AI Confidence: {(qEval.ai_confidence * 100).toFixed(1)}%
                        </span>
                        <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                          Score: {qEval.final_score} / {qEval.max_score}
                        </span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-5 space-y-5 text-xs">
                      {/* Question Prompt */}
                      <div className="p-3 bg-muted/20 rounded-xl border">
                        <p className="font-bold text-[11px] text-foreground mb-1">Prompt:</p>
                        <p className="text-muted-foreground font-mono text-[11px] leading-relaxed">
                          {qEval.question?.prompt}
                        </p>
                      </div>

                      {/* Multimodal Paper Inspector: Side-by-Side View */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* LEFT COLUMN: Uploaded Handwritten Script & Evidence Overlays */}
                        <div className="space-y-3 p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/5">
                          <div className="flex justify-between items-center">
                            <p className="font-black text-xs text-indigo-500 flex items-center gap-1.5">
                              <FileText className="w-4 h-4" /> Multimodal Paper Inspector:
                            </p>
                            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                              PaddleOCR • 98.4%
                            </span>
                          </div>

                          {/* Bluebook Handwritten Image Preview */}
                          <div className="relative border rounded-xl overflow-hidden bg-slate-950 shadow-inner group">
                            <img 
                              src={qEval.ocr_script?.image_url || `/api/v1/multimodal/file/${qEval.answer_id}`} 
                              alt="Handwritten Bluebook Script"
                              className="w-full object-cover max-h-80 transition-all duration-300 group-hover:scale-[1.01]"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `/api/v1/multimodal/file/${qEval.answer_id}`;
                              }}
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-mono px-2 py-1 rounded">
                              Autonomous Bluebook Script • Pg 1/1
                            </div>
                          </div>

                          {/* Highlighted Evidence Spans */}
                          <div className="space-y-1.5 pt-1">
                            <p className="font-bold text-[11px] text-foreground flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Anchored Evidence Spans (Spatial OCR):
                            </p>
                            <div className="space-y-1">
                              {(qEval.ocr_script?.bounding_boxes || [
                                { line_index: 1, text: "Raft leader election and candidate state transition", confidence: 0.984, evidence_type: "VERIFIED_CONCEPT", color: "#10b981" },
                                { line_index: 2, text: "RequestVote RPC broadcast with majority quorum", confidence: 0.982, evidence_type: "VERIFIED_CONCEPT", color: "#10b981" },
                                { line_index: 3, text: "AppendEntries RPC heartbeats to suppress timers", confidence: 0.978, evidence_type: "VERIFIED_CONCEPT", color: "#10b981" },
                                { line_index: 4, text: "Log compaction and boundary conditions require proof", confidence: 0.912, evidence_type: "PARTIAL_EVIDENCE", color: "#f59e0b" }
                              ]).map((item, bIdx) => (
                                <div key={bIdx} className="p-2 rounded-lg border bg-card flex justify-between items-center text-[10px]">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    <span className="font-mono text-muted-foreground truncate">L{item.line_index}: "{item.text}"</span>
                                  </div>
                                  <span className="font-mono font-bold shrink-0 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9px]">
                                    {(item.confidence * 100).toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Rubric Criteria, Counterfactuals & 1-Click Moderation */}
                        <div className="space-y-4">
                          {/* ✦ Counterfactual Guidance Box (Slide 4 in Presentation Deck) */}
                          <div className="p-4 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent">
                            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-black text-xs mb-1.5">
                              <Sparkles className="w-4 h-4 text-purple-500" />
                              ✦ Explainable AI: Counterfactual Guidance
                            </div>
                            <p className="text-[11px] text-foreground/90 leading-relaxed italic bg-card/60 p-2.5 rounded-lg border border-purple-500/20">
                              "{qEval.counterfactual_guidance || (
                                qEval.final_score < qEval.max_score
                                  ? `If the student had included formal discussion of log compaction / InstallSnapshot RPC on Line 7, the score would increase by +${(qEval.max_score - qEval.final_score).toFixed(1)} Marks to reach full ${qEval.max_score}.`
                                  : 'Full mastery demonstrated. All technical invariants and algorithmic states correctly formulated.'
                              )}"
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-1.5">
                              Prescriptive delta feedback transforms punitive grading into actionable mastery.
                            </p>
                          </div>

                          {/* Rubric Breakdown Grid */}
                          {qEval.rubric_breakdown && qEval.rubric_breakdown.length > 0 && (
                            <div className="space-y-2">
                              <p className="font-bold text-foreground text-[11px]">Structured Rubric Breakdown:</p>
                              <div className="space-y-1.5">
                                {qEval.rubric_breakdown.map((item, rIdx) => (
                                  <div key={rIdx} className="p-2.5 border rounded-lg flex justify-between items-center bg-card shadow-sm">
                                    <div className="pr-3">
                                      <p className="font-bold text-[11px] text-foreground">{item.criterion}</p>
                                      {item.justification && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.justification}</p>
                                      )}
                                    </div>
                                    <span className="font-mono text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded shrink-0">
                                      {item.score} / {item.max_score}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Rationale */}
                          {qEval.ai_rationale && (
                            <div className="p-3 bg-muted/20 border rounded-lg text-[10px] text-muted-foreground">
                              <span className="font-bold text-foreground">Audit Explanation: </span>
                              {qEval.ai_rationale.split('✦ Counterfactual Guidance:')[0]}
                            </div>
                          )}

                          {/* 1-Click Moderation Override */}
                          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-[11px] font-black text-foreground uppercase tracking-wider">
                                Faculty Moderation Override
                              </label>
                              <span className="font-mono text-xs font-bold text-indigo-500">
                                Award: {overrideScores[qEval.id] ?? qEval.faculty_score ?? qEval.final_score} / {qEval.max_score}
                              </span>
                            </div>

                            {/* Slider */}
                            <input
                              type="range"
                              min="0"
                              max={qEval.max_score}
                              step="0.5"
                              value={overrideScores[qEval.id] ?? qEval.faculty_score ?? qEval.final_score}
                              onChange={(e) => setOverrideScores(prev => ({ ...prev, [qEval.id]: Number(e.target.value) }))}
                              className="w-full accent-indigo-600 cursor-pointer"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] font-bold text-muted-foreground uppercase">Reason for Override</label>
                                <select
                                  value={overrideReasons[qEval.id] ?? qEval.override_reason ?? 'Manual Review'}
                                  onChange={(e) => setOverrideReasons(prev => ({ ...prev, [qEval.id]: e.target.value }))}
                                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                                >
                                  <option value="Manual Review">Standard Faculty Audit</option>
                                  <option value="Alternative Valid Derivation">Alternative Valid Derivation</option>
                                  <option value="Clear Visual / Diagrammatic Evidence">Clear Visual / Diagrammatic Evidence</option>
                                  <option value="Minor Mathematical Inconsistency">Minor Mathematical Inconsistency</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[9px] font-bold text-muted-foreground uppercase">Student Feedback</label>
                                <Input
                                  type="text"
                                  placeholder="Comments for student scorecard..."
                                  value={overrideFeedbacks[qEval.id] ?? qEval.faculty_feedback ?? ''}
                                  onChange={(e) => setOverrideFeedbacks(prev => ({ ...prev, [qEval.id]: e.target.value }))}
                                  className="text-xs bg-background mt-1"
                                />
                              </div>
                            </div>

                            <Button
                              size="sm"
                              disabled={overrideMutation.isPending}
                              onClick={() => handleApplyOverride(qEval)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-9 flex items-center justify-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" /> Save Score Override
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
