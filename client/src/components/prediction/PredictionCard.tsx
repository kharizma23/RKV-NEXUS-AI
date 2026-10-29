'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export interface PredictionData {
  predicted_percentage: number;
  predicted_grade: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  factors: {
    co_attainment: number;
    exam_average: number;
    attendance: number;
    exams_completed?: number;
  };
}

interface PredictionCardProps {
  prediction: PredictionData;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
          badgeBg: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          label: 'Low Risk — On Track'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          label: 'Moderate Risk — Attention Recommended'
        };
      case 'HIGH':
      default:
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
          badgeBg: 'bg-rose-500/20 text-rose-700 dark:text-rose-300',
          icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
          label: 'High Risk — Remedial Action Needed'
        };
    }
  };

  const riskInfo = getRiskStyles(prediction.risk_level);

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> AI Semester Performance Forecast
          </CardTitle>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskInfo.badgeBg}`}>
            {prediction.confidence}% Confidence
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-black text-foreground">
              {prediction.predicted_percentage}%
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Projected Final Score</p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-primary">
              Grade {prediction.predicted_grade}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Projected Grade</p>
          </div>
        </div>

        {/* Risk Level Banner */}
        <div className={`p-3 rounded-lg border flex items-center gap-3 ${riskInfo.bg}`}>
          {riskInfo.icon}
          <div>
            <div className="text-xs font-bold">{riskInfo.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Based on Course Outcome attainments, exam averages, and continuous assessment logs.
            </div>
          </div>
        </div>

        {/* Factor Breakdown */}
        <div className="space-y-2 pt-1 border-t">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Contributing Academic Factors
          </div>
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>CO Attainment (40% Weight)</span>
                <span className="font-bold">{prediction.factors.co_attainment}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, prediction.factors.co_attainment)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Exam Average (40% Weight)</span>
                <span className="font-bold">{prediction.factors.exam_average}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${Math.min(100, prediction.factors.exam_average)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Attendance & Engagement (20% Weight)</span>
                <span className="font-bold">{prediction.factors.attendance}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, prediction.factors.attendance)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
