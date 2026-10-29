'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FacultyGroupCohortsDashboard } from '@/components/group_exams/FacultyGroupCohortsDashboard';

export default function FacultyGroupExamsPage() {
  return (
    <DashboardLayout requiredRole="faculty">
      <div className="p-6 space-y-6">
        <FacultyGroupCohortsDashboard />
      </div>
    </DashboardLayout>
  );
}
