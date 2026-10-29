'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CertificateVerify from '@/components/certificates/CertificateVerify';

export default function PublicVerifyCertificateHashPage() {
  const params = useParams();
  const initialHash = typeof params?.hash === 'string' ? params.hash : undefined;

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <CertificateVerify initialHash={initialHash} />
      </div>
    </div>
  );
}
