'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SmartLibraryManager } from '@/components/admin/SmartLibraryManager';

export default function SmartLibraryPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <SmartLibraryManager />
      </div>
    </DashboardLayout>
  );
}
