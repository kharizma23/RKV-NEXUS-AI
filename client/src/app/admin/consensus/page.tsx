'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminConsensusPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">
      Redirecting to Executive Dashboard...
    </div>
  );
}
