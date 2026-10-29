'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { IndustryPartnershipsHub } from '@/components/admin/IndustryPartnershipsHub';

export default function PartnershipsPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <IndustryPartnershipsHub />
      </div>
    </DashboardLayout>
  );
}
