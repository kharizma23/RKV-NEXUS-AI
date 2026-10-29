'use client';

import React from 'react';
import CertificateVerify from '@/components/certificates/CertificateVerify';

export default function PublicVerifyCertificatePage() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <CertificateVerify />
      </div>
    </div>
  );
}
