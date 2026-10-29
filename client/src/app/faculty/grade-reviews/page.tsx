'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GradeReview {
  id: string;
  attempt_id: string;
  student_id: string;
  review_category: string;
  explanation: string;
  status: string;
  faculty_decision_reason?: string;
  created_at: string;
}

export default function FacultyGradeReviewsPage() {
  const queryClient = useQueryClient();
  const [decisionReason, setDecisionReason] = useState<Record<string, string>>({});

  const { data: reviews = [], isLoading } = useQuery<GradeReview[]>({
    queryKey: ['faculty-grade-reviews'],
    queryFn: async () => {
      const res = await fetch('/api/v1/grade-reviews/queue');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const decideMutation = useMutation({
    mutationFn: async ({ reviewId, status, reason }: { reviewId: string; status: string; reason: string }) => {
      const res = await fetch(`/api/v1/grade-reviews/${reviewId}/decide`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, faculty_decision_reason: reason }),
      });
      if (!res.ok) throw new Error('Decision failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-grade-reviews'] });
    },
  });

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Student Grade-Review Appeals Queue
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Review student post-publication evaluation appeal tickets, inspect evidence, and decide on mark adjustments.
          </p>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-500">Loading appeal requests...</div>
        ) : reviews.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No active student grade-review appeal tickets in the queue.
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <Card key={rev.id} className="border-indigo-100 dark:border-indigo-900/30">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                      Category: {rev.review_category}
                    </span>
                    <CardTitle className="text-base font-bold mt-1">Appeal Ticket #{rev.id.substring(0, 8)}</CardTitle>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    rev.status === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : rev.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                  }`}>
                    {rev.status}
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800">
                    <strong className="text-indigo-600 dark:text-indigo-400">Student Reason:</strong> {rev.explanation}
                  </p>

                  {rev.status === 'SUBMITTED' && (
                    <div className="flex items-center space-x-3 pt-2">
                      <Input
                        placeholder="Faculty decision rationale..."
                        value={decisionReason[rev.id] || ''}
                        onChange={(e) => setDecisionReason({ ...decisionReason, [rev.id]: e.target.value })}
                        className="flex-1 text-xs"
                      />
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        onClick={() => decideMutation.mutate({
                          reviewId: rev.id,
                          status: 'ACCEPTED',
                          reason: decisionReason[rev.id] || 'Appeal accepted following rubric re-inspection.',
                        })}
                      >
                        Accept Appeal
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300"
                        onClick={() => decideMutation.mutate({
                          reviewId: rev.id,
                          status: 'REJECTED',
                          reason: decisionReason[rev.id] || 'Original AI evaluation confirmed as accurate.',
                        })}
                      >
                        Reject Appeal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
