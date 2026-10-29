'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudUpload, CheckCircle, RefreshCw } from 'lucide-react';

interface OfflineSyncStatusProps {
  pendingSyncCount?: number;
  onSyncTrigger?: () => Promise<void>;
  status?: string;
}

export function OfflineSyncStatus({ pendingSyncCount = 0, onSyncTrigger, status = 'ONLINE' }: OfflineSyncStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncedRecently, setSyncedRecently] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      if (onSyncTrigger && pendingSyncCount > 0) {
        handleSync();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSyncCount, onSyncTrigger]);

  const handleSync = async () => {
    if (!onSyncTrigger) return;
    setSyncing(true);
    try {
      await onSyncTrigger();
      setSyncedRecently(true);
      setTimeout(() => setSyncedRecently(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Wifi className="w-3.5 h-3.5" /> Online
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
          <WifiOff className="w-3.5 h-3.5" /> Offline Mode (IndexedDB Cached)
        </span>
      )}

      {pendingSyncCount > 0 && (
        <button
          onClick={handleSync}
          disabled={!isOnline || syncing}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
        >
          {syncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CloudUpload className="w-3.5 h-3.5" />
          )}
          Sync {pendingSyncCount} Answer{pendingSyncCount !== 1 ? 's' : ''}
        </button>
      )}

      {syncedRecently && (
        <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 animate-in fade-in">
          <CheckCircle className="w-3.5 h-3.5" /> Synced to Server
        </span>
      )}
    </div>
  );
}
