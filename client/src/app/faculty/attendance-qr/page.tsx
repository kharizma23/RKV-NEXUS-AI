'use client';

import React, { useState } from 'react';
import { QRGenerator } from '@/components/attendance/QRGenerator';
import { AttendanceReport } from '@/components/attendance/AttendanceReport';
import { QrCode, BarChart3 } from 'lucide-react';

export default function FacultyAttendanceQRPage() {
  const [tab, setTab] = useState<'qr' | 'report'>('qr');

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setTab('qr')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            tab === 'qr' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" /> Live QR Projection
        </button>
        <button
          onClick={() => setTab('report')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            tab === 'report' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Attendance Report
        </button>
      </div>

      {tab === 'qr' ? <QRGenerator /> : <AttendanceReport />}
    </div>
  );
}
