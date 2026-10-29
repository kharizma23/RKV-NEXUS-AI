import React from 'react';
import { EmotionMonitor } from '@/components/emotion/EmotionMonitor';

export default function StudentEmotionPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <EmotionMonitor examId="e1a00000-0000-0000-0000-000000000001" />
    </div>
  );
}
