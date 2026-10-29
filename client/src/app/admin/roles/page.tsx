'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRolesOverviewPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">
      Redirecting to User Directory & Roles...
    </div>
  );
}
