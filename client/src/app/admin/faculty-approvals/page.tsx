'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, UserCheck } from 'lucide-react';
import { FacultyRecommendationModal } from '@/components/admin/FacultyRecommendationModal';

interface FacultyApprovalItem {
  user_id: string;
  full_name: string;
  email: string;
  employee_id?: string;
  designation?: string;
  approval_status: string;
  account_status: string;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  rejection_reason?: string;
}

export default function AdminFacultyApprovalsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('PENDING_APPROVAL');
  const [selectedFacultyForAI, setSelectedFacultyForAI] = useState<string | null>(null);

  const { data: approvals = [], isLoading } = useQuery<FacultyApprovalItem[]>({
    queryKey: ['admin-faculty-approvals', filterStatus],
    queryFn: async () => {
      const url = filterStatus ? `/api/v1/admin/faculty-approvals?status_filter=${filterStatus}` : '/api/v1/admin/faculty-approvals';
      const res = await fetch(url);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/v1/admin/faculty-approvals/${userId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Approval failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faculty-approvals'] });
    },
  });

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Faculty Approval Management 2.0
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Review pending faculty registration requests, AI expertise suitability matching, and automated course assignments.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          {['PENDING_APPROVAL', 'APPROVED', 'REJECTED', ''].map((st) => (
            <Button
              key={st}
              variant={filterStatus === st ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(st)}
              className="text-xs font-semibold"
            >
              {st === '' ? 'All Applications' : st.replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Approvals List */}
        <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Faculty Applications ({approvals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-6 text-center text-xs text-slate-500">Loading faculty registrations...</div>
            ) : approvals.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No faculty applications matching the selected filter.</div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {approvals.map((item) => (
                  <div key={item.user_id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.full_name}</h4>
                        <span className="font-mono text-[10px] text-slate-500">[{item.employee_id || 'NO-ID'}]</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.approval_status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.approval_status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {item.approval_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.email} • Designation: {item.designation || 'N/A'}</p>
                      {item.rejection_reason && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Rejection Reason: {item.rejection_reason}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFacultyForAI(item.user_id)}
                        className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-xs font-bold"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" /> AI Recommendation
                      </Button>
                      <Link
                        href={`/admin/faculty-approvals/${item.user_id}`}
                        className="px-3 py-1.5 rounded text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Inspect
                      </Link>
                      {item.approval_status === 'PENDING_APPROVAL' && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                          onClick={() => approveMutation.mutate(item.user_id)}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <FacultyRecommendationModal
          isOpen={!!selectedFacultyForAI}
          onClose={() => setSelectedFacultyForAI(null)}
          facultyId={selectedFacultyForAI || undefined}
          facultyData={approvals.find((a) => a.user_id === selectedFacultyForAI)}
          onAutoAssignSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-faculty-approvals'] })}
        />
      </div>
    </DashboardLayout>
  );
}
