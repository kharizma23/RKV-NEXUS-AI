'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegisterSuccessContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'STUDENT';
  const email = searchParams.get('email') || '';

  const isFaculty = role === 'FACULTY';

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-3xl mx-auto mb-4">
          ✓
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {isFaculty ? 'Faculty Registration Submitted' : 'Student Account Created'}
        </h2>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Registration recorded for <strong className="text-slate-900 dark:text-slate-200">{email}</strong>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
            <p className="font-bold">Next Steps:</p>
            <ol className="list-decimal pl-4 space-y-1">
              {isFaculty ? (
                <>
                  <li>Your application has been submitted to the administrator approval queue.</li>
                  <li>Once the administrator approves your application, your account will be activated and you can sign in.</li>
                </>
              ) : (
                <>
                  <li>Check your inbox to verify your email address.</li>
                  <li>Once email verification is complete, your account will be activated automatically.</li>
                </>
              )}
            </ol>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/login"
              className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Proceed to Sign In →
            </Link>
            {!isFaculty && (
              <Link
                href="/resend-verification"
                className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Resend Email Verification
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center text-xs text-slate-500">Loading success status...</div>}>
      <RegisterSuccessContent />
    </Suspense>
  );
}
