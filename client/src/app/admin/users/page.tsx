'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { User } from '@/types/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export default function AdminUserManagementPage() {
  const queryClient = useQueryClient();
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: () => apiClient<User[]>('/admin/users'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      apiClient(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const filteredUsers = users.filter((u) => {
    if (filterRole === 'ALL') return true;
    return u.roles.includes(filterRole as any);
  });

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground">Manage user accounts, roles, and status across the platform</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground font-medium">Filter:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="FACULTY">Faculty</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Accounts ({filteredUsers.length})</CardTitle>
            <CardDescription>Live database list of registered system users</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No users matching filter criteria.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="py-3 px-4">Name & Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">Approval</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-foreground">{u.full_name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-medium bg-primary/10 text-primary">
                            {u.roles.join(', ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                          {u.student_profile?.student_id_number || u.faculty_profile?.employee_id || 'System User'}
                        </td>
                        <td className="py-3 px-4">
                          {u.is_approved ? (
                            <span className="inline-flex items-center space-x-1 text-xs text-green-600 font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approved</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-xs text-amber-600 font-semibold">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {u.is_active ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-600 font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs bg-destructive/10 text-destructive font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant={u.is_active ? 'outline' : 'default'}
                            size="sm"
                            disabled={toggleStatusMutation.isPending}
                            onClick={() => toggleStatusMutation.mutate({ userId: u.id, isActive: !u.is_active })}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
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
