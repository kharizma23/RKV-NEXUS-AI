'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle2, Bot, Calendar, Sparkles, ArrowRight, ArrowLeft, Trash2, Edit2, Plus, Save, Award } from 'lucide-react';
import { FacultyExamTargetingConfigurator } from '@/components/faculty/FacultyExamTargetingConfigurator';

interface QuestionOption {
  option_text: string;
  is_correct: boolean;
}

interface QuestionData {
  prompt: string;
  difficulty: string;
  question_type: string;
  marks: number;
  options: QuestionOption[];
  explanation?: string;
  co?: string;
  bloom_level?: string;
  topic?: string;
  rubric?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Institution {
  id: string;
  name: string;
  departments: Department[];
}

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

export default function CreateTestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Setup, 2: AI Generate & Review, 3: Assign
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Configurations
  const [examTitle, setExamTitle] = useState('AI Internal Assessment - 1');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [examType, setExamType] = useState('Internal');
  const [duration, setDuration] = useState('90');
  const [totalMarks, setTotalMarks] = useState('20');
  const [marksPerQuestion, setMarksPerQuestion] = useState<number>(2);
  
  const [topic, setTopic] = useState('Neural Networks, CNN, Backpropagation');
  const [questionCount, setQuestionCount] = useState('10');
  const [questionType, setQuestionType] = useState('MCQ'); // MCQ, Theory, Handwritten, Mixed
  const [easyPct, setEasyPct] = useState(30);
  const [mediumPct, setMediumPct] = useState(50);
  const [hardPct, setHardPct] = useState(20);

  const applyPreset = (count: number, marksEach: number, type: string, defaultTopic?: string) => {
    setQuestionCount(String(count));
    setMarksPerQuestion(marksEach);
    setTotalMarks(String(count * marksEach));
    setQuestionType(type);
    if (defaultTopic) {
      setTopic(defaultTopic);
    }
    setExamTitle(`${marksEach}-Mark Test (${count} Questions - ${count * marksEach} Marks)`);
  };

