'use client';

import React, { useState } from 'react';
import { Download, ShieldCheck, HardDrive, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface OfflineExamDownloadProps {
  examId: string;
  onDownloaded?: (packageDetails: any) => void;
}

export function OfflineExamDownload({ examId, onDownloaded }: OfflineExamDownloadProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadedPackage, setDownloadedPackage] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const res = await apiClient<any>(`/offline/download/${examId}`, {
        method: 'POST'
      });
      setDownloadedPackage(res.data);
      if (onDownloaded) onDownloaded(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to download offline bundle');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
          <HardDrive className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Download Encrypted Offline Exam Bundle</h3>
          <p className="text-xs text-muted-foreground">
            Enables zero-connectivity test taking. Questions are cryptographically sealed and answers persist safely in local IndexedDB.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {downloadedPackage ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-2">
          <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Offline Exam Bundle Ready in Local Cache!
          </div>
          <p className="text-muted-foreground">
            Offline Session ID: <span className="font-mono text-foreground font-semibold">{downloadedPackage.offline_exam_id}</span>
          </p>
          <p className="text-muted-foreground">
            Encrypted Payload: <span className="font-mono text-xs">{downloadedPackage.encrypted_payload}</span>
          </p>
          <p className="text-muted-foreground">
            Allowed Offline Duration: <span className="font-semibold text-foreground">{downloadedPackage.allowed_offline_duration_minutes} minutes</span>
          </p>
        </div>
      ) : (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {downloading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download & Decrypt Secure Exam Package
        </button>
      )}
    </div>
  );
}
