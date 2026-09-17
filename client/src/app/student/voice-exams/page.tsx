import React from 'react';
import { VoiceRecorder } from '@/components/voice_exam/VoiceRecorder';

export default function StudentVoiceExamsPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <VoiceRecorder
        examId="e1a00000-0000-0000-0000-000000000001"
        questionId="q1a00000-0000-0000-0000-000000000001"
      />
    </div>
  );
}
