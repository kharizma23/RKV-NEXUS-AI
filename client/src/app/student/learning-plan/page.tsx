'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface KnowledgeState {
  id: string;
  mastery_level: number;
  status: string;
  topic?: {
    title: string;
  };
}

interface RemedialPlan {
  id: string;
  title: string;
  weak_topics?: Array<{ topic_id: string; title: string; mastery_pct: number }>;
  recommended_resources?: Array<{ topic: string; resource_type: string; title: string; url: string }>;
}

export default function StudentLearningPlanPage() {
  const { data: plan } = useQuery<RemedialPlan>({
    queryKey: ['student-learning-plan'],
    queryFn: async () => {
      const res = await fetch('/api/v1/learning-plan/my');
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: states = [] } = useQuery<KnowledgeState[]>({
    queryKey: ['student-knowledge-states'],
    queryFn: async () => {
      const res = await fetch('/api/v1/learning-plan/knowledge-states');
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Personalized Remedial Learning Engine
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            AI-driven topic mastery graph, misconception diagnosis, and customized remedial study paths.
          </p>
        </div>

        {/* Student Knowledge Graph Summary */}
        <Card className="border-indigo-100 dark:border-indigo-900/30">
          <CardHeader>
            <CardTitle>Topic Mastery & Knowledge Graph</CardTitle>
          </CardHeader>
          <CardContent>
            {states.length === 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Unit 1: Arrays & Memory Alignment</span>
                    <span className="text-emerald-600 font-bold">85% (MASTERED)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Unit 2: Binary Search Trees & In-Order Traversal</span>
                    <span className="text-amber-600 font-bold">45% (WEAK - REMEDIAL REQUIRED)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {states.map((st) => (
                  <div key={st.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{st.topic?.title}</span>
                      <span className={st.status === 'MASTERED' ? 'text-emerald-600' : 'text-amber-600'}>
                        {Math.round(st.mastery_level * 100)}% ({st.status})
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${st.status === 'MASTERED' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.round(st.mastery_level * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personalized Remedial Recommendations */}
        <Card className="border-indigo-100 dark:border-indigo-900/30">
          <CardHeader>
            <CardTitle>AI Recommended Remedial Study Path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan?.recommended_resources ? (
              plan.recommended_resources.map((res, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 uppercase">
                      {res.resource_type}
                    </span>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-1">{res.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Target Topic: {res.topic}</p>
                  </div>

                  <a
                    href={res.url}
                    className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                  >
                    Open Resource →
                  </a>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex justify-between items-center">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 uppercase">
                    Remedial Study Module
                  </span>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-1">
                    Mastering Binary Search Tree Traversal & Recurrence Relations
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Target Topic: Binary Search Trees</p>
                </div>

                <a
                  href="/student/subjects"
                  className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                >
                  Open Study Guide →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
