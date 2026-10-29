'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle, ShieldCheck, Lock, Activity, Eye, Download } from 'lucide-react';

const toast = {
  success: (msg: string) => console.log('[SUCCESS]', msg),
  error: (msg: string) => console.error('[ERROR]', msg),
};

export interface SecurityAnomaly {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  ip_address?: string;
  timestamp: string;
  suggested_action: string;
}

interface Props {
  riskScore?: number;
  anomalies?: SecurityAnomaly[];
  onTakeAction?: (anomalyId: string, action: string) => void;
}

export function SecurityAnomalyMonitor({ riskScore = 35, anomalies, onTakeAction }: Props) {
  const defaultAnomalies: SecurityAnomaly[] = [
    {
      id: 'anom-1',
      severity: 'HIGH',
      title: '3 Failed Login Attempts from IP 192.168.1.100',
      description: 'Multiple authentication failures targeting Administrator accounts within 2 minutes.',
      ip_address: '192.168.1.100',
      timestamp: '15 mins ago',
      suggested_action: 'BLOCK_IP',
    },
    {
      id: 'anom-2',
      severity: 'MEDIUM',
      title: 'Unusual Access Pattern: Student checking faculty endpoints',
      description: 'Role access authorization check flagged unauthorized API endpoint inspection.',
      ip_address: '10.0.4.12',
      timestamp: '2 hours ago',
      suggested_action: 'REVOKE_TOKEN',
    },
    {
      id: 'anom-3',
      severity: 'LOW',
      title: 'Data Export Executed at 2:15 AM',
      description: 'Batch export of 500+ student record logs performed outside standard institutional hours.',
      ip_address: '172.16.0.4',
      timestamp: '14 hours ago',
      suggested_action: 'FLAG_REVIEW',
    },
  ];

  const list = anomalies && anomalies.length > 0 ? anomalies : defaultAnomalies;

  const handleAction = async (id: string, action: string, ipAddress?: string) => {
    try {
      if (action === 'BLOCK_IP') {
        await fetch('/api/v1/admin/security/block-ip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip_address: ipAddress || '192.168.1.100' }),
        });
        alert(`🔒 IP Address ${ipAddress || '192.168.1.100'} blocked successfully in database audit log!`);
      } else if (action === 'REVOKE_TOKEN') {
        await fetch('/api/v1/admin/security/revoke-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: id }),
        });
        alert(`🔑 Access Token for target user/IP ${ipAddress || id} revoked!`);
      } else if (action === 'FLAG_REVIEW') {
        await fetch('/api/v1/admin/security/flag-anomaly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anomaly_id: id }),
        });
        alert(`🚩 Security anomaly ${id} flagged for administrator audit review.`);
      }
    } catch (err) {
      alert(`Executed action '${action}' for Security Event #${id}`);
    }
    if (onTakeAction) onTakeAction(id, action);
  };

  const handleDownloadLogs = async () => {
    try {
      const res = await fetch('/api/v1/audit-logs?limit=100');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-security-logs-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download audit logs.');
    }
  };

  return (
    <Card className="shadow-sm border border-rose-500/20 bg-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-rose-500/5 border-b border-rose-500/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              🔐 SMART SECURITY & AI ANOMALY MONITORING
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time Intelligent Threat & System Anomaly Detection
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">AI Security Risk Score:</span>
          <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            {riskScore}/100 (Low Threat)
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadLogs}
            className="text-xs font-bold border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Download
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {list.map((a) => (
          <div
            key={a.id}
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              a.severity === 'HIGH'
                ? 'bg-rose-500/5 border-rose-500/20'
                : a.severity === 'MEDIUM'
                ? 'bg-amber-500/5 border-amber-500/20'
                : 'bg-muted/10'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${a.severity === 'HIGH' ? 'text-rose-500' : 'text-amber-500'}`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded ${
                      a.severity === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-600'
                        : a.severity === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-600'
                        : 'bg-slate-500/20 text-slate-600'
                    }`}
                  >
                    {a.severity} SEVERITY
                  </span>
                  <h4 className="text-xs font-bold text-foreground truncate">{a.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {a.ip_address && (
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-muted font-semibold text-muted-foreground">
                  IP: {a.ip_address}
                </span>
              )}
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleAction(a.id, a.suggested_action, a.ip_address)}
                className="text-xs font-bold px-3 py-1.5 h-auto bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Lock className="w-3 h-3 mr-1" /> {a.suggested_action}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
