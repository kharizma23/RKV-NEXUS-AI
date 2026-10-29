'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AIAssistantChatbot } from '@/components/admin/AIAssistantChatbot';

export default function AdminAIAssistantPage() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <AIAssistantChatbot />
      </div>
    </DashboardLayout>
  );
}
