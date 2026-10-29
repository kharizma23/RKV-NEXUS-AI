'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ComplianceAccreditationDashboard } from '@/components/admin/ComplianceAccreditationDashboard';

export default function CompliancePage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <ComplianceAccreditationDashboard />
      </div>
    </DashboardLayout>
  );
}
