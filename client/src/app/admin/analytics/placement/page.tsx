'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PlacementTracker } from '@/components/admin/PlacementTracker';

export default function PlacementAnalyticsPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <PlacementTracker />
      </div>
    </DashboardLayout>
  );
}
