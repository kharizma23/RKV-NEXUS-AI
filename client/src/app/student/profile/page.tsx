'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TwoFactorSetup } from '@/components/two-factor/TwoFactorSetup';

export default function StudentProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout requiredRole="student">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Account & Credentials</CardTitle>
            <CardDescription>System profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-xs">{user?.id}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-muted-foreground">Full Name:</span>
              <span className="font-semibold">{user?.full_name}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-muted-foreground">Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-muted-foreground">Student ID Number:</span>
              <span className="font-semibold">{user?.student_profile?.student_id_number || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 py-2">
              <span className="text-muted-foreground">Assigned Roles:</span>
              <span className="font-mono text-xs">{user?.roles?.join(', ')}</span>
            </div>
          </CardContent>
        </Card>

        {/* 2FA Security Configuration */}
        <TwoFactorSetup />
      </div>
    </DashboardLayout>
  );
}
