'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FacultyProctoringCommandDashboard } from '@/components/proctoring/FacultyProctoringCommandDashboard';

export default function AdminProctoringPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <FacultyProctoringCommandDashboard />
      </div>
    </DashboardLayout>
  );
}
