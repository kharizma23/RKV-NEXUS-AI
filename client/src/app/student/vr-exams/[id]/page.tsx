import React from 'react';
import VRExamView from '@/components/vr/VRExamView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VRExamRoomPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <VRExamView examId={id} />
    </div>
  );
}
