'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { KnowledgeGraphView } from '@/components/knowledge-graph/KnowledgeGraphView';

export default function KnowledgeGraphPage() {
  return (
    <DashboardLayout requiredRole="student">
      <KnowledgeGraphView />
    </DashboardLayout>
  );
}
