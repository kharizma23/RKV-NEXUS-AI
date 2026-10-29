'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, GraduationCap, TrendingUp, AlertTriangle, Users, Sparkles, RefreshCw } from 'lucide-react';

interface InstitutionalHealth {
  score: number;
  student_success_rate: number;
  co_attainment_trend: number;
  dropout_risk_count: number;
  faculty_retention_rate: number;
  placement_rate: number;
  recommendations: string[];
}

interface Props {
  data?: InstitutionalHealth;
  isLoading?: boolean;
  onRefresh?: () => void;
  onViewAtRisk?: () => void;
}

export function PredictiveAnalyticsHeader({ data, isLoading, onRefresh, onViewAtRisk }: Props) {
  const [timeframe, setTimeframe] = useState<'month' | 'semester' | 'year'>('semester');

  const healthScore = data?.score || 87;
  const successRate = data?.student_success_rate || 92.0;
  const coTrend = data?.co_attainment_trend || 88.5;
  const dropoutCount = data?.dropout_risk_count || 2;
  const placementRate = data?.placement_rate || 91.2;
  const recommendations = data?.recommendations || [
    'CO-3 attainment in Data Structures is up by 12% following AI remedial interventions.',
    'Consider hiring 2 specialized faculty members in AI & Cloud Computing to match student growth.',
    'Schedule mid-term revision labs for 5 students identified as at-risk in Database Systems.'
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <Card className="border-indigo-500/20 shadow-lg bg-card overflow-hidden">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border-b border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-400/30 backdrop-blur">
              <Brain className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">AI Institutional Health Index</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                  Real-Time AI Prediction
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-0.5">
                AI Predictive Analytics & Academic Governance Model (2026 AICTE Standards)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              {(['month', 'semester', 'year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                    timeframe === t
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-200 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          {/* Health Score Pill */}
          <div className="lg:col-span-4 p-5 rounded-2xl border bg-muted/20 flex flex-col justify-center items-center text-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Predictive Health Score
            </span>
            <div className={`px-6 py-3 rounded-2xl border ${getScoreColor(healthScore)} flex items-baseline gap-1`}>
              <span className="text-4xl font-black">{healthScore}</span>
              <span className="text-base font-bold text-muted-foreground">/100</span>
            </div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-3 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Institutional Performance Index: High Stability
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-bold uppercase">Student Success</span>
                <GraduationCap className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-foreground">{successRate}%</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                ↑ 4.2% vs last sem
              </p>
            </div>

            <div className="p-4 rounded-xl border bg-card hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-bold uppercase">CO Attainment</span>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-foreground">{coTrend}%</div>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                ↑ 12% target Met
              </p>
            </div>

            <div className="p-4 rounded-xl border bg-card hover:border-indigo-500/40 transition-colors cursor-pointer" onClick={onViewAtRisk}>
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-bold uppercase">Dropout Risk</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{dropoutCount}</div>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 underline">
                Action required
              </p>
            </div>

            <div className="p-4 rounded-xl border bg-card hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-bold uppercase">Placement Forecast</span>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-foreground">{placementRate}%</div>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
                High placement index
              </p>
            </div>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" /> AI Automated System Recommendations
          </div>
          <ul className="grid md:grid-cols-3 gap-2 text-muted-foreground">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-card/60 p-2.5 rounded-lg border">
                <span className="text-indigo-500 font-black">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
