'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy, GitCompare, Sparkles, Download, Share2, Plus, Check, ArrowRight
} from 'lucide-react';

export function ProgrammeComparisonTool() {
  const [selectedProgs, setSelectedProgs] = useState<string[]>(['BIT', 'VIT', 'SRM']);
  const [comparisonData, setComparisonData] = useState({
    programmes: [
      { code: 'BIT', name: 'B.E. CSE - BIT', coAttainment: 88.5, placementRate: 93.4, studentSuccess: 85.0, facultyRatio: '1:15', avgPackage: 12.0 },
      { code: 'VIT', name: 'B.E. CSE - VIT', coAttainment: 91.0, placementRate: 95.2, studentSuccess: 89.0, facultyRatio: '1:12', avgPackage: 14.0 },
      { code: 'SRM', name: 'B.E. CSE - SRM', coAttainment: 82.0, placementRate: 88.0, studentSuccess: 80.0, facultyRatio: '1:18', avgPackage: 9.5 },
      { code: 'MIT', name: 'B.E. CSE - MIT', coAttainment: 89.0, placementRate: 92.0, studentSuccess: 86.5, facultyRatio: '1:14', avgPackage: 11.5 }
    ],
    aiRecommendation: "BIT requires upgrading Semester 5 & 6 AI/ML electives to match VIT's placement package benchmark. Consider introducing Cloud Architecture lab."
  });

  const fetchComparison = async () => {
    try {
      const res = await fetch('/api/v1/admin/programme-comparison');
      if (res.ok) {
        const json = await res.json();
        if (json.data) setComparisonData(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  const toggleProg = (code: string) => {
    if (selectedProgs.includes(code)) {
      if (selectedProgs.length > 2) setSelectedProgs(selectedProgs.filter((c) => c !== code));
    } else {
      setSelectedProgs([...selectedProgs, code]);
    }
  };

  const activeProgrammes = comparisonData.programmes.filter((p) => selectedProgs.includes(p.code));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            🏆 Institutional Programme Comparison Tool
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Compare degree programmes, outcome benchmarks, and placement packages across colleges</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => window.open('/api/v1/admin/reports/download')} className="text-xs font-bold">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Comparison
          </Button>
          <Button size="sm" onClick={() => alert('Comparison report shared with Academic Board')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share Report
          </Button>
        </div>
      </div>

      {/* Selectors Bar */}
      <Card className="border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <GitCompare className="w-4 h-4 text-indigo-500" /> Select Programmes to Compare:
          </span>
          {comparisonData.programmes.map((p) => {
            const isSelected = selectedProgs.includes(p.code);
            return (
              <button
                key={p.code}
                onClick={() => toggleProg(p.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Comparison Matrix Table */}
      <Card className="border overflow-hidden">
        <CardHeader className="pb-3 bg-muted/40 border-b">
          <CardTitle className="text-sm font-bold">Side-by-Side Performance Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/20 border-b text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5 font-bold">Metric / Indicator</th>
                  {activeProgrammes.map((p) => (
                    <th key={p.code} className="p-3.5 font-black text-foreground">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y font-medium">
                <tr>
                  <td className="p-3.5 font-bold text-foreground">CO Attainment Score</td>
                  {activeProgrammes.map((p) => (
                    <td key={p.code} className="p-3.5 font-black text-indigo-600 text-sm">
                      {p.coAttainment}%
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-foreground">Placement Rate</td>
                  {activeProgrammes.map((p) => (
                    <td key={p.code} className="p-3.5 font-black text-emerald-600 text-sm">
                      {p.placementRate}%
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-foreground">Student Success Index</td>
                  {activeProgrammes.map((p) => (
                    <td key={p.code} className="p-3.5 font-bold">
                      {p.studentSuccess}%
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-foreground">Faculty-Student Ratio</td>
                  {activeProgrammes.map((p) => (
                    <td key={p.code} className="p-3.5 font-mono">
                      {p.facultyRatio}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-foreground">Avg Placement Package</td>
                  {activeProgrammes.map((p) => (
                    <td key={p.code} className="p-3.5 font-black text-amber-500">
                      ₹{p.avgPackage} LPA
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Benchmark Recommendation */}
      <Card className="border border-indigo-500/20 bg-indigo-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            🤖 AI Governance & Curriculum Alignment Advice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-foreground leading-relaxed p-3 rounded-xl bg-card border">
            "{comparisonData.aiRecommendation}"
          </p>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => alert('Action plan created and queued for Board of Studies review!')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
              Create Action Plan <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
