import React from 'react';
import { GroupExamView } from '@/components/group_exams/GroupExamView';

export default function StudentGroupExamsPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <GroupExamView groupExamId="e1a00000-0000-0000-0000-000000000001" />
    </div>
  );
}
