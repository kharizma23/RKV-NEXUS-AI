'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, CheckCircle2, Award } from 'lucide-react';

export default function AccreditationReportPage() {
  const handleDownloadReport = () => {
    const reportText = `NBA / NAAC ACCREDITATION AUDIT REPORT\n` +
      `Subject: Artificial Intelligence (CS2026) - Semester 7\n` +
      `Institution: Bannari Amman Institute of Technology (BIT)\n` +
      `-----------------------------------------------------\n` +
      `CO ATTAINMENT SUMMARY:\n` +
      `- CO1 (Foundation & Search): 82% (Target Met ✅)\n` +
      `- CO2 (Neural Networks): 75% (Target Met ✅)\n` +
      `- CO3 (Machine Learning): 58% (Below Target ⚠️ - Remedial Action Required)\n` +
      `- CO4 (Deep Learning): 70% (Target Met ✅)\n\n` +
      `EXAM BREAKDOWN MATRIX:\n` +
      `- Internal 1: CO1: 85%, CO2: 78%, CO3: 62%, CO4: 72% | Overall: 74%\n` +
      `- Internal 2: CO1: 80%, CO2: 72%, CO3: 55%, CO4: 68% | Overall: 69%\n` +
      `- Final Exam: CO1: 82%, CO2: 75%, CO3: 58%, CO4: 70% | Overall: 71%\n`;

    const element = document.createElement('a');
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'NBA_Accreditation_Audit_Report_CS2026.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-500" />
              📄 NBA & NAAC Accreditation Audit-Ready Report Generator
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Standardized OBE reports formatted for external accreditation bodies and peer review visits.
            </p>
          </div>

          <Button size="sm" onClick={handleDownloadReport} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm">
            <Download className="w-3.5 h-3.5 mr-1" /> Download PDF Audit Report
          </Button>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase text-foreground">
              Criteria 3 & 4 Attainment Summary Matrix
            </CardTitle>
            <span className="text-xs font-bold text-emerald-500">Target Threshold: 70.0% | Actual: 71.25%</span>
          </CardHeader>

          <CardContent className="p-6 space-y-6 text-xs">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border bg-card text-center">
                <span className="text-muted-foreground font-bold">NBA Target Threshold</span>
                <div className="text-3xl font-black font-mono text-indigo-500 mt-1">70.0%</div>
              </div>
              <div className="p-4 rounded-xl border bg-card text-center">
                <span className="text-muted-foreground font-bold">Actual Cohort Attainment</span>
                <div className="text-3xl font-black font-mono text-emerald-500 mt-1">71.25%</div>
              </div>
              <div className="p-4 rounded-xl border bg-card text-center">
                <span className="text-muted-foreground font-bold">Audit Status</span>
                <div className="text-3xl font-black font-mono text-emerald-500 mt-1">PASSED ✅</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Compliance Checkpoints
              </h4>
              <p className="text-muted-foreground">✅ All CO-to-PO mappings verified</p>
              <p className="text-muted-foreground">✅ Remedial action plans closed for CO3</p>
              <p className="text-muted-foreground">✅ Bloom's taxonomy cognitive levels distributed across L1-L6</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
