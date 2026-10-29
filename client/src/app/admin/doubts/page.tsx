'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ClassDoubtDashboard } from '@/components/doubts/ClassDoubtDashboard';

export default function AdminDoubtsPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <ClassDoubtDashboard />
      </div>
    </DashboardLayout>
  );
}
