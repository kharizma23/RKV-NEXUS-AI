import React from 'react';
import { ImprovementCard } from '@/components/improvement/ImprovementCard';

export default function StudentImprovementPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <ImprovementCard currentExamId="demo-exam-cur" />
    </div>
  );
}
