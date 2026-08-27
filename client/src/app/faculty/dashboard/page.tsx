'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen, HelpCircle, FileText, CheckSquare, Send, Bell, ArrowRight,
  Clock, Users, Calendar, AlertTriangle, Sparkles, BarChart3, Plus,
  ShieldAlert, Brain, Cpu, Cloud, Smartphone, GraduationCap, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    assignedSubjects: 4,
    totalBroadcasts: 12,
    activeExams: 6,
    pendingEvaluation: 8,
  });

  const [assignedSubjects] = useState([
    {
      id: 'cs2026',
      code: 'CS2026',
      name: 'Artificial Intelligence',
      sem: 7,
      students: 45,
      icon: Brain,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      id: 'cs2027',
      code: 'CS2027',
      name: 'Machine Learning',
      sem: 7,
      students: 42,
      icon: Cpu,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      id: 'cs2028',
      code: 'CS2028',
      name: 'Cloud Computing',
      sem: 6,
      students: 38,
      icon: Cloud,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
    {
      id: 'cs2029',
      code: 'CS2029',
      name: 'Mobile Computing',
      sem: 6,
      students: 40,
      icon: Smartphone,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
  ]);

  const [upcomingExams] = useState([
    {
      id: 'ex1',
      title: 'AI Internal Assessment - 1',
      subject: 'Artificial Intelligence',
      date: 'Aug 20, 2026',
      time: '10:00 AM',
      students: 45,
      icon: Brain,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      id: 'ex2',
      title: 'ML Quiz',
      subject: 'Machine Learning',
      date: 'Aug 22, 2026',
      time: '02:00 PM',
      students: 42,
      icon: Cpu,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      id: 'ex3',
      title: 'Cloud Architecture Test',
      subject: 'Cloud Computing',
      date: 'Aug 25, 2026',
      time: '09:00 AM',
      students: 38,
      icon: Cloud,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
  ]);

  const [pendingEvaluations] = useState([
    {
      id: 'pe1',
      title: 'AI Internal Assessment - 1',
      submissions: 8,
      subject: 'Artificial Intelligence',
      icon: Brain,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      id: 'pe2',
      title: 'ML Quiz',
      submissions: 5,
      subject: 'Machine Learning',
      icon: Cpu,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
  ]);

  const [recentBroadcasts] = useState([
    { id: 'b1', title: 'AI Exam on Aug 20 Reminder', sentAt: 'Aug 15, 2026', recipients: '45 Students' },
    { id: 'b2', title: 'ML Quiz Syllabus & Rubric', sentAt: 'Aug 14, 2026', recipients: '42 Students' },
  ]);

  useEffect(() => {
    // Fetch live backend counts if available
    apiClient<any[]>('/notifications')
      .then((data) => {
        if (data.length > 0) {
          setStats((prev) => ({ ...prev, totalBroadcasts: data.length }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span>Welcome, {user?.full_name}!</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-400/30 text-indigo-200">
                Designation: {user?.faculty_profile?.designation || 'Faculty Member'}
              </span>
              {user?.faculty_profile?.employee_id && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                  EMP ID: {user.faculty_profile.employee_id}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => router.push('/faculty/examinations/create')} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs">
              <Plus className="w-4 h-4 mr-1" /> Create Exam
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push('/faculty/notifications')} className="text-white border-white/20 hover:bg-white/10 text-xs font-bold">
              <Send className="w-3.5 h-3.5 mr-1" /> New Broadcast
            </Button>
          </div>
        </div>

        {/* Quick Stats (Real Data Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border shadow-sm bg-card hover:border-indigo-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Assigned Subjects</CardTitle>
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground font-mono">{stats.assignedSubjects}</div>
              <p className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                <span className="text-[9px]">▲</span> +1 Active Courses
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card hover:border-indigo-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Broadcasts</CardTitle>
              <Send className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-indigo-500 font-mono">{stats.totalBroadcasts}</div>
              <p className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                <span className="text-[9px]">▲</span> +5 Sent Announcements
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card hover:border-indigo-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Exams</CardTitle>
              <FileText className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-amber-500 font-mono">{stats.activeExams}</div>
              <p className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                <span className="text-[9px]">▲</span> +2 Scheduled Tests
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card hover:border-indigo-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Evaluation</CardTitle>
              <CheckSquare className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-emerald-500 font-mono">{stats.pendingEvaluation}</div>
              <p className="text-[11px] text-rose-500 font-bold mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                8 Urgent Submissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Center */}
        <Card className="p-4 border shadow-sm bg-card space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-foreground font-black">Quick Action Center</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button onClick={() => router.push('/faculty/examinations/create')} variant="outline" className="text-xs font-bold flex flex-col items-center gap-1 py-4 h-auto border-indigo-500/20 hover:border-indigo-500">
              <Plus className="w-4 h-4 text-indigo-500" />
              <span>Create Exam</span>
            </Button>
            <Button onClick={() => router.push('/faculty/question-bank')} variant="outline" className="text-xs font-bold flex flex-col items-center gap-1 py-4 h-auto border-purple-500/20 hover:border-purple-500">
              <HelpCircle className="w-4 h-4 text-purple-500" />
              <span>Question Bank</span>
            </Button>
            <Button onClick={() => router.push('/faculty/analytics')} variant="outline" className="text-xs font-bold flex flex-col items-center gap-1 py-4 h-auto border-blue-500/20 hover:border-blue-500">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span>Reports</span>
            </Button>
            <Button onClick={() => router.push('/faculty/notifications')} variant="outline" className="text-xs font-bold flex flex-col items-center gap-1 py-4 h-auto border-emerald-500/20 hover:border-emerald-500">
              <Send className="w-4 h-4 text-emerald-500" />
              <span>Broadcast</span>
            </Button>
            <Button onClick={() => router.push('/faculty/evaluation')} variant="outline" className="text-xs font-bold flex flex-col items-center gap-1 py-4 h-auto border-amber-500/20 hover:border-amber-500">
              <CheckSquare className="w-4 h-4 text-amber-500" />
              <span>AI Evaluate</span>
            </Button>
            <Button onClick={() => router.push('/faculty/subjects')} variant="outline" className="text-xs font-bold flex flex-col items-center gap-1 py-4 h-auto border-rose-500/20 hover:border-rose-500">
              <Users className="w-4 h-4 text-rose-500" />
              <span>Student Progress</span>
            </Button>
          </div>
        </Card>

        {/* Main Dashboard Layout Columns */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Column 1: Assigned Subjects */}
          <Card className="border shadow-sm">
            <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>My Assigned Subjects</span>
                </CardTitle>
                <CardDescription className="text-xs">Active course offerings for this semester</CardDescription>
              </div>
              <Link href="/faculty/subjects" className="text-xs text-indigo-500 font-bold hover:underline">
                View All →
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {assignedSubjects.map((sub) => {
                const IconComponent = sub.icon;
                return (
                  <div key={sub.id} className="p-3.5 rounded-xl border bg-card hover:border-indigo-500/30 transition-all flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sub.bg} border ${sub.border}`}>
                        <IconComponent className={`w-5 h-5 ${sub.color}`} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{sub.name}</p>
                        <p className="text-[11px] text-muted-foreground">{sub.code} • Semester {sub.sem} • {sub.students} Enrolled Students</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/faculty/subjects`)} className="text-xs font-bold text-indigo-500">
                      View
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Column 2: Upcoming Exams */}
          <Card className="border shadow-sm">
            <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Upcoming Exams (Next 7 Days)</span>
                </CardTitle>
                <CardDescription className="text-xs">Scheduled assessments and quizzes</CardDescription>
              </div>
              <Link href="/faculty/examinations" className="text-xs text-indigo-500 font-bold hover:underline">
                Manage Exams →
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {upcomingExams.map((ex) => {
                const IconComponent = ex.icon;
                return (
                  <div key={ex.id} className="p-3.5 rounded-xl border bg-card hover:border-indigo-500/30 transition-all flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ex.bg} border ${ex.border}`}>
                        <IconComponent className={`w-5 h-5 ${ex.color}`} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{ex.title}</p>
                        <p className="text-[11px] text-muted-foreground">{ex.subject} • {ex.date} at {ex.time}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {ex.students} Students
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Columns: Pending Evaluations & Recent Broadcasts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Evaluations */}
          <Card className="border shadow-sm">
            <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase text-foreground flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                  <span>Pending AI Evaluations</span>
                </CardTitle>
                <CardDescription className="text-xs">Submissions awaiting faculty review</CardDescription>
              </div>
              <Link href="/faculty/evaluation" className="text-xs text-indigo-500 font-bold hover:underline">
                Review Console →
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {pendingEvaluations.map((pe) => {
                const IconComponent = pe.icon;
                return (
                  <div key={pe.id} className="p-3.5 rounded-xl border bg-card flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pe.bg} border ${pe.border}`}>
                        <IconComponent className={`w-5 h-5 ${pe.color}`} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{pe.title}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{pe.subject}</span>
                          <span>•</span>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span className="text-rose-500 font-semibold">{pe.submissions} Submissions</span>
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => router.push('/faculty/evaluation')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
                      Evaluate Now
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Broadcasts */}
          <Card className="border shadow-sm">
            <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase text-foreground flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-500" />
                  <span>Recent Sent Broadcasts</span>
                </CardTitle>
                <CardDescription className="text-xs">History of announcements and alerts</CardDescription>
              </div>
              <Link href="/faculty/notifications" className="text-xs text-indigo-500 font-bold hover:underline">
                Outbox Broadcaster →
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {recentBroadcasts.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl border bg-card flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{b.title}</p>
                    <p className="text-[11px] text-muted-foreground">Sent: {b.sentAt} • Target: {b.recipients}</p>
                  </div>
                  <span className="text-[10px] text-indigo-500 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                    Delivered
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
