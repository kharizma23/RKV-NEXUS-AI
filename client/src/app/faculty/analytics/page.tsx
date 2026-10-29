'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Target, Sparkles, Download, CheckCircle2, AlertTriangle, FileText,
  ShieldAlert, BarChart3, Calendar, Bot, Users, CheckSquare, Layers,
  Search, RefreshCw, Clock, ArrowRight, Eye, Send, FileCheck, Check,
  MessageSquare, Brain, Network, Kanban, Grid, Cpu, UserCheck, Flame
} from 'lucide-react';

export default function FacultyAnalyticsPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('CS2026');
  const [activeModuleTab, setActiveModuleTab] = useState<string>('PO_MAPPING');

  // Kanban Action Plan Cards State (Module 5)
  const [kanbanTasks, setKanbanTasks] = useState([
    { id: 'k1', title: 'Remedial Class on CO3 Machine Learning', status: 'PLANNED', priority: 'HIGH', students: 5, date: 'Aug 26' },
    { id: 'k2', title: 'Upload Neural Networks Practice Quiz', status: 'IN_PROGRESS', priority: 'MEDIUM', students: 45, date: 'Aug 24' },
    { id: 'k3', title: 'CO1 Search Algorithms Revision Workshop', status: 'IMPLEMENTED', priority: 'LOW', students: 12, date: 'Aug 18' },
  ]);

  // Adaptive Question Generator State (Module 2)
  const [selectedCoGen, setSelectedCoGen] = useState('CO3');
  const [generatedQuestionsList, setGeneratedQuestionsList] = useState<any[]>([]);

  // Smart Rubric Auto-Grader State (Module 7)
  const [rubricText, setRubricText] = useState(
    'Deep learning uses neural networks with input, hidden, and output layers. Convolutional layers extract visual features.'
  );
  const [rubricEvaluationResult, setRubricEvaluationResult] = useState<any | null>(null);

  // Kanban Handlers
  const moveTask = (id: string, newStatus: string) => {
    setKanbanTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const handleAddNewRemedialCard = () => {
    const newTask = {
      id: 'k_' + Date.now(),
      title: 'Remedial Tutorial for CO3 Low Performers',
      status: 'PLANNED',
      priority: 'HIGH',
      students: 5,
      date: 'Aug 27',
    };
    setKanbanTasks((prev) => [newTask, ...prev]);
    alert('New Remedial Action Plan Card created on the Kanban Board!');
  };

  const handleGenerateAdaptiveQuestions = () => {
    setGeneratedQuestionsList([
      { level: 'L1: Remember', text: 'Define Supervised Learning in Machine Learning.', marks: 2 },
      { level: 'L2: Understand', text: 'Explain the difference between Classification and Regression.', marks: 5 },
      { level: 'L3: Apply', text: 'Calculate the Decision Boundary for a 2D Logistic Regression model.', marks: 10 },
      { level: 'L4: Analyze', text: 'Compare K-Means Clustering and Hierarchical Clustering performance on noisy datasets.', marks: 15 },
      { level: 'L5: Evaluate', text: 'Critique the Overfitting prevention capability of L1 vs L2 Regularization.', marks: 20 },
    ]);
  };

  const handleAutoGradeRubric = () => {
    setRubricEvaluationResult({
      total_score: 9,
      max_score: 10,
      highlights: [
        { phrase: 'neural networks with input, hidden, and output layers', point: '+4 Marks (Architecture correct)' },
        { phrase: 'Convolutional layers extract visual features', point: '+5 Marks (Feature extraction correct)' },
      ],
      ai_comment: 'Student demonstrates strong grasp of Deep Learning layers and CNN feature maps.',
    });
  };

  const handleExportAuditReport = () => {
    const reportText = `NBA / NAAC ACCREDITATION AUDIT REPORT\n` +
      `Subject: Artificial Intelligence (CS2026)\n` +
      `-----------------------------------------------\n` +
      `CO1 Attainment: 82% | CO2 Attainment: 75% | CO3 Attainment: 58% (Action Plan Active) | CO4: 70%\n` +
      `PO1-PO12 Mapping Integrity Score: 94%\n` +
      `Bloom's Taxonomy Distribution: L1(25%), L2(30%), L3(20%), L4(15%), L5(10%)\n`;

    const element = document.createElement('a');
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'NBA_Accreditation_Audit_Report.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-500" />
              🧠 Advanced OBE & Academic Intelligence Control Center
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Course-to-Program Outcome Mapping, Action Plan Kanban, AI Class Sentiment, Early Warning Success Predictor & Bloom's Heatmap.
            </p>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddNewRemedialCard} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm">
              <Kanban className="w-3.5 h-3.5 mr-1" /> + Create Action Plan
            </Button>
            <Button size="sm" onClick={handleExportAuditReport} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm">
              <Download className="w-3.5 h-3.5 mr-1" /> Export Audit PDF
            </Button>
          </div>
        </div>

        {/* Subject Selector Bar */}
        <Card className="p-4 bg-muted/20 border">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-xs text-foreground uppercase tracking-wider">Select Subject:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="px-3 py-2 rounded-lg border bg-background text-foreground text-xs font-bold"
              >
                <option value="CS2026">CS2026: Artificial Intelligence</option>
                <option value="CS2027">CS2027: Machine Learning</option>
                <option value="CS2021">CS2021: Data Structures & Algorithms</option>
              </select>
            </div>

            <div className="text-xs font-semibold text-muted-foreground">
              Department: Computer Science & Engineering • Academic Year 2025-2026
            </div>
          </div>
        </Card>

        {/* 🚀 10 UNIQUE MODULE TABS NAVIGATION */}
        <div className="flex overflow-x-auto gap-2 border-b pb-2 text-xs font-bold scrollbar-none">
          {[
            { id: 'PO_MAPPING', label: '🕸️ PO & PSO Mapping', icon: Network },
            { id: 'ACTION_KANBAN', label: '📋 Action Plan Kanban', icon: Kanban },
            { id: 'BLOOMS_HEATMAP', label: '🔥 Bloom\'s Heatmap', icon: Grid },
            { id: 'SENTIMENT_NLP', label: '💬 AI Sentiment Monitor', icon: MessageSquare },
            { id: 'SUCCESS_PREDICTOR', label: '🔮 Success Predictor', icon: ShieldAlert },
            { id: 'ADAPTIVE_QGEN', label: '✍️ Adaptive Q-Gen', icon: Sparkles },
            { id: 'SMART_RUBRIC', label: '📝 Smart Rubric Grader', icon: FileCheck },
            { id: 'CURRICULUM_GAP', label: '📑 Curriculum Gap', icon: Layers },
            { id: 'PEER_360', label: '👥 Peer 360 Review', icon: Users },
            { id: 'VARK_PROFILE', label: '🧠 VARK Learning Styles', icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeModuleTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModuleTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white font-black shadow-md'
                    : 'bg-card border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* MODULE 1: 🕸️ PO & PSO MAPPING MATRIX (Sankey / Network Rollup) */}
        {/* ========================================================================= */}
        {activeModuleTab === 'PO_MAPPING' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <Card className="border shadow-sm">
              <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-500" />
                  🕸️ Course Outcomes (CO) $\rightarrow$ Program Outcomes (PO1-PO12) Mapping Matrix
                </CardTitle>
                <span className="text-xs font-bold text-emerald-500">PO Mapping Integrity: 94.2% (NBA Compliant)</span>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-center border">
                    <thead>
                      <tr className="border-b font-bold text-muted-foreground bg-muted/20 uppercase text-[10px]">
                        <th className="py-2.5 px-3 text-left">Course Outcome</th>
                        <th className="py-2.5 px-2">PO1 (Engg Knowledge)</th>
                        <th className="py-2.5 px-2">PO2 (Problem Analysis)</th>
                        <th className="py-2.5 px-2">PO3 (Design/Dev)</th>
                        <th className="py-2.5 px-2">PO4 (Investigations)</th>
                        <th className="py-2.5 px-2">PO5 (Modern Tools)</th>
                        <th className="py-2.5 px-2">PSO1 (AI Tech)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-semibold">
                      <tr>
                        <td className="py-3 px-3 text-left font-bold text-foreground">CO1: Foundation & Search</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-indigo-500 font-bold">2 (Med)</td>
                        <td className="py-3 px-2 text-muted-foreground">1 (Low)</td>
                        <td className="py-3 px-2 text-indigo-500 font-bold">2 (Med)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-left font-bold text-foreground">CO2: Neural Networks</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-indigo-500 font-bold">2 (Med)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-left font-bold text-foreground">CO3: Machine Learning</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-amber-500 font-bold">1 (Low)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-left font-bold text-foreground">CO4: Deep Learning</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                        <td className="py-3 px-2 text-emerald-500 font-bold">3 (High)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 2: 📋 ACTION PLAN TRACKER (Kanban Board for OBE Remedial Loop) */}
        {/* ========================================================================= */}
        {activeModuleTab === 'ACTION_KANBAN' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-foreground text-sm flex items-center gap-2">
                  <Kanban className="w-4 h-4 text-amber-500" /> OBE Remedial Action Plan Kanban Board
                </h3>
                <p className="text-muted-foreground text-[11px]">Proves to NBA auditors that low CO scores triggered actual remedial interventions.</p>
              </div>

              <Button size="sm" onClick={handleAddNewRemedialCard} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                + Create Action Card
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: PLANNED */}
              <div className="p-4 rounded-xl border bg-muted/10 space-y-3">
                <div className="flex justify-between items-center font-bold border-b pb-2 text-amber-500">
                  <span>📌 PLANNED ({kanbanTasks.filter((t) => t.status === 'PLANNED').length})</span>
                </div>
                {kanbanTasks.filter((t) => t.status === 'PLANNED').map((task) => (
                  <div key={task.id} className="p-3.5 rounded-lg border bg-card space-y-2 shadow-sm">
                    <p className="font-bold text-foreground">{task.title}</p>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Target: {task.students} Students</span>
                      <span>Due: {task.date}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => moveTask(task.id, 'IN_PROGRESS')} className="w-full text-[10px] font-bold h-6">
                      Move to In Progress →
                    </Button>
                  </div>
                ))}
              </div>

              {/* Column 2: IN PROGRESS */}
              <div className="p-4 rounded-xl border bg-muted/10 space-y-3">
                <div className="flex justify-between items-center font-bold border-b pb-2 text-indigo-500">
                  <span>⚡ IN PROGRESS ({kanbanTasks.filter((t) => t.status === 'IN_PROGRESS').length})</span>
                </div>
                {kanbanTasks.filter((t) => t.status === 'IN_PROGRESS').map((task) => (
                  <div key={task.id} className="p-3.5 rounded-lg border bg-card space-y-2 shadow-sm">
                    <p className="font-bold text-foreground">{task.title}</p>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Enrolled: {task.students} Students</span>
                      <span>Due: {task.date}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => moveTask(task.id, 'IMPLEMENTED')} className="w-full text-[10px] font-bold h-6 text-emerald-500">
                      Mark Implemented ✅
                    </Button>
                  </div>
                ))}
              </div>

              {/* Column 3: IMPLEMENTED */}
              <div className="p-4 rounded-xl border bg-muted/10 space-y-3">
                <div className="flex justify-between items-center font-bold border-b pb-2 text-emerald-500">
                  <span>✅ IMPLEMENTED ({kanbanTasks.filter((t) => t.status === 'IMPLEMENTED').length})</span>
                </div>
                {kanbanTasks.filter((t) => t.status === 'IMPLEMENTED').map((task) => (
                  <div key={task.id} className="p-3.5 rounded-lg border bg-card space-y-2 shadow-sm">
                    <p className="font-bold text-foreground">{task.title}</p>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Completed for {task.students} Students</span>
                      <span>Verified: {task.date}</span>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Audit Closed ✅
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 3: 🔥 BLOOM'S TAXONOMY COVERAGE HEATMAP */}
        {/* ========================================================================= */}
        {activeModuleTab === 'BLOOMS_HEATMAP' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <Card className="border shadow-sm">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                  <Grid className="w-4 h-4 text-purple-500" />
                  🔥 Bloom's Cognitive Level Mark Allocation Heatmap (CO vs L1-L6)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-center border">
                    <thead>
                      <tr className="border-b font-bold text-muted-foreground bg-muted/20 uppercase text-[10px]">
                        <th className="py-2.5 px-3 text-left">Course Outcome</th>
                        <th className="py-2.5 px-2">L1: Remember</th>
                        <th className="py-2.5 px-2">L2: Understand</th>
                        <th className="py-2.5 px-2">L3: Apply</th>
                        <th className="py-2.5 px-2">L4: Analyze</th>
                        <th className="py-2.5 px-2">L5: Evaluate</th>
                        <th className="py-2.5 px-2">L6: Create</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-bold">
                      <tr>
                        <td className="py-3 px-3 text-left text-foreground">CO1: Foundation & Search</td>
                        <td className="py-3 px-2 bg-indigo-500/30 text-indigo-300">25 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/40 text-indigo-200">30 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/20 text-indigo-400">15 Marks</td>
                        <td className="py-3 px-2 bg-muted/20 text-muted-foreground">0 Marks</td>
                        <td className="py-3 px-2 bg-muted/20 text-muted-foreground">0 Marks</td>
                        <td className="py-3 px-2 bg-muted/20 text-muted-foreground">0 Marks</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-left text-foreground">CO2: Neural Networks</td>
                        <td className="py-3 px-2 bg-indigo-500/20 text-indigo-400">10 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/30 text-indigo-300">20 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/40 text-indigo-200">35 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/20 text-indigo-400">15 Marks</td>
                        <td className="py-3 px-2 bg-muted/20 text-muted-foreground">0 Marks</td>
                        <td className="py-3 px-2 bg-muted/20 text-muted-foreground">0 Marks</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-left text-foreground">CO3: Machine Learning</td>
                        <td className="py-3 px-2 bg-indigo-500/10 text-indigo-400">5 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/30 text-indigo-300">20 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/40 text-indigo-200">30 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/30 text-indigo-300">20 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/20 text-indigo-400">15 Marks</td>
                        <td className="py-3 px-2 bg-muted/20 text-muted-foreground">0 Marks</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-left text-foreground">CO4: Deep Learning</td>
                        <td className="py-3 px-2 bg-muted/20 text-muted-foreground">0 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/10 text-indigo-400">10 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/30 text-indigo-300">20 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/40 text-indigo-200">25 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/30 text-indigo-300">20 Marks</td>
                        <td className="py-3 px-2 bg-indigo-500/20 text-indigo-400">15 Marks</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 4: 💬 AI SENTIMENT & ENGAGEMENT MONITOR (NLP) */}
        {/* ========================================================================= */}
        {activeModuleTab === 'SENTIMENT_NLP' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <Card className="border shadow-sm">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  💬 Class Discussion & Feedback Sentiment Monitor (NLP Engine)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
                    <span className="font-bold text-emerald-500">Excited / Engaged</span>
                    <div className="text-2xl font-black font-mono text-emerald-500 mt-1">42%</div>
                  </div>
                  <div className="p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/30">
                    <span className="font-bold text-amber-500">Confused (Need Review)</span>
                    <div className="text-2xl font-black font-mono text-amber-500 mt-1">38%</div>
                  </div>
                  <div className="p-3.5 rounded-xl border bg-rose-500/10 border-rose-500/30">
                    <span className="font-bold text-rose-500">Frustrated (Paced Fast)</span>
                    <div className="text-2xl font-black font-mono text-rose-500 mt-1">20%</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-purple-500/5 border-purple-500/20 space-y-2">
                  <p className="font-bold text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> AI Sentiment Correlation Insight:
                  </p>
                  <p className="text-muted-foreground">
                    "Students who expressed confusion in Week 3 regarding Neural Networks backpropagation recorded a <strong>40% lower average score</strong> in Internal Assessment 1. Scheduling a revision session is recommended."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 5: 🔮 SUCCESS PREDICTOR & EARLY WARNING SYSTEM */}
        {/* ========================================================================= */}
        {activeModuleTab === 'SUCCESS_PREDICTOR' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <Card className="border shadow-sm">
              <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  🔮 ML Grade Predictor & Early Warning System (6 Weeks Pre-Finals)
                </CardTitle>
                <span className="text-xs font-bold text-rose-500">2 Students Flagged at Risk of Failure</span>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { name: 'Sita (23CSE005)', grade: 'Predicted Grade: E / FAIL', risk: '88% Fail Risk', att: '65%', color: 'border-rose-500/40 bg-rose-500/5 text-rose-500' },
                  { name: 'Rahul (23CSE004)', grade: 'Predicted Grade: D / AT-RISK', risk: '72% Fail Risk', att: '70%', color: 'border-rose-500/40 bg-rose-500/5 text-rose-500' },
                  { name: 'Priya (23CSE003)', grade: 'Predicted Grade: B', risk: '15% Fail Risk', att: '82%', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-500' },
                  { name: 'Dharshini (23CSE001)', grade: 'Predicted Grade: A+', risk: '1% Fail Risk', att: '98%', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-500' },
                ].map((st, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border flex justify-between items-center ${st.color}`}>
                    <div>
                      <p className="font-bold text-foreground">{st.name}</p>
                      <p className="text-[11px] text-muted-foreground">{st.grade} • Attendance: {st.att}</p>
                    </div>
                    <span className="font-mono font-bold text-xs">{st.risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 6: ✍️ ADAPTIVE QUESTION GENERATOR (L1-L6) */}
        {/* ========================================================================= */}
        {activeModuleTab === 'ADAPTIVE_QGEN' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <Card className="border shadow-sm">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  ✍️ Adaptive Question Generator across Bloom's Levels (L1 to L6)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex gap-3 items-center">
                  <span className="font-bold text-foreground">Select Target CO:</span>
                  <select
                    value={selectedCoGen}
                    onChange={(e) => setSelectedCoGen(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-background text-foreground text-xs font-bold"
                  >
                    <option value="CO1">CO1: Search Algorithms</option>
                    <option value="CO2">CO2: Neural Networks</option>
                    <option value="CO3">CO3: Machine Learning</option>
                    <option value="CO4">CO4: Deep Learning</option>
                  </select>
                  <Button size="sm" onClick={handleGenerateAdaptiveQuestions} className="bg-purple-600 text-white font-bold text-xs">
                    Generate 5 Questions (L1-L6)
                  </Button>
                </div>

                {generatedQuestionsList.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {generatedQuestionsList.map((q, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border bg-card space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-purple-400">{q.level}</span>
                          <span className="font-mono text-emerald-500">{q.marks} Marks</span>
                        </div>
                        <p className="text-foreground">{q.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 7: 📝 SMART RUBRIC BUILDER & AUTO-GRADER */}
        {/* ========================================================================= */}
        {activeModuleTab === 'SMART_RUBRIC' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <Card className="border shadow-sm">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-500" />
                  📝 Smart Rubric Auto-Grader with Sentence Justification
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="font-bold text-foreground">Paste Student Written Answer:</label>
                  <textarea
                    rows={3}
                    value={rubricText}
                    onChange={(e) => setRubricText(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl border bg-background text-foreground text-xs font-mono"
                  />
                </div>

                <Button size="sm" onClick={handleAutoGradeRubric} className="bg-indigo-600 text-white font-bold text-xs">
                  Run Rubric Auto-Grader
                </Button>

                {rubricEvaluationResult && (
                  <div className="p-4 rounded-xl border bg-indigo-500/5 space-y-3">
                    <div className="flex justify-between font-bold">
                      <span>Evaluated Score:</span>
                      <span className="font-mono text-emerald-500 text-sm">{rubricEvaluationResult.total_score} / {rubricEvaluationResult.max_score}</span>
                    </div>
                    {rubricEvaluationResult.highlights.map((h: any, idx: number) => (
                      <p key={idx} className="text-emerald-400 font-mono">"{h.phrase}" &rarr; <strong>{h.point}</strong></p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 8: 📑 CURRICULUM GAP & SYLLABUS DEVIATION TRACKER */}
        {/* ========================================================================= */}
        {activeModuleTab === 'CURRICULUM_GAP' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <Card className="border shadow-sm">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  📑 Curriculum Gap & Syllabus Deviation Tracker (Planned vs Taught)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="p-3.5 rounded-xl border flex justify-between items-center font-semibold">
                  <div>
                    <p className="font-bold text-foreground">Unit 3 Topic: Reinforcement Learning Policy Gradients</p>
                    <p className="text-muted-foreground text-[11px]">Syllabus Requirement: 4 Hours • Taught: 2 Hours (Under-taught)</p>
                  </div>
                  <span className="text-amber-500 font-bold">⚠️ Gap Detected</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 9: 👥 PEER & SELF-ASSESSMENT FACILITATION */}
        {/* ========================================================================= */}
        {activeModuleTab === 'PEER_360' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <Card className="border shadow-sm">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  👥 Group Project Peer 360 Review & Contribution Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="p-3.5 rounded-xl border flex justify-between items-center font-semibold">
                  <div>
                    <p className="font-bold text-foreground">Team Alpha: AI Healthcare App Project</p>
                    <p className="text-muted-foreground text-[11px]">Dharshini (40% code), Kharizma (35% docs), Rahul (25% presentation)</p>
                  </div>
                  <span className="text-emerald-500 font-bold">Verified 360° ✅</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 10: 🧠 MACRO STUDENT PROFILING (VARK LEARNING STYLES) */}
        {/* ========================================================================= */}
        {activeModuleTab === 'VARK_PROFILE' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <Card className="border shadow-sm">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  🧠 Cohort VARK Learning Styles Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3.5 rounded-xl border bg-indigo-500/10">
                    <span className="font-bold text-indigo-400">Visual Learners</span>
                    <div className="text-2xl font-black font-mono text-indigo-500 mt-1">45%</div>
                  </div>
                  <div className="p-3.5 rounded-xl border bg-purple-500/10">
                    <span className="font-bold text-purple-400">Auditory Learners</span>
                    <div className="text-2xl font-black font-mono text-purple-500 mt-1">25%</div>
                  </div>
                  <div className="p-3.5 rounded-xl border bg-emerald-500/10">
                    <span className="font-bold text-emerald-400">Read / Write</span>
                    <div className="text-2xl font-black font-mono text-emerald-500 mt-1">18%</div>
                  </div>
                  <div className="p-3.5 rounded-xl border bg-amber-500/10">
                    <span className="font-bold text-amber-400">Kinesthetic</span>
                    <div className="text-2xl font-black font-mono text-amber-500 mt-1">12%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
