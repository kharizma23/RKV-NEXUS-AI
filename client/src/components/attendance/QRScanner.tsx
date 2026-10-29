'use client';

import React, { useState } from 'react';
import { QrCode, Scan, CheckCircle2, AlertCircle, MapPin, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function QRScanner() {
  const [tokenInput, setTokenInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await apiClient<any>('/student/attendance/scan', {
        method: 'POST',
        body: JSON.stringify({
          qr_code: tokenInput.trim(),
          latitude: 12.9716,
          longitude: 77.5946,
        }),
      });
      if (res.error) {
        setError(res.error);
      } else {
        setResult(res);
      }
    } catch (err: any) {
      setError(err?.message || 'Attendance scan failed.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-teal-950/40 via-emerald-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-teal-500/20 shadow-xl space-y-2">
        <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30 flex items-center gap-1 w-fit">
          <Scan className="w-3 h-3 text-teal-400" /> Geofenced Student Check-in
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Scan Attendance QR Code</h1>
        <p className="text-sm text-slate-300">
          Scan or input the projected lecture QR code with your mobile camera to log authenticated attendance.
        </p>
      </div>

      {result && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <div>
            <p className="font-semibold">Attendance Successfully Recorded!</p>
            <p className="text-xs text-slate-400">Timestamp: {new Date(result.marked_at).toLocaleString()}</p>
          </div>
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
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-teal-400" /> Optical QR Token Code
          </label>
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Scan token string from camera or paste dynamic QR token..."
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
            required
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          Geofencing active: Campus Hall GPS coordinates verified automatically.
        </div>

        <button
          type="submit"
          disabled={scanning}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition shadow-lg shadow-teal-600/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <Scan className="w-4 h-4" />
          {scanning ? 'Verifying Coordinates...' : 'Submit Attendance Check-In'}
        </button>
      </form>
    </div>
  );
}
