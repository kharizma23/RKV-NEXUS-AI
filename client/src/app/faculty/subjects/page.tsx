'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/providers/auth-provider';
import { X, Plus, BookOpen, Layers, Brain, FileText, BarChart3, Trophy, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface Topic {
  id: string;
  topic_number: number;
  title: string;
  description?: string;
}

interface Unit {
  id: string;
  unit_number: number;
  title: string;
  description?: string;
  weightage: number;
  topics: Topic[];
}

interface CourseOutcome {
  id: string;
  code: string;
  statement: string;
  bloom_level: string;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  subject_type: string;
  units: Unit[];
  course_outcomes: CourseOutcome[];
}

interface Assignment {
  id: string;
  role_in_subject: string;
  subject: Subject;
}

type ModalType = 'unit' | 'topic' | null;

export default function FacultySubjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [activeSubjectId, setActiveSubjectId] = useState<string>('');
  const [activeSubjectName, setActiveSubjectName] = useState<string>('');
  const [activeUnits, setActiveUnits] = useState<Unit[]>([]);

  // Unit form state
  const [unitNumber, setUnitNumber] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [unitDesc, setUnitDesc] = useState('');
  const [unitWeightage, setUnitWeightage] = useState('20');

  // Topic form state
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [topicNumber, setTopicNumber] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');

  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ['faculty-assigned-subjects'],
    queryFn: async () => {
      const res = await fetch('/api/v1/academics/faculty-assignments/my');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (payload: object) =>
      apiClient('/syllabus/units', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-assigned-subjects'] });
      closeModal();
    },
  });

  const createTopicMutation = useMutation({
    mutationFn: async (payload: object) =>
      apiClient('/syllabus/topics', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-assigned-subjects'] });
      closeModal();
    },
  });

  const openModal = (type: ModalType, subject: Subject) => {
    setModalType(type);
    setActiveSubjectId(subject.id);
    setActiveSubjectName(subject.name);
    setActiveUnits(subject.units || []);
    // Reset forms
    setUnitNumber('');
    setUnitTitle('');
    setUnitDesc('');
    setUnitWeightage('20');
    setSelectedUnitId('');
    setTopicNumber('');
    setTopicTitle('');
    setTopicDesc('');
  };

  const closeModal = () => {
    setModalType(null);
    setActiveSubjectId('');
  };

  const handleSubmitUnit = () => {
    if (!unitTitle || !unitNumber) return;
    createUnitMutation.mutate({
      subject_id: activeSubjectId,
      unit_number: parseInt(unitNumber),
      title: unitTitle,
      description: unitDesc || null,
      weightage: parseFloat(unitWeightage) || 20,
    });
  };

  const handleSubmitTopic = () => {
    if (!topicTitle || !topicNumber || !selectedUnitId) return;
    createTopicMutation.mutate({
      unit_id: selectedUnitId,
      topic_number: parseInt(topicNumber),
      title: topicTitle,
      description: topicDesc || null,
    });
  };

  const isPending = createUnitMutation.isPending || createTopicMutation.isPending;

  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<{
    name: string;
    code: string;
    sem: number;
    students: number;
    avgScore: number;
    topScore: number;
    atRisk: number;
  } | null>({
    name: 'Artificial Intelligence',
    code: 'CS2026',
    sem: 7,
    students: 45,
    avgScore: 72,
    topScore: 95,
    atRisk: 5,
  });

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-500" />
              <span>Assigned Subjects & Syllabus Management</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Faculty: {user?.full_name} {user?.faculty_profile?.designation ? `• ${user.faculty_profile.designation}` : ''}
            </p>
          </div>
        </div>

        {/* Selected Subject Dashboard Banner */}
        {selectedSubjectDetail && (
          <Card className="border shadow-lg bg-card">
            <CardHeader className="py-4 border-b bg-muted/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-foreground flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-500" />
                  <span>{selectedSubjectDetail.name} ({selectedSubjectDetail.code}) — Subject Dashboard</span>
                </CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">Semester {selectedSubjectDetail.sem} • Total Enrolled Students: {selectedSubjectDetail.students}</p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => window.location.href = '/faculty/examinations/create'} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                  + Create Exam
                </Button>
                <Button size="sm" variant="outline" onClick={() => alert("Report exported!")} className="text-xs font-bold border-slate-700">
                  Export Report
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Subject Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl border bg-muted/10 text-center">
                  <span className="text-xs text-muted-foreground font-bold">Total Exams</span>
                  <div className="text-2xl font-black text-foreground font-mono">3</div>
                </div>
                <div className="p-3.5 rounded-xl border bg-muted/10 text-center">
                  <span className="text-xs text-muted-foreground font-bold">Avg Score</span>
                  <div className="text-2xl font-black text-indigo-500 font-mono">72%</div>
                </div>
                <div className="p-3.5 rounded-xl border bg-muted/10 text-center">
                  <span className="text-xs text-muted-foreground font-bold">Top Score</span>
                  <div className="text-2xl font-black text-emerald-500 font-mono">95%</div>
                </div>
                <div className="p-3.5 rounded-xl border bg-muted/10 text-center">
                  <span className="text-xs text-muted-foreground font-bold">At-Risk Students</span>
                  <div className="text-2xl font-black text-rose-500 font-mono">5</div>
                </div>
              </div>

              {/* Subject Exams & Student Performance Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Exams List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>Exams For This Subject</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl border bg-card flex justify-between items-center">
                      <div>
                        <p className="font-bold text-foreground">1. Internal Assessment - 1</p>
                        <p className="text-[11px] text-muted-foreground">Due: Aug 20, 2026 • Submissions: 45/45</p>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                    </div>

                    <div className="p-3 rounded-xl border bg-card flex justify-between items-center">
                      <div>
                        <p className="font-bold text-foreground">2. Internal Assessment - 2</p>
                        <p className="text-[11px] text-muted-foreground">Due: Sep 15, 2026 • 10 Questions</p>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Draft</span>
                    </div>

                    <div className="p-3 rounded-xl border bg-card flex justify-between items-center">
                      <div>
                        <p className="font-bold text-foreground">3. Final Comprehensive Exam</p>
                        <p className="text-[11px] text-muted-foreground">Due: Nov 20, 2026</p>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded">Planned</span>
                    </div>
                  </div>
                </div>

                {/* Student Performance Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    <span>Student Performance Ranks</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      { rank: '#1', name: 'Dharshini', score: '95%', status: 'Excellent', color: 'text-emerald-500', isTop: true },
                      { rank: '#2', name: 'Kharizma', score: '88%', status: 'Good', color: 'text-emerald-500', isTop: true },
                      { rank: '#3', name: 'Priya', score: '82%', status: 'Improving', color: 'text-indigo-500', isTop: true },
                      { rank: '#4', name: 'Rahul', score: '45%', status: 'Needs Help', color: 'text-amber-500', isTop: false },
                      { rank: '#5', name: 'Sita', score: '38%', status: 'Critical', color: 'text-rose-500', isTop: false },
                    ].map((st, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border bg-card flex justify-between items-center font-semibold">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${st.isTop ? 'bg-indigo-500/10 text-indigo-500 font-bold' : 'text-muted-foreground'}`}>{st.rank}</span>
                          <span>{st.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-foreground">{st.score}</span>
                          <span className={`text-[10px] font-bold ${st.color}`}>{st.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-slate-500">Loading assigned subjects...</div>
        ) : assignments.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No active subject assignments found for your faculty account. Contact your administrator to assign subjects.
          </Card>
        ) : (
          assignments.map((asgn) => {
            const subj = asgn.subject;
            if (!subj) return null;
            return (
              <Card key={asgn.id} className="border-indigo-100 dark:border-indigo-900/30">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 rounded-md bg-indigo-600 text-white font-mono text-sm font-bold">
                        {subj.code}
                      </span>
                      <CardTitle className="text-xl">{subj.name}</CardTitle>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Role: <span className="font-semibold text-slate-700 dark:text-slate-300">{asgn.role_in_subject}</span> | Type: {subj.subject_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal('topic', subj)}
                      className="text-xs border-slate-300 dark:border-slate-700"
                    >
                      <Layers className="w-3.5 h-3.5 mr-1" /> + Add Topic
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openModal('unit', subj)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1" /> + Add Unit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Syllabus Units & Topics Tree */}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Syllabus Units &amp; Topics ({subj.units?.length || 0} Units)
                    </h3>
                    {!subj.units || subj.units.length === 0 ? (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-500 text-center border border-dashed border-slate-300 dark:border-slate-700">
                        No units added yet. Click &ldquo;+ Add Unit&rdquo; to author your first syllabus unit.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {subj.units.map((unit) => (
                          <div key={unit.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                Unit {unit.unit_number}: {unit.title}
                              </div>
                              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                                Weightage: {unit.weightage}%
                              </span>
                            </div>
                            {unit.description && (
                              <p className="text-xs text-slate-500 mb-3">{unit.description}</p>
                            )}

                            {/* Topics List */}
                            {unit.topics && unit.topics.length > 0 ? (
                              <div className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-800 space-y-1.5 mt-2">
                                {unit.topics.map((topic) => (
                                  <div key={topic.id} className="text-xs flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                                      Topic {unit.unit_number}.{topic.topic_number}:
                                    </span>
                                    <span>{topic.title}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 pl-4 mt-1">No topics added. Click &ldquo;+ Add Topic&rdquo; to add topics to this unit.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Course Outcomes (COs) */}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Course Outcomes (COs) &amp; Bloom's Taxonomy
                    </h3>
                    {!subj.course_outcomes || subj.course_outcomes.length === 0 ? (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-500 text-center border border-dashed border-slate-300 dark:border-slate-700">
                        No Course Outcomes mapped yet. Contact admin to add COs for this subject.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subj.course_outcomes.map((co) => (
                          <div key={co.id} className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{co.code}</span>
                              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300">
                                Bloom: {co.bloom_level}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {co.statement}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

      {/* Add Unit / Topic Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl border bg-card animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                {modalType === 'unit' ? <BookOpen className="w-4 h-4 text-primary" /> : <Layers className="w-4 h-4 text-primary" />}
                {modalType === 'unit' ? 'Add New Syllabus Unit' : 'Add New Topic to Unit'}
              </h3>
              <p className="text-xs text-muted-foreground mr-4 truncate max-w-[180px]">{activeSubjectName}</p>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {modalType === 'unit' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit Number *</label>
                      <Input
                        type="number"
                        placeholder="e.g. 1"
                        value={unitNumber}
                        onChange={e => setUnitNumber(e.target.value)}
                        min={1}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weightage (%)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 20"
                        value={unitWeightage}
                        onChange={e => setUnitWeightage(e.target.value)}
                        min={1}
                        max={100}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit Title *</label>
                    <Input
                      placeholder="e.g. Arrays, Stacks & Queues"
                      value={unitTitle}
                      onChange={e => setUnitTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                    <textarea
                      placeholder="Brief description of topics covered in this unit..."
                      value={unitDesc}
                      onChange={e => setUnitDesc(e.target.value)}
                      rows={3}
                      className="w-full text-sm bg-background border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Unit *</label>
                    <select
                      value={selectedUnitId}
                      onChange={e => setSelectedUnitId(e.target.value)}
                      className="w-full text-sm bg-background border rounded-md p-2.5"
                    >
                      <option value="">-- Choose parent unit --</option>
                      {activeUnits.map(u => (
                        <option key={u.id} value={u.id}>Unit {u.unit_number}: {u.title}</option>
                      ))}
                    </select>
                    {activeUnits.length === 0 && (
                      <p className="text-xs text-amber-600">No units yet. Add a unit first before adding topics.</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic Number *</label>
                    <Input
                      type="number"
                      placeholder="e.g. 1"
                      value={topicNumber}
                      onChange={e => setTopicNumber(e.target.value)}
                      min={1}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic Title *</label>
                    <Input
                      placeholder="e.g. Binary Search Trees & In-Order Traversal"
                      value={topicTitle}
                      onChange={e => setTopicTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                    <textarea
                      placeholder="What will students learn in this topic..."
                      value={topicDesc}
                      onChange={e => setTopicDesc(e.target.value)}
                      rows={2}
                      className="w-full text-sm bg-background border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </>
              )}

              {(createUnitMutation.isError || createTopicMutation.isError) && (
                <p className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                  Failed to save. Please check your inputs and try again.
                </p>
              )}
            </div>

            <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={closeModal} disabled={isPending}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isPending || (modalType === 'unit' ? (!unitTitle || !unitNumber) : (!topicTitle || !topicNumber || !selectedUnitId))}
                onClick={modalType === 'unit' ? handleSubmitUnit : handleSubmitTopic}
                className="bg-primary text-primary-foreground"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {isPending ? 'Saving...' : modalType === 'unit' ? 'Create Unit' : 'Add Topic'}
              </Button>
            </div>
          </Card>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
