import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout requiredRole="faculty">{children}</DashboardLayout>;
}
