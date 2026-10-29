'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Target, Download, AlertCircle, CheckCircle2, ArrowRight, Grid
} from 'lucide-react';

export interface SubjectCOMatrix {
  subject: string;
  co1: number;
  co2: number;
  co3: number;
  co4: number;
  co5: number;
  co6: number;
}

export function COMappingVisualizer() {
  const [coData, setCoData] = useState({
    averageAttainment: 78.5,
    targetAttainment: 85.0,
    gap: -6.5,
    matrix: [
      { subject: 'Artificial Intelligence', co1: 85, co2: 78, co3: 92, co4: 70, co5: 65, co6: 88 },
      { subject: 'Machine Learning', co1: 82, co2: 88, co3: 75, co4: 90, co5: 72, co6: 80 },
      { subject: 'Cloud Computing', co1: 90, co2: 72, co3: 68, co4: 85, co5: 78, co6: 82 },
      { subject: 'Database Management', co1: 75, co2: 80, co3: 85, co4: 88, co5: 82, co6: 76 }
    ] as SubjectCOMatrix[]
  });

  const fetchCoMap = async () => {
    try {
      const res = await fetch('/api/v1/admin/co-map');
      if (res.ok) {
        const json = await res.json();
        if (json.data) setCoData(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCoMap();
  }, []);

  const getHeatBg = (val: number) => {
    if (val >= 85) return 'bg-emerald-500/20 text-emerald-600 font-black border border-emerald-500/30';
    if (val >= 75) return 'bg-amber-500/20 text-amber-600 font-bold border border-amber-500/30';
    return 'bg-rose-500/20 text-rose-600 font-bold border border-rose-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-indigo-500" />
            🎯 Course Outcome (CO) Mapping & Attainment Heatmap
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Visual map of subject-wise outcome attainment with target vs actual gap analysis</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => window.open('/api/v1/admin/reports/download')} className="text-xs font-bold">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download Heatmap PDF
          </Button>
          <Button size="sm" onClick={() => alert('Remedial action plan created for CO-5 & CO-3 gaps!')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
            Create Action Plan <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Target vs Actual Header Card */}
      <Card className="border border-indigo-500/20 bg-indigo-500/5 p-4">
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-card border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Average CO Attainment</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">{coData.averageAttainment}%</p>
            <p className="text-[10px] text-emerald-500 font-bold mt-0.5">▲ +5.2% from last sem</p>
          </div>

          <div className="p-3 rounded-lg bg-card border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Institutional Target</p>
            <p className="text-2xl font-black text-foreground mt-1">{coData.targetAttainment}%</p>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">AICTE Benchmark 2026</p>
          </div>

          <div className="p-3 rounded-lg bg-card border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Attainment Gap</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{coData.gap}%</p>
            <p className="text-[10px] text-amber-500 font-bold mt-0.5">⚠️ Needs Target Alignment</p>
          </div>
        </div>
      </Card>

      {/* CO Heat Map Table */}
      <Card className="border overflow-hidden">
        <CardHeader className="pb-3 bg-muted/40 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Grid className="w-4 h-4 text-indigo-500" />
            Subject vs Course Outcomes Heatmap Matrix
          </CardTitle>
          <div className="flex gap-3 text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> 85%+ Exceeded</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500"></span> 75-84% Proficient</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500"></span> &lt;75% Developing</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead className="bg-muted/20 border-b text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3 text-left">Subject Name</th>
                  <th className="p-3">CO1 (Remember)</th>
                  <th className="p-3">CO2 (Understand)</th>
                  <th className="p-3">CO3 (Apply)</th>
                  <th className="p-3">CO4 (Analyze)</th>
                  <th className="p-3">CO5 (Evaluate)</th>
                  <th className="p-3">CO6 (Create)</th>
                </tr>
              </thead>
              <tbody className="divide-y font-semibold">
                {coData.matrix.map((m, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="p-3 text-left font-bold text-foreground">{m.subject}</td>
                    <td className="p-3"><span className={`px-2.5 py-1 rounded-lg ${getHeatBg(m.co1)}`}>{m.co1}%</span></td>
                    <td className="p-3"><span className={`px-2.5 py-1 rounded-lg ${getHeatBg(m.co2)}`}>{m.co2}%</span></td>
                    <td className="p-3"><span className={`px-2.5 py-1 rounded-lg ${getHeatBg(m.co3)}`}>{m.co3}%</span></td>
                    <td className="p-3"><span className={`px-2.5 py-1 rounded-lg ${getHeatBg(m.co4)}`}>{m.co4}%</span></td>
                    <td className="p-3"><span className={`px-2.5 py-1 rounded-lg ${getHeatBg(m.co5)}`}>{m.co5}%</span></td>
                    <td className="p-3"><span className={`px-2.5 py-1 rounded-lg ${getHeatBg(m.co6)}`}>{m.co6}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
