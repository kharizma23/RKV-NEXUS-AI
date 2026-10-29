import React from 'react';
import { LeaderboardView } from '@/components/gamified/LeaderboardView';

export default function FacultyGamifiedPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <LeaderboardView gamifiedExamId="default-gamified" />
    </div>
  );
}
