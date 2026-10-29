'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FacultyDetail {
  user_id: string;
  full_name: string;
  email: string;
  employee_id: string;
  designation?: string;
  phone_number?: string;
  subjects_handled?: string[];
  approval_status: string;
  account_status: string;
  is_verified: boolean;
  is_approved: boolean;
  rejection_reason?: string;
}

export default function AdminFacultyApprovalDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data: faculty, isLoading } = useQuery<FacultyDetail>({
    queryKey: ['admin-faculty-detail', userId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/admin/faculty-approvals/${userId}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage('');
      setSuccessMessage('');
      const res = await fetch(`/api/v1/admin/faculty-approvals/${userId}/resend-verification`, { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to resend verification email');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Verification email resent successfully.');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to resend verification email.');
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/admin/faculty-approvals/${userId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Approval failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faculty-detail', userId] });
      router.push('/admin/faculty-approvals');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!rejectionReason.trim()) {
        throw new Error('Rejection reason is mandatory.');
      }
      const res = await fetch(`/api/v1/admin/faculty-approvals/${userId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', reason: rejectionReason }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Rejection failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faculty-detail', userId] });
      router.push('/admin/faculty-approvals');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Rejection failed.');
    },
  });

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Faculty Application Inspection
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Detailed verification of faculty registration credentials and institutional assignment.
          </p>
        </div>

        {isLoading || !faculty ? (
          <div className="py-8 text-center text-slate-500">Loading faculty details...</div>
        ) : (
          <div className="space-y-6">
            <Card className="border-indigo-100 dark:border-indigo-900/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">{faculty.full_name}</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">{faculty.email}</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold ${
                  faculty.approval_status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : faculty.approval_status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {faculty.approval_status}
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block font-semibold">Faculty / Employee ID</span>
                    <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{faculty.employee_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Designation</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">{faculty.designation || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Email Verification</span>
                    <span className={faculty.is_verified ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                      {faculty.is_verified ? 'Verified ✓' : 'Pending Verification'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Account Status</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">{faculty.account_status}</span>
                  </div>
                </div>

                {faculty.rejection_reason && (
                  <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                    <strong>Rejection Reason Recorded:</strong> {faculty.rejection_reason}
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-semibold rounded-md border border-rose-200">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-md border border-emerald-200">
                    ✓ {successMessage}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  {faculty.approval_status === 'PENDING_APPROVAL' && (
                    <>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        onClick={() => approveMutation.mutate()}
                        disabled={approveMutation.isPending}
                      >
                        Approve Application ✓
                      </Button>
                      <Button
                        variant="outline"
                        className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 text-xs"
                        onClick={() => setShowRejectModal(true)}
                      >
                        Reject Application ✗
                      </Button>
                    </>
                  )}

                  {!faculty.is_verified && (
                    <Button
                      variant="outline"
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 text-xs font-semibold"
                      onClick={() => resendVerificationMutation.mutate()}
                      disabled={resendVerificationMutation.isPending}
                    >
                      {resendVerificationMutation.isPending ? 'Sending...' : 'Resend Verification Email ✉'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rejection Modal */}
            {showRejectModal && (
              <div className="p-6 rounded-xl border border-rose-200 bg-rose-50/90 dark:bg-rose-950/90 dark:border-rose-900 space-y-4">
                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Mandatory Rejection Rationale
                </h3>
                {errorMessage && <p className="text-xs text-rose-600 font-bold">{errorMessage}</p>}
                <textarea
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a clear and specific reason for rejecting this faculty application..."
                  rows={3}
                  className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <div className="flex space-x-2">
                  <Button
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                    onClick={() => rejectMutation.mutate()}
                    disabled={rejectMutation.isPending}
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs"
                    onClick={() => setShowRejectModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
