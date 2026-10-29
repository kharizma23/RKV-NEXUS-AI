'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ExamAnalyticsDashboard } from '@/components/admin/ExamAnalyticsDashboard';

export default function ExamAnalyticsPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <ExamAnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
}
