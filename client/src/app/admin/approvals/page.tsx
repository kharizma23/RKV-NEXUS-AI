'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Users, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

type Tab = 'students' | 'faculty';

interface ApprovalItem {
  user_id: string;
  full_name: string;
  email: string;
  approval_status: string;
  account_status: string;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  // faculty-specific
  employee_id?: string;
  designation?: string;
  rejection_reason?: string;
  // student-specific
  student_id_number?: string;
}

export default function AdminApprovalsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('students');
  const [filterStatus, setFilterStatus] = useState<string>('PENDING_APPROVAL');
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: items = [], isLoading } = useQuery<ApprovalItem[]>({
    queryKey: ['admin-approvals', tab, filterStatus],
    queryFn: async () => {
      const endpoint = tab === 'students' ? 'student-approvals' : 'faculty-approvals';
      const url = filterStatus
        ? `/api/v1/admin/${endpoint}?status_filter=${filterStatus}`
        : `/api/v1/admin/${endpoint}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const endpoint = tab === 'students' ? 'student-approvals' : 'faculty-approvals';
      const res = await fetch(`/api/v1/admin/${endpoint}/${userId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Approval failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-approvals'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const endpoint = tab === 'students' ? 'student-approvals' : 'faculty-approvals';
      const res = await fetch(`/api/v1/admin/${endpoint}/${userId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Rejection failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
      setRejectTargetId(null);
      setRejectReason('');
    },
  });

  const pendingCount = items.filter(i => i.approval_status === 'PENDING_APPROVAL').length;

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-8 h-8 text-indigo-600" />
              User Approval Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Review and approve student & faculty registrations before they can log in.
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {pendingCount} pending {tab === 'students' ? 'student' : 'faculty'} approval{pendingCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
          <button
            onClick={() => { setTab('students'); setFilterStatus('PENDING_APPROVAL'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === 'students'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student Registrations
          </button>
          <button
            onClick={() => { setTab('faculty'); setFilterStatus('PENDING_APPROVAL'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === 'faculty'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Faculty Registrations
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['PENDING_APPROVAL', 'APPROVED', ''].map((st) => (
            <Button
              key={st}
              variant={filterStatus === st ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(st)}
              className="text-xs font-semibold"
            >
              {st === '' ? 'All' : st === 'PENDING_APPROVAL' ? '⏳ Pending' : '✅ Approved'}
            </Button>
          ))}
        </div>

        {/* List */}
        <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              {tab === 'students' ? 'Student' : 'Faculty'} Applications ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center text-sm text-slate-500">Loading...</div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">No applications in this category.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <div key={item.user_id} className="p-4 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{item.full_name}</span>
                        {tab === 'faculty' && item.employee_id && (
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.employee_id}
                          </span>
                        )}
                        {tab === 'students' && item.student_id_number && (
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.student_id_number}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.approval_status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.approval_status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {item.approval_status === 'PENDING_APPROVAL' ? '⏳ PENDING' : item.approval_status}
                        </span>
                        {!item.is_verified && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Email Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.email}
                        {tab === 'faculty' && item.designation && ` • ${item.designation}`}
                        {` • Registered: ${new Date(item.created_at).toLocaleDateString()}`}
                      </p>
                      {item.rejection_reason && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                          Rejection Reason: {item.rejection_reason}
                        </p>
                      )}
                    </div>

                    {item.approval_status === 'PENDING_APPROVAL' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                          onClick={() => approveMutation.mutate(item.user_id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs gap-1"
                          onClick={() => { setRejectTargetId(item.user_id); setRejectReason(''); }}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Modal */}
      {rejectTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Reject Registration</h2>
            <p className="text-sm text-slate-500 mb-4">Provide a reason for rejection. This will be stored in the audit log.</p>
            <textarea
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-400 min-h-[100px] resize-none"
              placeholder="e.g. Invalid credentials, duplicate registration, missing documentation..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4 justify-end">
              <Button variant="outline" size="sm" onClick={() => setRejectTargetId(null)}>Cancel</Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                onClick={() => rejectMutation.mutate({ userId: rejectTargetId, reason: rejectReason })}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
