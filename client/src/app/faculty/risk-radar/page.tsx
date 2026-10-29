'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Eye, Users, AlertTriangle } from 'lucide-react';

export default function StudentRiskRadarPage() {
  const [selectedRiskStudent, setSelectedRiskStudent] = useState<any | null>(null);

  const riskStudents = [
    { name: 'Sita', roll: '23CSE005', risk: 'HIGH', score: '38%', weakCo: 'CO3, CO2', att: '65%', color: 'border-rose-500/40 bg-rose-500/5' },
    { name: 'Rahul', roll: '23CSE004', risk: 'HIGH', score: '45%', weakCo: 'CO3', att: '70%', color: 'border-rose-500/40 bg-rose-500/5' },
    { name: 'Priya', roll: '23CSE003', risk: 'MEDIUM', score: '62%', weakCo: 'CO3', att: '82%', color: 'border-amber-500/40 bg-amber-500/5' },
    { name: 'Kharizma', roll: '23CSE002', risk: 'SAFE', score: '78%', weakCo: 'None', att: '92%', color: 'border-emerald-500/40 bg-emerald-500/5' },
    { name: 'Dharshini', roll: '23CSE001', risk: 'SAFE', score: '95%', weakCo: 'None', att: '98%', color: 'border-emerald-500/40 bg-emerald-500/5' },
    { name: 'Arjun', roll: '23CSE006', risk: 'SAFE', score: '82%', weakCo: 'None', att: '90%', color: 'border-emerald-500/40 bg-emerald-500/5' },
  ];

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            🚨 AI/ML Student Performance Risk Radar
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify at-risk students 6 weeks before final exams and dispatch automated remedial tutorial interventions.
          </p>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Class Risk Roster (45 Students)
            </CardTitle>
            <span className="text-xs font-bold text-rose-500">2 Critical • 3 At-Risk • 40 Safe</span>
          </CardHeader>

          <CardContent className="p-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {riskStudents.map((st, idx) => (
                <div key={idx} className={`p-4 rounded-xl border space-y-2 ${st.color}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-foreground">{st.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">({st.roll})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      st.risk === 'HIGH' ? 'bg-rose-500 text-white' : st.risk === 'MEDIUM' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'
                    }`}>
                      {st.risk} RISK
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-muted-foreground">Avg Score:</span> <strong className="text-foreground">{st.score}</strong></div>
                    <div><span className="text-muted-foreground">Attendance:</span> <strong className="text-foreground">{st.att}</strong></div>
                  </div>

                  <div className="text-[11px]">
                    <span className="text-muted-foreground">Weak COs:</span> <strong className="text-rose-400">{st.weakCo}</strong>
                  </div>

                  <Button size="sm" variant="outline" onClick={() => setSelectedRiskStudent(st)} className="w-full text-[10px] font-bold h-7">
                    <Eye className="w-3 h-3 mr-1" /> View Risk Breakdown
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Diagnostic Modal */}
        {selectedRiskStudent && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedRiskStudent(null); }}
            className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in text-xs"
          >
            <div className="bg-card border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-black text-foreground text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> Risk Breakdown — {selectedRiskStudent.name} ({selectedRiskStudent.roll})
                </h3>
                <button onClick={() => setSelectedRiskStudent(null)} className="font-bold text-muted-foreground">✕</button>
              </div>

              <div className="space-y-2">
                <p><strong>Overall Class Rank:</strong> 44 / 45</p>
                <p><strong>Weak Topics:</strong> Machine Learning Classification, Decision Trees, CO3.</p>
                <p><strong>Recommended Intervention:</strong> Assign remedial tutorial batch & schedule 1-on-1 counseling.</p>
              </div>

              <div className="pt-3 border-t flex justify-end">
                <Button size="sm" onClick={() => { alert(`Remedial alert dispatched to ${selectedRiskStudent.name}!`); setSelectedRiskStudent(null); }} className="bg-indigo-600 text-white font-bold text-xs">
                  Dispatch Remedial Assignment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
