'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { GamificationLeaderboard } from '@/components/admin/GamificationLeaderboard';

export default function GamificationPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <GamificationLeaderboard />
      </div>
    </DashboardLayout>
  );
}
