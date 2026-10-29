'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">
      Redirecting to Admin Dashboard...
    </div>
  );
}
