'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { SecurityAnomalyMonitor } from '@/components/admin/SecurityAnomalyMonitor';

interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['admin-audit-logs'],
    queryFn: () => apiClient<AuditLog[]>('/audit-logs'),
  });

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6 pb-12">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Authentication & System Audit Logs 2.0</h1>
            <p className="text-sm text-muted-foreground">Immutable audit trail of authentication events, AI security monitoring & threat detection</p>
          </div>
        </div>

        {/* Feature 10: Security Anomaly Monitor */}
        <SecurityAnomalyMonitor />

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Recent Audit Trail ({logs.length})</CardTitle>
            <CardDescription>Chronological system event log</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading audit logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No audit log entries recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono text-xs">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground font-semibold">{log.resource}</td>
                        <td className="py-3 px-4 text-muted-foreground">{log.ip_address || '127.0.0.1'}</td>
                        <td className="py-3 px-4 text-muted-foreground truncate max-w-xs">
                          {log.details ? JSON.stringify(log.details) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
