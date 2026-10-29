'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Sparkles, TrendingUp, Award, Users, BookOpen, FileCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BenchmarkProfile {
  name: string;
  co_attainment: number;
  placement_rate: number;
  student_success_rate: number;
  faculty_student_ratio: number;
  research_output: number;
}

export function BenchmarkingDashboard() {
  const [data, setData] = useState<{ comparisons: any; all_institutions: BenchmarkProfile[]; ai_recommendation: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBenchmarking = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/benchmarking/compare');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Benchmarking fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarking();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Building className="w-6 h-6 text-primary" />
            Institutional Benchmarking Intelligence
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-institutional accreditation analysis comparing CO attainment, placement rates, and faculty ratios.
          </p>
        </div>
        <Button size="sm" onClick={fetchBenchmarking} className="bg-primary hover:bg-primary/90 text-white font-bold text-xs">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Refresh Benchmarks
        </Button>
      </div>

      {/* AI Improvement Guidance Banner */}
      {data?.ai_recommendation && (
        <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-background to-purple-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" /> AI Executive Improvement Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-foreground leading-relaxed">
              {data.ai_recommendation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Peer Comparison Grid Table */}
      <Card className="border">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" /> Regional Accreditation Comparison Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 uppercase text-[10px] text-muted-foreground font-bold border-b">
                <tr>
                  <th className="p-3 pl-4">Institution Name</th>
                  <th className="p-3">CO Attainment</th>
                  <th className="p-3">Placement Rate</th>
                  <th className="p-3">Success Rate</th>
                  <th className="p-3">Faculty : Student</th>
                  <th className="p-3 pr-4">Research Output</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.all_institutions?.map((inst, i) => {
                  const isSelf = inst.name.includes('Self');
                  return (
                    <tr key={i} className={`hover:bg-muted/20 ${isSelf ? 'bg-primary/5 font-bold' : ''}`}>
                      <td className="p-3 pl-4 flex items-center gap-2">
                        {isSelf && <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary text-white font-bold">Current</span>}
                        <span>{inst.name}</span>
                      </td>
                      <td className="p-3 text-emerald-600 font-bold">{inst.co_attainment}%</td>
                      <td className="p-3 font-semibold">{inst.placement_rate}%</td>
                      <td className="p-3 font-semibold">{inst.student_success_rate}%</td>
                      <td className="p-3 font-semibold">1 : {inst.faculty_student_ratio}</td>
                      <td className="p-3 pr-4 font-semibold text-primary">{inst.research_output} Papers/Yr</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
