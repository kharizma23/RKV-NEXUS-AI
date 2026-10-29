'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FeedbackSurveySystem } from '@/components/admin/FeedbackSurveySystem';

export default function FeedbackPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <FeedbackSurveySystem />
      </div>
    </DashboardLayout>
  );
}
