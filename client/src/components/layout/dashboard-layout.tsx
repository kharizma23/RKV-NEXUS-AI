'use client';

import React, { useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { UserRole } from '@/types/auth';

const DashboardContext = createContext<boolean>(false);

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole: 'student' | 'faculty' | 'admin';
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isInsideDashboard = useContext(DashboardContext);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else {
        const uppercaseRole = requiredRole.toUpperCase() as UserRole;
        if (!user.roles.includes(uppercaseRole) && !user.roles.includes('ADMIN')) {
          router.push('/unauthorized');
        }
      }
    }
  }, [user, isLoading, requiredRole, router]);

  // If already nested inside an outer DashboardLayout, pass children through directly
  if (isInsideDashboard) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Full-screen mode for take exam
  const isFullscreenExam = pathname?.includes('/examinations/') && pathname?.endsWith('/take');
  if (isFullscreenExam) {
    return (
      <DashboardContext.Provider value={true}>
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </DashboardContext.Provider>
    );
  }

  return (
    <DashboardContext.Provider value={true}>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar role={requiredRole} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
