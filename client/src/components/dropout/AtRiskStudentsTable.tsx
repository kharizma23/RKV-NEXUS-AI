'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle, CheckCircle, Plus, User, Activity } from 'lucide-react';

interface AtRiskStudent {
  student_id: string;
  full_name: string;
  roll_number: string;
  risk_score: number;
  risk_level: string;
  attendance_rate: string;
  primary_trigger: string;
}

export function AtRiskStudentsTable() {
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAtRisk = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/faculty/dropout-risk/students');
      if (res.ok) {
        const json = await res.json();
        setStudents(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching at risk students', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtRisk();
  }, []);

  const handleScheduleIntervention = async (studentId: string) => {
    try {
      const res = await fetch('/api/v1/interventions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          intervention_type: 'ACADEMIC_COUNSELING',
          description: '1-on-1 proactive guidance session scheduled'
        })
      });
      if (res.ok) {
        alert('Academic intervention scheduled successfully!');
      }
    } catch (e) {
      console.error('Intervention error', e);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/30">🔴 {level}</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30">🟡 MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">🟢 LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            Predictive Student Dropout Risk Radar
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Machine learning early warning system combining attendance trends, CO progression, and continuous assessment logs.
          </p>
        </div>
      </div>

      <Card className="border">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Monitored Cohort Risk Table
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 uppercase text-[10px] text-muted-foreground font-bold border-b">
                <tr>
                  <th className="p-3 pl-4">Student</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">Primary Trigger</th>
                  <th className="p-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((st) => (
                  <tr key={st.student_id} className="hover:bg-muted/20">
                    <td className="p-3 pl-4 font-bold text-foreground">{st.full_name}</td>
                    <td className="p-3 font-semibold text-muted-foreground">{st.roll_number}</td>
                    <td className="p-3">{getRiskBadge(st.risk_level)}</td>
                    <td className="p-3 font-semibold">{st.attendance_rate}</td>
                    <td className="p-3 text-muted-foreground">{st.primary_trigger}</td>
                    <td className="p-3 pr-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleIntervention(st.student_id)}
                        className="text-[11px] h-7 font-bold border-rose-500/30 hover:bg-rose-500/10 text-rose-600"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Schedule Intervention
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
