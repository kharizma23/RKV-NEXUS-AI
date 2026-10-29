import React from 'react';
import { StudentExamProctor } from '@/components/proctoring/StudentExamProctor';

export default function StudentProctoringPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <StudentExamProctor examId="e1a00000-0000-0000-0000-000000000001" examTitle="Autonomous Operating Systems Final" />
    </div>
  );
}
