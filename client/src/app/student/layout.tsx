import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ChatWidget } from '@/components/chatbot/ChatWidget';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout requiredRole="student">
      {children}
      <ChatWidget />
    </DashboardLayout>
  );
}
