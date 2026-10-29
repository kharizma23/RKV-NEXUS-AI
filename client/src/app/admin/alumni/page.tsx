'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AlumniNetworkDashboard } from '@/components/admin/AlumniNetworkDashboard';

export default function AlumniPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <AlumniNetworkDashboard />
      </div>
    </DashboardLayout>
  );
}
