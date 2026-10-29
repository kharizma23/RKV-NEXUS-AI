import React from 'react';
import VRLabSetup from '@/components/vr/VRLabSetup';
import VRExamList from '@/components/vr/VRExamList';

export default function FacultyVRExamsPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">AR / VR Practical Lab Management</h1>
        <p className="text-slate-400 text-sm mt-1">
          Author virtual lab experiments, configure WebXR physics scenes, and review active student simulation exams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <VRLabSetup />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4">Published VR Experiments & Simulations</h2>
          <VRExamList />
        </div>
      </div>
    </div>
  );
}
