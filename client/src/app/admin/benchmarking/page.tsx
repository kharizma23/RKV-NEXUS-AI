'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BenchmarkingDashboard } from '@/components/benchmarking/BenchmarkingDashboard';
import { InstitutionHealthMonitor } from '@/components/admin/InstitutionHealthMonitor';
import { Building2, Activity, BarChart3 } from 'lucide-react';

export default function BenchmarkingPage() {
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'health'>('benchmarks');

  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-600" />
              Institutional Benchmarking & Health Intelligence
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cross-institutional attainment scores, OBE performance metrics, and college health indicators.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'benchmarks'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              OBE Benchmarks
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'health'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              College Health Monitor
            </button>
          </div>
        </div>

        {activeTab === 'benchmarks' ? <BenchmarkingDashboard /> : <InstitutionHealthMonitor />}
      </div>
    </DashboardLayout>
  );
}
