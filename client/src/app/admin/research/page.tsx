'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ResearchPublicationHub } from '@/components/admin/ResearchPublicationHub';

export default function ResearchPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <ResearchPublicationHub />
      </div>
    </DashboardLayout>
  );
}
