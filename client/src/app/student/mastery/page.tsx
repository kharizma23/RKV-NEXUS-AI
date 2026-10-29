'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MasteryHistory {
  id: string;
  previous_mastery: number;
  new_mastery: number;
  evidence_source: string;
  timestamp: string;
}

export default function StudentMasteryHistoryPage() {
  const { data: history = [], isLoading } = useQuery<MasteryHistory[]>({
    queryKey: ['student-mastery-history'],
    queryFn: async () => {
      const res = await fetch('/api/v1/mastery/history/my');
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Append-Only Topic Mastery History
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Historical audit log of topic mastery transitions resulting from assessments and remedial activities.
          </p>
        </div>

        <Card className="border-indigo-100 dark:border-indigo-900/30">
          <CardHeader>
            <CardTitle>Mastery Progression Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-6 text-center text-slate-500">Loading mastery history...</div>
            ) : history.length === 0 ? (
              <div className="py-6 text-center text-slate-500">No mastery history events recorded yet.</div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                    <div>
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                        {item.evidence_source}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mt-1">
                        Topic Mastery Updated: {Math.round(item.previous_mastery * 100)}% → {Math.round(item.new_mastery * 100)}%
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Recorded on: {new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>

                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                      +{Math.round((item.new_mastery - item.previous_mastery) * 100)}% Growth
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
