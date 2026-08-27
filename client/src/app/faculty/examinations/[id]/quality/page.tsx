'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QualityFinding {
  id: string;
  severity: string;
  category: string;
  message: string;
  suggested_correction?: string;
  rule_code: string;
  is_resolved: boolean;
}

interface QualityReport {
  id: string;
  exam_id: string;
  overall_score: number;
  component_scores?: Record<string, number>;
  status: string;
  has_blocking_issues: boolean;
  findings: QualityFinding[];
}

export default function FacultyExamQualityGatePage() {
  const params = useParams();
  const examId = params.id as string;

  const { data: report, isLoading } = useQuery<QualityReport>({
    queryKey: ['exam-quality-report', examId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/examinations/${examId}/quality-report`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Question-Paper Quality Gate & Validation
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Pre-publication validation checking syllabus coverage, Bloom's balance, difficulty ratio, and duplication risks.
          </p>
        </div>

        {isLoading || !report ? (
          <div className="py-8 text-center text-slate-500">Running quality validation gate...</div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score & Status Header */}
            <Card className="border-indigo-100 dark:border-indigo-900/30">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                    report.has_blocking_issues
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                  }`}>
                    Status: {report.status}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                    Paper Quality Index: {report.overall_score} / 100
                  </h2>
                </div>

                <Button
                  disabled={report.has_blocking_issues}
                  className={report.has_blocking_issues ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'}
                >
                  {report.has_blocking_issues ? 'Publication Blocked' : 'Approve & Publish Examination'}
                </Button>
              </CardContent>
            </Card>

            {/* Component Breakdown Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase text-slate-500">Quality Component Analysis</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 font-semibold">Syllabus Coverage</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {report.component_scores?.syllabus_coverage || 80}%
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 font-semibold">Outcome Alignment</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {report.component_scores?.outcome_alignment || 90}%
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 font-semibold">Difficulty Balance</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {report.component_scores?.difficulty_balance || 85}%
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 font-semibold">Bloom's Balance</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {report.component_scores?.bloom_balance || 88}%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Findings List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase text-slate-500">Validation Findings & Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.findings?.map((f) => (
                  <div key={f.id} className={`p-4 rounded-lg border flex justify-between items-start ${
                    f.severity === 'BLOCKING'
                      ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20'
                      : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50'
                  }`}>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          f.severity === 'BLOCKING'
                            ? 'bg-rose-600 text-white'
                            : f.severity === 'WARNING'
                            ? 'bg-amber-500 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">[{f.category}]</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2">{f.message}</p>
                      {f.suggested_correction && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          <strong>Correction Suggestion:</strong> {f.suggested_correction}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
