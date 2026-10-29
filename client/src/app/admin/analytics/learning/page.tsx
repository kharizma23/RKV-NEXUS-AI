'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AILearningAnalytics } from '@/components/admin/AILearningAnalytics';

export default function LearningAnalyticsPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <AILearningAnalytics />
      </div>
    </DashboardLayout>
  );
}
