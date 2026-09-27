'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ClassDoubtDashboard } from '@/components/doubts/ClassDoubtDashboard';

export default function FacultyClassDoubtsPage() {
  return (
    <DashboardLayout requiredRole="faculty">
      <ClassDoubtDashboard />
    </DashboardLayout>
  );
}
