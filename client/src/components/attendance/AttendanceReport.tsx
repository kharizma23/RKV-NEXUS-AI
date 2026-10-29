'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Users, Calendar, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function AttendanceReport() {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any>('/admin/attendance/overview');
      setAdminData(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Faculty Attendance Audit Report
          </h3>
          <button
            onClick={fetchData}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {adminData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400">Class Attendance Rate</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{adminData.campus_attendance_rate}%</p>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400">Total Check-ins Logged</span>
              <p className="text-2xl font-bold text-white mt-1">{adminData.total_sessions_logged}</p>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400">Geofence Compliance</span>
              <p className="text-2xl font-bold text-teal-400 mt-1">{adminData.geofence_verified_pct}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
