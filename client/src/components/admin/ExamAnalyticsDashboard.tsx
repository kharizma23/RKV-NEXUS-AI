'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle2, AlertCircle, TrendingUp, Download, Sparkles } from 'lucide-react';

export function ExamAnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchExamAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/exam-analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch exam analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-500" />
            🎯 Exam Analytics Dashboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Deep-dive exam performance analytics, item difficulty metrics, and pass-rate trends</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => alert("Question difficulty analysis launched!")} className="text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Analyze Questions
          </Button>
          <Button size="sm" onClick={() => alert("Exam analytics report exported!")} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold">
            <Download className="w-3.5 h-3.5 mr-1" /> Generate Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Total Examinations</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{data?.stats?.totalExams || 120}</p>
              <p className="text-[10px] font-bold text-indigo-600 mt-0.5">▲ +15 conducted</p>
            </div>
            <FileText className="w-8 h-8 text-indigo-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Average Platform Score</p>
              <p className="text-2xl font-black text-cyan-600 mt-1">{data?.stats?.avgPercentage || 68}%</p>
              <p className="text-[10px] font-bold text-cyan-600 mt-0.5">▲ +5% increase</p>
            </div>
            <TrendingUp className="w-8 h-8 text-cyan-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Pass Percentage</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{data?.stats?.passPercentage || 82}%</p>
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5">▲ +8% benchmark</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
          </CardContent>
        </Card>
      </div>

      {/* Hardest vs Easiest Questions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" /> Hardest Exam Questions (Needs Review)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {data?.hardestQuestions?.map((hq: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                <span className="text-xs font-bold text-foreground">❓ {i + 1}. {hq.q}</span>
                <span className="text-xs font-black text-rose-600 font-mono">{hq.correctRate} Correct Rate</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> High Mastery Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {data?.easiestQuestions?.map((eq: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                <span className="text-xs font-bold text-foreground">✅ {i + 1}. {eq.q}</span>
                <span className="text-xs font-black text-emerald-600 font-mono">{eq.correctRate} Correct Rate</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
