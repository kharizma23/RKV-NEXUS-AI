'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, BookOpen, Sparkles, Plus, CheckCircle2, RefreshCw } from 'lucide-react';
import { SmartInstitutionOnboarding } from '@/components/admin/SmartInstitutionOnboarding';

interface Institution {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  departments: Array<{ id: string; name: string; code: string }>;
}

export default function AdminInstitutionsPage() {
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: institutions = [], isLoading } = useQuery<Institution[]>({
    queryKey: ['admin-institutions'],
    queryFn: () => apiClient<Institution[]>('/institutions'),
  });

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Institutions & Department Governance</h1>
            <p className="text-sm text-muted-foreground">Manage academic institutions, faculties, and department structures</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowOnboarding(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              SMART ONBOARDING 2.0 (UGC CODE)
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading institutions...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {institutions.map((inst) => (
              <Card key={inst.id} className="hover:border-indigo-500/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{inst.name}</CardTitle>
                        <CardDescription>Code: <strong className="font-mono text-foreground">{inst.code}</strong></CardDescription>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configured Departments ({inst.departments.length})</h4>
                  {inst.departments.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No departments configured yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {inst.departments.map((dept) => (
                        <div key={dept.id} className="p-3 border rounded-lg bg-muted/20 flex items-center justify-between">
                          <span className="text-sm font-medium">{dept.name}</span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-card border font-bold text-muted-foreground">{dept.code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <SmartInstitutionOnboarding
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-institutions'] })}
        />
      </div>
    </DashboardLayout>
  );
}
