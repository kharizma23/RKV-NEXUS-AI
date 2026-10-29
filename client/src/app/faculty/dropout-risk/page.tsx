'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AtRiskStudentsTable } from '@/components/dropout/AtRiskStudentsTable';

export default function FacultyDropoutRiskPage() {
  return (
    <DashboardLayout requiredRole="faculty">
      <AtRiskStudentsTable />
    </DashboardLayout>
  );
}
