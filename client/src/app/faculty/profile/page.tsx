'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function FacultyProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Faculty Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Academic Appointment Details</CardTitle>
            <CardDescription>System credentials and approval status</CardDescription>
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
              <span className="text-muted-foreground">Employee ID:</span>
              <span className="font-semibold">{user?.faculty_profile?.employee_id || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-muted-foreground">Designation:</span>
              <span>{user?.faculty_profile?.designation || 'Faculty Member'}</span>
            </div>
            <div className="grid grid-cols-2 py-2">
              <span className="text-muted-foreground">Administrator Approval:</span>
              <span className="text-green-600 font-semibold">Approved</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
