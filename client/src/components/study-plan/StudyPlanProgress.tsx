'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Target, CheckCircle, Clock } from 'lucide-react';

interface StudyPlanProgressProps {
  totalItems: number;
  completedItems: number;
  percentage: number;
}

export function StudyPlanProgress({ totalItems, completedItems, percentage }: StudyPlanProgressProps) {
  return (
    <Card className="border bg-gradient-to-br from-indigo-500/5 via-background to-purple-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Target className="w-4 h-4 text-primary" /> Study Plan Completion Velocity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-baseline">
          <div className="text-3xl font-black text-foreground">{percentage}%</div>
          <span className="text-xs font-semibold text-muted-foreground">
            {completedItems} of {totalItems} modules mastered
          </span>
        </div>

        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>

        <p className="text-[11px] text-muted-foreground">
          Completing today's tasks keeps you on schedule for the upcoming Continuous Internal Assessment.
        </p>
      </CardContent>
    </Card>
  );
}
