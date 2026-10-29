import React from 'react';
import { VariantGenerator } from '@/components/exam_variants/VariantGenerator';

export default function AdminVariantsOverviewPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <VariantGenerator />
    </div>
  );
}
