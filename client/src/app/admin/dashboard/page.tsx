'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users, CheckSquare, Shield, Bell, Send,
  GraduationCap, Sparkles, Building2, FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { User } from '@/types/auth';

import { PredictiveAnalyticsHeader } from '@/components/admin/PredictiveAnalyticsHeader';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { SmartAlertCenter } from '@/components/admin/SmartAlertCenter';
import { ComparativeDashboard } from '@/components/admin/ComparativeDashboard';
import { ProgrammeGeneratorWizard } from '@/components/admin/ProgrammeGeneratorWizard';
import { SmartInstitutionOnboarding } from '@/components/admin/SmartInstitutionOnboarding';
import { AIBulkDataProcessor } from '@/components/admin/AIBulkDataProcessor';
import { FacultyRecommendationModal } from '@/components/admin/FacultyRecommendationModal';
import { SecurityAnomalyMonitor } from '@/components/admin/SecurityAnomalyMonitor';

interface BroadcastItem {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

interface Programme {
  id: string;
  name: string;
  is_active: boolean;
}

interface Subject {
  id: string;
  name: string;
}

function AdminDashboardContent() {
  const router = useRouter();
  const { user } = useAuth();

  // Modals state
  const [showProgrammeGen, setShowProgrammeGen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBulkProcessor, setShowBulkProcessor] = useState(false);
  const [showFacultyRec, setShowFacultyRec] = useState(false);
  const [totalBroadcasts, setTotalBroadcasts] = useState(0);
  const [recentBroadcasts, setRecentBroadcasts] = useState<BroadcastItem[]>([]);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const data = await apiClient<User[]>('/admin/users');
        if (Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.warn('Failed to load /admin/users, trying fallback /users:', err);
      }
      try {
        const data = await apiClient<User[]>('/users');
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {}
      return [];
    },
  });

  const hasRole = (u: any, roleName: string) => {
    if (!u.roles || !Array.isArray(u.roles)) return false;
    return u.roles.some((r: any) => {
      const name = typeof r === 'string' ? r : r?.name || '';
      return name.toUpperCase() === roleName.toUpperCase();
    });
  };

  const pendingFacultyCount = users.filter(
    (u) => hasRole(u, 'FACULTY') && !u.is_approved
  ).length;

  const totalStudents = users.filter((u) => hasRole(u, 'STUDENT')).length;
  const totalFaculty = users.filter((u) => hasRole(u, 'FACULTY')).length;

  const { data: programmes = [] } = useQuery<Programme[]>({
    queryKey: ['admin-programmes'],
    queryFn: () => apiClient<Programme[]>('/academics/programmes'),
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['admin-subjects'],
    queryFn: () => apiClient<Subject[]>('/academics/subjects'),
  });

  const { data: healthData, refetch: refetchHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['admin-health-metrics'],
    queryFn: () => apiClient<any>('/admin/analytics/predictive-health'),
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const notifs = await apiClient<BroadcastItem[]>('/notifications');
        setTotalBroadcasts(notifs.length);
        setRecentBroadcasts(notifs.slice(0, 4));
      } catch (err) {
        console.error('Failed to load admin notifications stats', err);
      }
    };
    fetchStats();
  }, []);

  const handleAlertAction = (actionType: string) => {
    if (actionType === 'NAVIGATE_FACULTY') {
      setShowFacultyRec(true);
    } else if (actionType === 'OPEN_PROGRAMME_GEN') {
      setShowProgrammeGen(true);
    } else if (actionType === 'VIEW_AT_RISK') {
      router.push('/admin/users');
    } else if (actionType === 'GENERATE_REPORT') {
      window.open('/api/v1/admin/reports/download', '_blank');
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8 pb-16">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-indigo-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                RKV NEXUS AI Platform 2026
              </span>
            </div>
            <h2 className="text-2xl font-black mt-1">Administrator Governance & Intelligence Control Center</h2>
            <p className="text-slate-300 text-xs mt-1">
              AI-Driven Academic Operations, Institutional Benchmarking, Security Audits & Multi-Role Governance
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => router.push('/admin/notifications?compose=true')}
              className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs shadow-sm"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> New Broadcast
            </Button>
            <Button
              size="sm"
              onClick={() => setShowProgrammeGen(true)}
              className="bg-indigo-600/80 hover:bg-indigo-700 font-bold text-xs shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Programme Generator
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowOnboarding(true)}
              className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Smart Onboarding
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBulkProcessor(true)}
              className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Bulk Processor
            </Button>
          </div>
        </div>

        {/* Executive Quick Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:border-indigo-500/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Registered Users</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1 font-semibold">
                {totalStudents} Students, {totalFaculty} Faculty
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-500/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">System Notifications</CardTitle>
              <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalBroadcasts}</div>
              <p className="text-xs text-muted-foreground mt-1 font-semibold">Active broadcasts dispatched</p>
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-500/30 transition-colors cursor-pointer" onClick={() => setShowFacultyRec(true)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Pending Approvals</CardTitle>
              <CheckSquare className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-rose-500">{pendingFacultyCount}</div>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold underline">
                Review with AI Recommendation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-500/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Academic Programmes</CardTitle>
              <GraduationCap className="w-4 h-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{programmes.length}</div>
              <p className="text-xs text-muted-foreground mt-1 font-semibold">{subjects.length} Subjects configured</p>
            </CardContent>
          </Card>
        </div>

        {/* Predictive AI Header & Visual Analytics */}
        <PredictiveAnalyticsHeader
          data={healthData}
          isLoading={healthLoading}
          onRefresh={refetchHealth}
          onViewAtRisk={() => router.push('/admin/users')}
        />

        <AnalyticsCharts />
        <SmartAlertCenter onAction={handleAlertAction} />
        <ComparativeDashboard />
        <SecurityAnomalyMonitor />

        {/* Shortcuts & Broadcasts */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Broadcast Dispatches</CardTitle>
                <CardDescription>Latest alerts published across program segments</CardDescription>
              </div>
              <Link href="/admin/notifications" className="text-xs text-primary font-bold hover:underline">
                Broadcaster
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBroadcasts.length === 0 ? (
                <div className="text-center p-6 text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <Send className="w-8 h-8 text-muted/40" />
                  <p>No broadcast history found</p>
                </div>
              ) : (
                recentBroadcasts.map((b) => (
                  <div key={b.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors flex justify-between items-center text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground truncate">{b.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{b.message}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Administration Shortcuts</CardTitle>
              <CardDescription>Direct management controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link href="/admin/notifications" className="flex items-center justify-between p-2.5 border rounded-md hover:bg-muted/50 transition-colors">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-500" /> Global Broadcaster
                </span>
                <span className="text-xs font-mono text-muted-foreground">{totalBroadcasts} Sent</span>
              </Link>
              <Link href="/admin/users" className="flex items-center justify-between p-2.5 border rounded-md hover:bg-muted/50 transition-colors">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-primary" /> User Account Management
                </span>
                <span className="text-xs font-mono text-muted-foreground">{users.length} Users</span>
              </Link>
              <Link href="/admin/faculty-approvals" className="flex items-center justify-between p-2.5 border rounded-md hover:bg-muted/50 transition-colors">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-rose-500" /> Faculty Approval Queue
                </span>
                {pendingFacultyCount > 0 ? (
                  <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-600 font-bold">{pendingFacultyCount} Pending</span>
                ) : (
                  <span className="text-xs text-emerald-600 font-medium">Clear</span>
                )}
              </Link>
              <Link href="/admin/academics" className="flex items-center justify-between p-2.5 border rounded-md hover:bg-muted/50 transition-colors">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-500" /> Academic Structure
                </span>
                <span className="text-xs font-mono text-muted-foreground">{programmes.length} Programmes</span>
              </Link>
              <Link href="/admin/audit-logs" className="flex items-center justify-between p-2.5 border rounded-md hover:bg-muted/50 transition-colors">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" /> Audit Trails
                </span>
                <span className="text-xs text-primary font-medium">Live Feed</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature Modals */}
      <ProgrammeGeneratorWizard isOpen={showProgrammeGen} onClose={() => setShowProgrammeGen(false)} />
      <SmartInstitutionOnboarding isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <AIBulkDataProcessor isOpen={showBulkProcessor} onClose={() => setShowBulkProcessor(false)} />
      <FacultyRecommendationModal isOpen={showFacultyRec} onClose={() => setShowFacultyRec(false)} />
    </DashboardLayout>
  );
}

export default function AdminDashboardPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading admin dashboard...</div>}>
      <AdminDashboardContent />
    </React.Suspense>
  );
}
