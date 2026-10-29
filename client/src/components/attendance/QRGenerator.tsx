'use client';

import React, { useState } from 'react';
import { QrCode, Clock, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function QRGenerator() {
  const [validMinutes, setValidMinutes] = useState(15);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/faculty/attendance/session', {
        method: 'POST',
        body: JSON.stringify({ valid_minutes: validMinutes }),
      });
      setSession(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize QR attendance session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-emerald-500/20 shadow-xl space-y-2">
        <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1 w-fit">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Geofenced Dynamic QR
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Generate Live Lecture Attendance QR</h1>
        <p className="text-sm text-slate-300">
          Generates a time-rotating encrypted QR code for classroom projection. Auto-syncs directly with OBE Course Outcome attainment metrics.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Session Configuration
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Validity Window (Minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={validMinutes}
              onChange={(e) => setValidMinutes(Number(e.target.value))}
              className="w-full px-4 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <QrCode className="w-4 h-4" />
            {loading ? 'Initializing Session...' : 'Generate Projected QR Code'}
          </button>
        </div>

        {/* QR Display */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-xl">
          {session ? (
            <div className="text-center space-y-3">
              <div className="p-5 bg-white rounded-2xl shadow-2xl inline-block border-4 border-emerald-500/40 animate-in zoom-in">
                <div className="w-48 h-48 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-2">
                  <QrCode className="w-24 h-24 text-emerald-400" />
                  <span className="text-[10px] font-mono text-slate-400 break-all leading-tight">
                    {session.qr_code.substring(0, 24)}...
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Session Active
                </span>
                <p className="text-xs text-slate-400">
                  Valid Until: {new Date(session.valid_until).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-2">
              <QrCode className="w-16 h-16 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-400">Click generate to launch projection QR</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
