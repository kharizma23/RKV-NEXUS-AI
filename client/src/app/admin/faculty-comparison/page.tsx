'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FacultyComparison } from '@/components/faculty_performance/FacultyComparison';
import { FacultyPerformanceDashboard } from '@/components/admin/FacultyPerformanceDashboard';
import { TrendingUp, Users, Award } from 'lucide-react';

export default function AdminFacultyComparisonPage() {
  const [activeTab, setActiveTab] = useState<'performance' | 'comparison'>('performance');

  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Faculty Performance & Departmental Governance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Teaching effectiveness evaluations, course assignments, and comparative department performance radar.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'performance'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Faculty Performance & Ratings
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Cross-Department Radar
            </button>
          </div>
        </div>

        {activeTab === 'performance' ? <FacultyPerformanceDashboard /> : <FacultyComparison />}
      </div>
    </DashboardLayout>
  );
}
