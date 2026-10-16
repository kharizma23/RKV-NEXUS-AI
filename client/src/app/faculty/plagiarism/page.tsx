'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FlaggedSubmissions } from '@/components/plagiarism/FlaggedSubmissions';

export default function FacultyPlagiarismPage() {
  return (
    <DashboardLayout requiredRole="faculty">
      <FlaggedSubmissions />
    </DashboardLayout>
  );
}
