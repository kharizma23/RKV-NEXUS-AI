'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle2, AlertCircle, Calendar, Download, FileText } from 'lucide-react';

export function ComplianceAccreditationDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompliance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/compliance-accreditation');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch compliance accreditation', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            📋 Compliance & Accreditation Dashboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">AICTE, NAAC, and NBA statutory compliance tracking and regulatory audit schedules</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => alert("Detailed report opened!")} className="text-xs font-bold">
            <FileText className="w-3.5 h-3.5 mr-1" /> View Report
          </Button>
          <Button size="sm" onClick={() => alert("Compliance report downloaded!")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
            <Download className="w-3.5 h-3.5 mr-1" /> Generate Compliance Report
          </Button>
        </div>
      </div>

      {/* Accreditation Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">AICTE Status</p>
              <p className="text-xl font-black text-emerald-600 mt-1">🏅 Approved</p>
              <p className="text-[10px] font-bold text-muted-foreground mt-0.5 font-mono">Valid Till: 2027</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-500/40" />
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">NAAC Grade</p>
              <p className="text-xl font-black text-emerald-600 mt-1">🏅 Grade A+</p>
              <p className="text-[10px] font-bold text-muted-foreground mt-0.5 font-mono">Valid Till: 2028</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-500/40" />
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">NBA Status</p>
              <p className="text-xl font-black text-emerald-600 mt-1">🏅 Accredited</p>
              <p className="text-[10px] font-bold text-muted-foreground mt-0.5 font-mono">Valid Till: 2027</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-500/40" />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Compliance Checklist */}
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Regulatory Compliance Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {data?.checklist?.map((ck: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                <span className="text-xs font-bold text-foreground">
                  {ck.severity === 'GREEN' ? '✅' : '⚠️'} {ck.item}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  ck.severity === 'GREEN' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                }`}>
                  {ck.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Audits */}
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Scheduled Regulatory Audits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {data?.upcomingAudits?.map((ad: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border bg-card flex justify-between items-center">
                <span className="text-xs font-bold text-foreground">📅 {ad.agency}</span>
                <span className="text-xs font-black text-indigo-600 font-mono">{ad.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