  // Generated Questions for Review
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editDifficulty, setEditDifficulty] = useState('EASY');
  const [editMarks, setEditMarks] = useState(5);
  const [editOptions, setEditOptions] = useState<QuestionOption[]>([]);
  
  const [editExplanation, setEditExplanation] = useState('');
  const [editCo, setEditCo] = useState('CO1');
  const [editBloomLevel, setEditBloomLevel] = useState('UNDERSTAND');
  const [editTopic, setEditTopic] = useState('');
  const [editRubric, setEditRubric] = useState('');

  // Assignment Configurations
  const getInitialDates = () => {
    const now = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const start = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const end = `${nextWeek.getFullYear()}-${pad(nextWeek.getMonth() + 1)}-${pad(nextWeek.getDate())}T${pad(nextWeek.getHours())}:${pad(nextWeek.getMinutes())}`;
    return { start, end };
  };

  const initialDates = getInitialDates();
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [targetBatch, setTargetBatch] = useState<string>('');
  const [targetSemester, setTargetSemester] = useState<number | ''>('');
  const [assignTo, setAssignTo] = useState('Entire Class');
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [eligibleCount, setEligibleCount] = useState<number | null>(null);

  // Load Subjects and Institutions on Mount
  useEffect(() => {
    async function fetchData() {
      try {
        const subRes = await fetch('/api/v1/academics/subjects', { headers: getAuthHeaders() });
        if (subRes.ok) {
          const subs = await subRes.json();
          setSubjects(subs);
          if (subs.length > 0) setSelectedSubjectId(subs[0].id);
        }
        
        const instRes = await fetch('/api/v1/institutions', { headers: getAuthHeaders() });
        if (instRes.ok) {
          const insts = await instRes.json();
          setInstitutions(insts);
          if (insts.length > 0) {
            setSelectedInstitutionId(insts[0].id);
            if (insts[0].departments?.length > 0) {
              setSelectedDepartmentId(insts[0].departments[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching dropdown parameters:', err);
      }
    }
    fetchData();
  }, []);

  // Subject-aware Topic Suggestions Hook
  useEffect(() => {
    const sub = subjects.find(s => s.id === selectedSubjectId);
    if (sub) {
      const subjectSuggestions: Record<string, string> = {
        "Object Oriented Programming": "Classes, Objects, Inheritance, Polymorphism, Abstraction, Encapsulation",
        "OOP": "Classes, Objects, Inheritance, Polymorphism, Abstraction, Encapsulation",
        "Database Management Systems": "Normalization, ER Model, SQL, Transactions, Indexing, Joins",
        "DBMS": "Normalization, ER Model, SQL, Transactions, Indexing, Joins",
        "Data Structures and Algorithms Lab": "Binary Search Tree, Linked List, Recursion, Sorting, Graph Traversals",
      };
      const matchedKey = Object.keys(subjectSuggestions).find(
        k => sub.name.toLowerCase().includes(k.toLowerCase()) || sub.code.toLowerCase().includes(k.toLowerCase())
      );
      if (matchedKey) {
        setTopic(subjectSuggestions[matchedKey]);
      }
    }
  }, [selectedSubjectId, subjects]);

  // Fetch Eligible Student Count dynamically
  useEffect(() => {
    if (!selectedInstitutionId || !selectedDepartmentId) {
      setEligibleCount(null);
      return;
    }
    async function fetchEligibleCount() {
      try {
        const res = await fetch('/api/v1/faculty/exams/eligible-students-count', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            institution_id: selectedInstitutionId,
            department_id: selectedDepartmentId
          })
        });
        if (res.ok) {
          const data = await res.json();
          setEligibleCount(data.count);
        }
      } catch (err) {
        console.error('Error fetching eligible count:', err);
      }
    }
    fetchEligibleCount();
  }, [selectedInstitutionId, selectedDepartmentId]);

  // Update department selection when institution changes
  const handleInstitutionChange = (instId: string) => {
    setSelectedInstitutionId(instId);
    const inst = institutions.find(i => i.id === instId);
    if (inst && inst.departments && inst.departments.length > 0) {
      setSelectedDepartmentId(inst.departments[0].id);
    } else {
      setSelectedDepartmentId('');
    }
  };

  // Generate Questions via AI
  const handleAiGenerate = async () => {
    if (!topic.trim()) {
      alert('Topic is required.');
      return;
    }
    const countNum = parseInt(questionCount);
    if (isNaN(countNum) || countNum < 1 || countNum > 50) {
      alert('Number of questions must be between 1 and 50.');
      return;
    }
    if (easyPct + mediumPct + hardPct !== 100) {
      alert('Difficulty percentages must total 100%.');
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/v1/faculty/exams/generate-ai', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          topic,
          count: countNum,
          question_type: questionType,
          easy_pct: easyPct,
          medium_pct: mediumPct,
          hard_pct: hardPct,
          marks_per_question: marksPerQuestion
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Map backend response questions safely converting objects/arrays to strings
        const mapped: QuestionData[] = data.questions.map((q: any) => ({
          prompt: typeof q.prompt === 'string' ? q.prompt : JSON.stringify(q.prompt),
          difficulty: q.difficulty || 'MEDIUM',
          question_type: q.question_type || 'MCQ',
          marks: q.marks !== undefined ? Number(q.marks) : (marksPerQuestion || (parseFloat(totalMarks) / countNum)),
          options: Array.isArray(q.options) ? q.options : [],
          explanation: typeof q.explanation === 'object' ? JSON.stringify(q.explanation) : String(q.explanation || ''),
          co: q.co || 'CO1',
          bloom_level: q.bloom_level || 'UNDERSTAND',
          topic: typeof q.topic === 'object' ? JSON.stringify(q.topic) : String(q.topic || topic),
          rubric: typeof q.rubric === 'object' ? JSON.stringify(q.rubric, null, 2) : String(q.rubric || '')
        }));
        setQuestions(mapped);
        setStep(2);
      } else {
        let msg = 'Failed to generate questions. Check topic keyword distributions.';
        try {
          const data = await res.json();
          if (data && data.detail) {
            msg = `AI Generation Failed: ${data.detail}`;
          } else if (data && data.message) {
            msg = `AI Generation Failed: ${data.message}`;
          }
        } catch (e) {}
        alert(msg);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while requesting AI question generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save changes for editing a single question
  const startEditing = (idx: number) => {
    setEditingIdx(idx);
    setEditPrompt(questions[idx].prompt);
    setEditDifficulty(questions[idx].difficulty);
    setEditMarks(questions[idx].marks);
    setEditOptions(questions[idx].options.map(o => ({ ...o })));
    setEditExplanation(questions[idx].explanation || '');
    setEditCo(questions[idx].co || 'CO1');
    setEditBloomLevel(questions[idx].bloom_level || 'UNDERSTAND');
    setEditTopic(questions[idx].topic || '');
    setEditRubric(questions[idx].rubric || '');
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    const updated = [...questions];
    updated[editingIdx] = {
      ...updated[editingIdx],
      prompt: editPrompt,
      difficulty: editDifficulty,
      marks: editMarks,
      options: editOptions,
      explanation: editExplanation,
      co: editCo,
      bloom_level: editBloomLevel,
      topic: editTopic,
      rubric: editRubric
    };
    setQuestions(updated);
    setEditingIdx(null);
  };

  const deleteQuestion = (idx: number) => {
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    if (editingIdx === idx) setEditingIdx(null);
  };

  const addNewQuestion = (specificMarks?: number) => {
    const markValue = specificMarks !== undefined ? specificMarks : (marksPerQuestion || 2);
    const newQ: QuestionData = {
      prompt: `New ${markValue}-Mark Question Prompt Description Here`,
      difficulty: 'MEDIUM',
      question_type: questionType === 'Theory' ? 'Theory' : 'MCQ',
      marks: markValue,
      options: questionType === 'Theory' ? [] : [
        { option_text: 'A) Option A Text', is_correct: true },
        { option_text: 'B) Option B Text', is_correct: false },
        { option_text: 'C) Option C Text', is_correct: false },
        { option_text: 'D) Option D Text', is_correct: false }
      ],
      explanation: 'Explanation of the correct answer and evaluation scheme.',
      co: 'CO1',
      bloom_level: markValue <= 2 ? 'REMEMBER' : (markValue <= 5 ? 'UNDERSTAND' : 'ANALYZE'),
      topic: topic,
      rubric: markValue > 2 ? `Evaluation Scheme (${markValue} Marks):\n- Definition & Key Concepts: ${Math.ceil(markValue * 0.4)}M\n- Explanation / Diagram: ${Math.floor(markValue * 0.6)}M` : ''
    };
    setQuestions([...questions, newQ]);
    startEditing(questions.length);
  };

  // Submit and Publish
  const handlePublishAndAssign = async () => {
    if (!selectedSubjectId) {
      alert('Subject is required.');
      return;
    }
    if (questions.length === 0) {
      alert('You must have at least one question accepted for this exam.');
      return;
    }
    setIsSaving(true);
    try {
      // 1. Create Exam Draft with Cohort Targeting
      const createRes = await fetch('/api/v1/faculty/exams', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: examTitle,
          subject_id: selectedSubjectId,
          exam_type: examType,
          duration_minutes: parseInt(duration),
          total_marks: parseFloat(totalMarks),
          target_batch: targetBatch || undefined,
          target_semester: targetSemester !== '' ? Number(targetSemester) : undefined,
          target_department_id: selectedDepartmentId || undefined,
          description: `AI-Powered Exam created automatically covering topic: ${topic}`,
          questions: questions.map(q => ({
            prompt: q.prompt,
            question_type: q.question_type,
            difficulty: q.difficulty,
            marks: q.marks,
            explanation: q.explanation || '',
            rubric: q.rubric || '',
            topic: (q as any).topic || topic || 'Core Subject Concepts',
            co: (q as any).co || 'CO1',
            bloom_level: (q as any).bloom_level || 'UNDERSTAND',
            options: q.options.map(o => ({
              option_text: o.option_text,
              is_correct: o.is_correct
            }))
          }))
        })
      });

      if (!createRes.ok) {
        throw new Error('Failed to create examination blueprint.');
      }
      const createdExam = await createRes.json();

      const getValidISO = (val: string, fallbackHours: number = 0) => {
        try {
          const d = new Date(val);
          if (!isNaN(d.getTime())) return d.toISOString();
        } catch {}
        return new Date(Date.now() + fallbackHours * 3600 * 1000).toISOString();
      };

      const validStartISO = getValidISO(startDate, 0);
      const validEndISO = getValidISO(endDate, 24 * 7);
      const targetInstId = selectedInstitutionId || (institutions.length > 0 ? institutions[0].id : undefined);
      const targetDeptId = selectedDepartmentId || (institutions[0]?.departments?.length ? institutions[0].departments[0].id : undefined);

      // Ensure persistent blueprint sync with core cohort endpoint
      try {
        await fetch('/api/v1/examinations/create', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: examTitle,
            subject_id: selectedSubjectId,
            exam_type: examType === 'Internal' ? 'MID_TERM' : 'END_SEMESTER',
            duration_minutes: parseInt(duration) || 90,
            total_marks: parseFloat(totalMarks) || 100,
            start_time: validStartISO,
            end_time: validEndISO,
            is_published: true,
            target_batch: targetBatch || undefined,
            target_semester: targetSemester !== '' ? Number(targetSemester) : undefined,
            target_department_id: targetDeptId,
          })
        });
      } catch (syncErr) {
        console.warn('Core blueprint sync noted:', syncErr);
      }

      // 2. Assign Exam to Student Group
      const assignRes = await fetch(`/api/v1/faculty/exams/${createdExam.id}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          institution_id: targetInstId,
          department_id: targetDeptId,
          target_batch: targetBatch || undefined,
          target_semester: targetSemester !== '' ? Number(targetSemester) : undefined,
          assign_to: assignTo,
          start_time: validStartISO,
          end_time: validEndISO
        })
      });

      router.push('/faculty/examinations');
    } catch (err: any) {
      console.error(err);
      router.push('/faculty/examinations');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedInst = institutions.find(i => i.id === selectedInstitutionId);
  const departments = selectedInst?.departments || [];

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bot className="w-8 h-8 text-indigo-600" />
              🤖 AI Exam Generator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create balanced examination papers dynamically with AI assistance.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/faculty/examinations')} className="text-xs font-bold">
            ← Back to Examinations
          </Button>
        </div>

        {/* Dynamic Wizard Stepper Bar */}
        <div className="grid grid-cols-3 gap-2 text-xs font-bold">
          {[
            { num: 1, label: '1. EXAM DETAILS' },
            { num: 2, label: '2. REVIEW AI QUESTIONS' },
            { num: 3, label: '3. PUBLISH & ASSIGN' },
          ].map((st) => (
            <div
              key={st.num}
              className={`p-3 rounded-xl border text-center transition-all ${
                step === st.num
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : step > st.num
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-card text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>{st.label}</div>
            </div>
          ))}
        </div>

        {/* STEP 1: Exam Details & AI Settings Form */}
        {step === 1 && (
          <Card className="border shadow-lg">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" /> EXAM DETAILS & AI GENERATION SETTINGS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Exam Title *</label>
                  <input
                    type="text"
                    required
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="e.g. AI Internal Assessment - 1"
                    className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Subject *</label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Exam Type *</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                    >
                      <option value="Internal">Internal Assessment</option>
                      <option value="MID_TERM">Mid Term Exam</option>
                      <option value="END_SEMESTER">End Semester Exam</option>
                      <option value="Practice">Practice Assessment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Duration (Minutes) *</label>
                    <input
                      type="number"
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Total Marks *</label>
                    <input
                      type="number"
                      required
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* 1-Click Quick Presets for 2-Mark and 5-Mark Bundles */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    ⚡ Quick Test Presets (1-Click Setup)
                  </span>
                  <span className="text-[11px] text-slate-400">Instantly sets question count, marks, and rubric</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset(10, 2, 'MCQ')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      questionCount === '10' && marksPerQuestion === 2 && questionType === 'MCQ'
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-card text-foreground'
                    }`}
                  >
                    <div className="font-bold text-xs">10 Qs × 2 Marks</div>
                    <div className="text-[10px] opacity-80">20 Marks • MCQ Test</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset(20, 2, 'MCQ')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      questionCount === '20' && marksPerQuestion === 2 && questionType === 'MCQ'
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-card text-foreground'
                    }`}
                  >
                    <div className="font-bold text-xs">20 Qs × 2 Marks</div>
                    <div className="text-[10px] opacity-80">40 Marks • Comprehensive 2M</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset(5, 5, 'Theory')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      questionCount === '5' && marksPerQuestion === 5 && questionType === 'Theory'
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-card text-foreground'
                    }`}
                  >
                    <div className="font-bold text-xs">5 Qs × 5 Marks</div>
                    <div className="text-[10px] opacity-80">25 Marks • Analytical Theory</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset(10, 5, 'Theory')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      questionCount === '10' && marksPerQuestion === 5 && questionType === 'Theory'
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-card text-foreground'
                    }`}
                  >
                    <div className="font-bold text-xs">10 Qs × 5 Marks</div>
                    <div className="text-[10px] opacity-80">50 Marks • Full Assessment</div>
                  </button>
                </div>
              </div>

              <div className="p-5 border border-indigo-500/20 bg-indigo-500/5 rounded-xl space-y-4">
                <h3 className="font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 text-sm">
                  <Bot className="w-5 h-5" /> AI QUESTION SETTINGS
                </h3>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Topic/Subject for Questions:</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Example: Neural Networks, CNN, Backpropagation"
                    className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Specify topics separated by commas for custom generation targeting course outcome goals.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Number of Questions:</label>
                    <select
                      value={questionCount}
                      onChange={(e) => {
                        const count = e.target.value;
                        setQuestionCount(count);
                        if (marksPerQuestion) {
                          setTotalMarks(String(parseInt(count) * marksPerQuestion));
                        }
                      }}
                      className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                    >
                      <option value="5">5 Questions</option>
                      <option value="10">10 Questions (Recommended)</option>
                      <option value="15">15 Questions</option>
                      <option value="20">20 Questions</option>
                      <option value="25">25 Questions</option>
                      <option value="30">30 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Marks per Question:</label>
                    <select
                      value={marksPerQuestion}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMarksPerQuestion(val);
                        setTotalMarks(String(parseInt(questionCount) * val));
                      }}
                      className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                    >
                      <option value={2}>2 Marks (Short Answer / Objective)</option>
                      <option value={5}>5 Marks (Analytical / Conceptual)</option>
                      <option value={10}>10 Marks (Comprehensive / Essay)</option>
                      <option value={1}>1 Mark (Quick Objective)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Question Type:</label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                    >
                      <option value="MCQ">Multiple Choice Questions (MCQ)</option>
                      <option value="Theory">Theory (Written Response)</option>
                      <option value="Handwritten">Handwritten Sheets Upload</option>
                      <option value="Mixed">Mixed Formats</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                    🎯 Exam Blueprint: <strong className="font-bold">{questionCount} Questions</strong> × <strong className="font-bold">{marksPerQuestion} Marks Each</strong> = <strong className="font-bold text-indigo-600 dark:text-indigo-400">{parseInt(questionCount) * marksPerQuestion} Total Marks</strong>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Difficulty: {easyPct}% Easy | {mediumPct}% Med | {hardPct}% Hard
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">Difficulty Distribution:</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400">Easy (%):</span>
                      <input
                        type="number"
                        value={easyPct}
                        onChange={(e) => setEasyPct(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 p-2 rounded-lg border bg-background text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Medium (%):</span>
                      <input
                        type="number"
                        value={mediumPct}
                        onChange={(e) => setMediumPct(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 p-2 rounded-lg border bg-background text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Hard (%):</span>
                      <input
                        type="number"
                        value={hardPct}
                        onChange={(e) => setHardPct(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 p-2 rounded-lg border bg-background text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleAiGenerate}
                  disabled={isGenerating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6"
                >
                  {isGenerating ? 'Generating with AI...' : `🤖 GENERATE ${questionCount} × ${marksPerQuestion}M QUESTIONS WITH AI`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Review Generated Questions */}
        {step === 2 && (
          <Card className="border shadow-lg">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <span>📝 REVIEW GENERATED QUESTIONS ({questions.length} questions • {questions.reduce((acc, q) => acc + (Number(q.marks) || 0), 0)} Marks Total)</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => addNewQuestion(2)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> + 2-Mark Q
                  </Button>
                  <Button size="sm" onClick={() => addNewQuestion(5)} className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> + 5-Mark Q
                  </Button>
                  <Button size="sm" onClick={() => addNewQuestion()} className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 font-bold flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> + Add More
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-xs">
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-card space-y-3 shadow-sm relative">
                    {editingIdx === idx ? (
                      // Edit Mode Workspace
                      <div className="space-y-3 bg-muted/30 p-3 rounded-lg border">
                        <div>
                          <label className="font-bold">Prompt Description:</label>
                          <textarea
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            rows={3}
                            className="w-full p-2 mt-1 rounded border bg-background font-semibold"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-bold">Difficulty:</label>
                            <select
                              value={editDifficulty}
                              onChange={(e) => setEditDifficulty(e.target.value)}
                              className="w-full p-2 mt-1 rounded border bg-background font-semibold"
                            >
                              <option value="EASY">Easy</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HARD">Hard</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-bold">Marks:</label>
                            <input
                              type="number"
                              value={editMarks}
                              onChange={(e) => setEditMarks(parseFloat(e.target.value) || 0)}
                              className="w-full p-2 mt-1 rounded border bg-background font-semibold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="font-bold">Course Outcome (CO):</label>
                            <input
                              type="text"
                              value={editCo}
                              onChange={(e) => setEditCo(e.target.value)}
                              placeholder="e.g. CO1"
                              className="w-full p-2 mt-1 rounded border bg-background font-semibold"
                            />
                          </div>
                          <div>
                            <label className="font-bold">Bloom Taxonomy Level:</label>
                            <select
                              value={editBloomLevel}
                              onChange={(e) => setEditBloomLevel(e.target.value)}
                              className="w-full p-2 mt-1 rounded border bg-background font-semibold"
                            >
                              <option value="REMEMBER">Remember</option>
                              <option value="UNDERSTAND">Understand</option>
                              <option value="APPLY">Apply</option>
                              <option value="ANALYZE">Analyze</option>
                              <option value="EVALUATE">Evaluate</option>
                              <option value="CREATE">Create</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-bold">Topic:</label>
                            <input
                              type="text"
                              value={editTopic}
                              onChange={(e) => setEditTopic(e.target.value)}
                              className="w-full p-2 mt-1 rounded border bg-background font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold">Explanation / Reference Answer:</label>
                          <textarea
                            value={editExplanation}
                            onChange={(e) => setEditExplanation(e.target.value)}
                            rows={2}
                            placeholder="Provide correct answer derivation or reference evaluation details..."
                            className="w-full p-2 mt-1 rounded border bg-background font-semibold"
                          />
                        </div>

                        {q.question_type !== 'MCQ' && (
                          <div>
                            <label className="font-bold">Evaluation Rubric (JSON representation):</label>
                            <textarea
                              value={editRubric}
                              onChange={(e) => setEditRubric(e.target.value)}
                              rows={2}
                              placeholder='e.g. [{"criterion": "Concept", "max_score": 3.0}]'
                              className="w-full p-2 mt-1 rounded border bg-background font-mono text-xs font-semibold"
                            />
                          </div>
                        )}

                        {q.question_type === 'MCQ' && editOptions.length > 0 && (
                          <div className="space-y-2 mt-2">
                            <label className="font-bold">MCQ Options:</label>
                            {editOptions.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name={`edit-correct-${idx}`}
                                  checked={opt.is_correct}
                                  onChange={() => {
                                    const opts = editOptions.map((o, oi) => ({ ...o, is_correct: oi === oIdx }));
                                    setEditOptions(opts);
                                  }}
                                />
                                <input
                                  type="text"
                                  value={opt.option_text}
                                  onChange={(e) => {
                                    const opts = [...editOptions];
                                    opts[oIdx].option_text = e.target.value;
                                    setEditOptions(opts);
                                  }}
                                  className="w-full p-1.5 rounded border bg-background text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-end space-x-2 pt-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingIdx(null)}>Cancel</Button>
                          <Button size="sm" onClick={saveEdit} className="bg-indigo-600 text-white flex items-center gap-1">
                            <Save className="w-3.5 h-3.5" /> Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Render Mode View
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                              Q{idx + 1} [{q.question_type} - {q.difficulty}]
                            </span>
                            <span className="ml-2 font-mono text-[10px] text-slate-500 font-bold">Marks: {q.marks}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="ghost" onClick={() => startEditing(idx)} className="text-slate-400 hover:text-indigo-600">
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteQuestion(idx)} className="text-slate-400 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <p className="font-semibold text-slate-900 dark:text-slate-100 mt-2">{q.prompt}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 font-mono text-[10px] text-slate-500 font-bold bg-muted/20 p-2 rounded">
                          <div>CO: {q.co || 'CO1'}</div>
                          <div>Bloom: {q.bloom_level || 'UNDERSTAND'}</div>
                          <div>Topic: {q.topic || 'General'}</div>
                          <div>Type: {q.question_type}</div>
                        </div>

                        {q.explanation && (
                          <div className="mt-2 text-[10px] text-slate-500 bg-muted/40 p-2 rounded">
                            <span className="font-bold">Explanation/Answer:</span> {q.explanation}
                          </div>
                        )}

                        {q.rubric && (
                          <div className="mt-2 text-[10px] text-slate-500 bg-muted/40 p-2 rounded">
                            <span className="font-bold">Grading Rubric:</span> <code className="text-[10px] whitespace-pre-wrap">{typeof q.rubric === 'object' ? JSON.stringify(q.rubric, null, 2) : String(q.rubric)}</code>
                          </div>
                        )}

                        {q.question_type === 'MCQ' && q.options && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pl-2">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`p-2 rounded border text-xs flex justify-between ${
                                  opt.is_correct 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300 font-bold' 
                                    : 'border-slate-100 bg-slate-50/50 dark:border-slate-800/40'
                                }`}
                              >
                                <span>{opt.option_text}</span>
                                {opt.is_correct && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setStep(1)} className="text-xs font-bold">
                  ← Back to Settings
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleAiGenerate} disabled={isGenerating} className="text-xs font-bold border-indigo-600 text-indigo-600">
                    Regenerate Questions
                  </Button>
                  <Button onClick={() => setStep(3)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6">
                    Accept All & Assign →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Assign to Students */}
        {step === 3 && (
          <Card className="border shadow-lg">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" /> ASSIGN EXAM TO STUDENTS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-xs">
              <div className="space-y-4">
                <div className="p-3 bg-muted/30 border rounded-lg">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Exam: {examTitle}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Total Questions: {questions.length} | Target Score: {totalMarks} Marks | Duration: {duration} Mins</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Institution *</label>
                  <select
                    value={selectedInstitutionId}
                    onChange={(e) => handleInstitutionChange(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                  >
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Department *</label>
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2026 Academic Anchor Matrix Cohort Target Selector */}
                <FacultyExamTargetingConfigurator
                  selectedBatch={targetBatch}
                  onBatchChange={setTargetBatch}
                  selectedSemester={targetSemester}
                  onSemesterChange={setTargetSemester}
                />

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Assign to *</label>
                  <select
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                  >
                    <option value="Entire Class">Entire Class (Notify matching institution + department students)</option>
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                  </select>
                </div>

                {eligibleCount !== null && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg font-bold">
                    👥 Eligible Students: {eligibleCount} found
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setStep(2)} className="text-xs font-bold">
                  ← Back to Questions
                </Button>
                <Button
                  onClick={handlePublishAndAssign}
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6"
                >
                  {isSaving ? 'Publishing...' : '📢 PUBLISH & ASSIGN EXAM'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
