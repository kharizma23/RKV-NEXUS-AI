'use client';

import React, { useState } from 'react';
import { QrCode, Scan, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function IDScanner() {
  const [token, setToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setScanning(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiClient<any>('/faculty/scan-id', {
        method: 'POST',
        body: JSON.stringify({ qr_code: token.trim() }),
      });
      if (res.valid) {
        setResult(res);
      } else {
        setError(res.error || 'Identity verification failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error processing scan token.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-blue-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-indigo-500/20 shadow-xl space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Faculty Digital ID Scanner</h1>
        <p className="text-sm text-slate-300">
          Verify physical presence and examine identity tokens for examination hall admission and lab access.
        </p>
      </div>

      {result && (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm space-y-1">
          <div className="flex items-center gap-2 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Verified Scholar: {result.student_name}
          </div>
          <p className="text-xs text-slate-400">UUID: {result.student_id}</p>
          <p className="text-xs text-slate-400">Timestamp: {new Date(result.verified_at).toLocaleTimeString()}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleScan} className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Scan Input / Token String</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Scan barcode/QR code from student device..."
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={scanning}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
          {scanning ? 'Verifying...' : 'Verify Student ID'}
        </button>
      </form>
    </div>
  );
}
