import React from 'react';
import { CounterfactualView } from '@/components/counterfactual/CounterfactualView';

export default function StudentCounterfactualPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <CounterfactualView submissionId="sub-demo-current" />
    </div>
  );
}
