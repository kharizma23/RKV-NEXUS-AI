'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FacultyFlexibleWindowsDashboard } from '@/components/flexible/FacultyFlexibleWindowsDashboard';

export default function FacultyFlexibleWindowsPage() {
  return (
    <DashboardLayout requiredRole="faculty">
      <div className="p-6 space-y-6">
        <FacultyFlexibleWindowsDashboard />
      </div>
    </DashboardLayout>
  );
}
