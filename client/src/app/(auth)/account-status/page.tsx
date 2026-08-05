'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface AccountStatus {
  user_id: string;
  email: string;
  full_name: string;
  account_status: string;
  is_verified: boolean;
  is_approved: boolean;
  is_active: boolean;
  role: string;
  redirect_path: string;
  rejection_reason?: string;
}

export default function AccountStatusPage() {
  const { data: status, isLoading, error } = useQuery<AccountStatus>({
    queryKey: ['account-status'],
    queryFn: async () => {
      const res = await fetch('/api/v1/auth/account-status');
      if (!res.ok) throw new Error('Could not fetch account status');
      return res.json();
    },
  });

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Account Status & Verification
        </h2>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Real-time verification and administrator approval status.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          {isLoading ? (
            <div className="py-6 text-center text-xs text-slate-500">Checking status...</div>
          ) : error || !status ? (
            <div className="text-center space-y-3">
              <p className="text-xs text-rose-500">Please sign in to check your account status.</p>
              <Link href="/login" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold">
                Sign In →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500">Account Status:</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  status.account_status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : status.account_status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {status.account_status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email Verification:</span>
                  <span className={status.is_verified ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {status.is_verified ? 'Verified ✓' : 'Pending Verification ⚠️'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Administrator Approval:</span>
                  <span className={status.is_approved ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {status.is_approved ? 'Approved ✓' : 'Pending Approval ⏳'}
                  </span>
                </div>
              </div>

              {status.rejection_reason && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
                  <strong>Rejection Reason:</strong> {status.rejection_reason}
                </div>
              )}

              <div className="pt-2">
                {status.account_status === 'ACTIVE' ? (
                  <Link
                    href={status.redirect_path}
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    Go to Dashboard →
                  </Link>
                ) : (
                  <Link
                    href="/resend-verification"
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Resend Verification Email
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
