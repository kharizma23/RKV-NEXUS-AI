'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SkillProfile } from '@/components/skills/SkillProfile';

export default function StudentSkillsPage() {
  return (
    <DashboardLayout requiredRole="student">
      <SkillProfile />
    </DashboardLayout>
  );
}
