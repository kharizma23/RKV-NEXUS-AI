'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Heart, Activity, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, XCircle, RefreshCw,
  Download, GitCompare, Search, Building2, Eye
} from 'lucide-react';

export interface InstitutionHealthItem {
  id: string;
  name: string;
  code: string;
  healthScore: number;
  coAttainment: number;
  studentSuccess: number;
  placementRate: number;
  trend: number;
  totalStudents: number;
  totalFaculty: number;
  totalProgrammes: number;
  alerts: number;
}

export function InstitutionHealthMonitor() {
  const [selectedInst, setSelectedInst] = useState<InstitutionHealthItem | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'grid'>('cards');
  const [sortBy, setSortBy] = useState<'health' | 'name' | 'trend'>('health');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<InstitutionHealthItem[]>([
    {
      id: 'inst-bit',
      name: 'Bannari Amman Institute of Technology',
      code: 'BIT',
      healthScore: 93,
      coAttainment: 88.5,
      studentSuccess: 91.2,
      placementRate: 93.4,
      trend: 5,
      totalStudents: 420,
      totalFaculty: 45,
      totalProgrammes: 12,
      alerts: 0
    },
    {
      id: 'inst-vit',
      name: 'Vellore Institute of Technology',
      code: 'VIT',
      healthScore: 71,
      coAttainment: 74.0,
      studentSuccess: 78.5,
      placementRate: 85.0,
      trend: -3,
      totalStudents: 850,
      totalFaculty: 90,
      totalProgrammes: 24,
      alerts: 2
    },
    {
      id: 'inst-srm',
      name: 'SRM Institute of Science and Technology',
      code: 'SRM',
      healthScore: 45,
      coAttainment: 52.0,
      studentSuccess: 58.0,
      placementRate: 64.0,
      trend: 2,
      totalStudents: 620,
      totalFaculty: 60,
      totalProgrammes: 18,
      alerts: 5
    },
    {
      id: 'inst-mit',
      name: 'Madras Institute of Technology',
      code: 'MIT',
      healthScore: 88,
      coAttainment: 86.0,
      studentSuccess: 89.0,
      placementRate: 91.5,
      trend: 2,
      totalStudents: 380,
      totalFaculty: 40,
      totalProgrammes: 10,
      alerts: 0
    },
    {
      id: 'inst-psg',
      name: 'PSG College of Technology',
      code: 'PSG',
      healthScore: 65,
      coAttainment: 68.5,
      studentSuccess: 71.0,
      placementRate: 79.0,
      trend: -1,
      totalStudents: 500,
      totalFaculty: 52,
      totalProgrammes: 15,
      alerts: 3
    },
    {
      id: 'inst-cit',
      name: 'Coimbatore Institute of Technology',
      code: 'CIT',
      healthScore: 38,
      coAttainment: 42.0,
      studentSuccess: 46.0,
      placementRate: 55.0,
      trend: 8,
      totalStudents: 310,
      totalFaculty: 35,
      totalProgrammes: 8,
      alerts: 6
    }
  ]);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/health-monitor');
      if (res.ok) {
        const json = await res.json();
        if (json.data) setInstitutions(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10 font-bold';
    if (score >= 60) return 'text-amber-500 border-amber-500/30 bg-amber-500/10 font-bold';
    return 'text-rose-500 border-rose-500/30 bg-rose-500/10 font-bold';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />;
    return <XCircle className="h-5 w-5 text-rose-500 shrink-0" />;
  };

  const filtered = institutions
    .filter(
      (inst) =>
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'health') return b.healthScore - a.healthScore;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return Math.abs(b.trend) - Math.abs(a.trend);
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 animate-pulse" />
            🏥 Live Institution Health Monitor
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time health status of all onboarded colleges</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchHealthData} className="text-xs font-bold">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open('/api/v1/admin/reports/download')} className="text-xs font-bold">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-card p-3 rounded-xl border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">View:</span>
          <Button variant={viewMode === 'cards' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('cards')} className="text-xs">
            Cards
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')} className="text-xs">
            List
          </Button>
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')} className="text-xs">
            Grid
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">Sort:</span>
          <Button variant={sortBy === 'health' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('health')} className="text-xs">
            Health Score
          </Button>
          <Button variant={sortBy === 'name' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('name')} className="text-xs">
            Name
          </Button>
          <Button variant={sortBy === 'trend' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('trend')} className="text-xs">
            Trend
          </Button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search institution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground px-1">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 🟢 Good (80%+)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 🟡 Average (60-79%)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 🔴 Critical (&lt;60%)</span>
      </div>

      {/* Health Cards */}
      <div
        className={`grid ${
          viewMode === 'cards'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-3'
            : 'grid-cols-1'
        } gap-4`}
      >
        {filtered.map((inst) => (
          <Card
            key={inst.id}
            onClick={() => setSelectedInst(inst)}
            className={`cursor-pointer hover:shadow-md transition-all border ${
              selectedInst?.id === inst.id ? 'ring-2 ring-primary border-primary' : ''
            }`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {getHealthIcon(inst.healthScore)}
                    <h3 className="font-bold text-xs text-foreground truncate">{inst.name}</h3>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{inst.code}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${getHealthColor(inst.healthScore)}`}>
                  {inst.healthScore}%
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                    <span>CO Attainment</span>
                    <span>{inst.coAttainment}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${inst.coAttainment}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                    <span>Student Success</span>
                    <span>{inst.studentSuccess}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${inst.studentSuccess}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                    <span>Placement Rate</span>
                    <span>{inst.placementRate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${inst.placementRate}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold">
                  {inst.trend >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span className={inst.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {Math.abs(inst.trend)}% {inst.trend >= 0 ? '↑' : '↓'}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="text-[10px] font-bold h-7 px-3">
                  <Eye className="w-3 h-3 mr-1" /> View Details
                </Button>
              </div>

              <div className="pt-2 border-t grid grid-cols-3 gap-1 text-center text-[10px] text-muted-foreground font-semibold">
                <div>
                  <p className="font-bold text-foreground text-xs">{inst.totalStudents}</p>
                  <p>Students</p>
                </div>
                <div>
                  <p className="font-bold text-foreground text-xs">{inst.totalFaculty}</p>
                  <p>Faculty</p>
                </div>
                <div>
                  <p className="font-bold text-foreground text-xs">{inst.totalProgrammes}</p>
                  <p>Programmes</p>
                </div>
              </div>

              {inst.alerts > 0 && (
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-600 text-[10px] font-bold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{inst.alerts} critical alerts requiring admin attention</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Institution Detail Modal */}
      {selectedInst && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-card border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-foreground">{selectedInst.name}</h3>
                <p className="text-xs text-muted-foreground">Code: {selectedInst.code} | Health Score: {selectedInst.healthScore}%</p>
              </div>
              <button onClick={() => setSelectedInst(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-muted-foreground font-bold">CO Attainment</p>
                <p className="text-xl font-black text-emerald-600">{selectedInst.coAttainment}%</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-[10px] text-muted-foreground font-bold">Student Success</p>
                <p className="text-xl font-black text-indigo-600">{selectedInst.studentSuccess}%</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-[10px] text-muted-foreground font-bold">Placement Rate</p>
                <p className="text-xl font-black text-cyan-600">{selectedInst.placementRate}%</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-foreground">AI Institutional Recommendations:</p>
              <div className="p-2.5 rounded bg-muted/40 text-muted-foreground">
                • {selectedInst.name} is compliant with AICTE 2026 guidelines across {selectedInst.totalProgrammes} degree programmes.
              </div>
              <div className="p-2.5 rounded bg-muted/40 text-muted-foreground">
                • Assigned {selectedInst.totalFaculty} faculty leads managing {selectedInst.totalStudents} enrolled students.
              </div>
            </div>

            <div className="flex justify-end pt-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedInst(null)}>
                Close
              </Button>
              <Button size="sm" onClick={() => alert(`Navigating to full audit profile for ${selectedInst.name}`)}>
                Manage Institution
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
