'use client';

import React, { useState, useEffect } from 'react';
import { HardDrive, Cloud, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function OfflineAdminView() {
  const [offlineSessions, setOfflineSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSyncStatus = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/faculty/offline/sync-status');
      setOfflineSessions(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-500" />
            Offline Examination Synchronization Monitor
          </h1>
          <p className="text-xs text-muted-foreground">
            Track downloaded test packages, verify reconciliation timestamps, and manage air-gapped student attempts.
          </p>
        </div>
        <button
          onClick={fetchSyncStatus}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Sync Log
        </button>
      </div>

      <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
          Offline Session Packets ({offlineSessions.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
            Checking synchronized exam bundles...
          </div>
        ) : offlineSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
            No offline examination downloads or syncs recorded yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {offlineSessions.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <span>{item.student_name}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">({item.id.slice(0, 8)}...)</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Downloaded: {new Date(item.downloaded_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.synced_at ? (
                    <div className="text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Reconciled
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        {new Date(item.synced_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Awaiting Sync
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
