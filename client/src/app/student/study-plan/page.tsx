'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StudyPlanView, PlanItem } from '@/components/study-plan/StudyPlanView';
import { StudyPlanProgress } from '@/components/study-plan/StudyPlanProgress';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, BookOpen, RefreshCw } from 'lucide-react';

export default function StudentStudyPlanPage() {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [progress, setProgress] = useState({ total_items: 0, completed_items: 0, completion_percentage: 0 });
  const [loading, setLoading] = useState(true);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/student/study-plan');
      if (res.ok) {
        const json = await res.json();
        setItems(json.data.items || []);
      }
      const progRes = await fetch('/api/v1/student/study-plan/progress');
      if (progRes.ok) {
        const pJson = await progRes.json();
        setProgress(pJson.data);
      }
    } catch (e) {
      console.error('Failed to load study plan', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleCompleteItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/student/study-plan/item/${itemId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_spent_minutes: 35 })
      });
      if (res.ok) {
        fetchPlan();
      }
    } catch (e) {
      console.error('Error completing item', e);
    }
  };

  const handleGenerateNew = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/student/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester: 1 })
      });
      if (res.ok) {
        fetchPlan();
      }
    } catch (e) {
      console.error('Failed to generate new plan', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              AI-Generated Personalized Study Plan
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Targeted day-by-day learning tasks generated based on your weak Course Outcomes and diagnostic scores.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleGenerateNew}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Re-Generate Plan with AI
          </Button>
        </div>

        <StudyPlanProgress
          totalItems={progress.total_items}
          completedItems={progress.completed_items}
          percentage={progress.completion_percentage}
        />

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Day-by-Day Learning Roadmap</h3>
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading study plan...</div>
          ) : (
            <StudyPlanView items={items} onCompleteItem={handleCompleteItem} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
