'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Building2, Bed, AlertCircle, Wrench, Shield, CheckCircle2 } from 'lucide-react';

interface HostelOverview {
  total_hostels: number;
  total_rooms: number;
  total_capacity: number;
  total_occupied: number;
  occupancy_rate: number;
  hostels: Array<{
    id: string;
    name: string;
    type: string;
    total_rooms: number;
    capacity: number;
    occupied: number;
  }>;
  recent_complaints: Array<{
    id: string;
    room_number: string;
    hostel_name: string;
    complaint_type: string;
    description: string;
    status: string;
    created_at: string;
  }>;
}

export default function HostelAnalytics() {
  const [data, setData] = useState<HostelOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<HostelOverview>('/admin/hostel/overview');
      setData(res);
    } catch (err) {
      console.error('Failed to load hostel overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
        Hostel analytics data currently unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Hostels</span>
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{data.total_hostels}</p>
          <p className="text-xs text-slate-500 mt-1">Campus housing complexes</p>
        </div>

        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Capacity</span>
            <Bed className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{data.total_capacity} Beds</p>
          <p className="text-xs text-slate-500 mt-1">Across {data.total_rooms} residential rooms</p>
        </div>

        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Current Occupancy</span>
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400">{data.total_occupied} Residents</p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-cyan-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(data.occupancy_rate, 100)}%` }}
            />
          </div>
        </div>

        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Occupancy Rate</span>
            <CheckCircle2 className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-violet-400">{data.occupancy_rate}%</p>
          <p className="text-xs text-slate-500 mt-1">Utilization efficiency</p>
        </div>
      </div>

      {/* Hostels Breakdown */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-4">Hostel Complex Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.hostels.map((h) => {
            const pct = h.capacity > 0 ? Math.round((h.occupied / h.capacity) * 100) : 0;
            return (
              <div key={h.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-white">{h.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 capitalize">
                      {h.type} Hostel
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-indigo-400">{pct}% full</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Occupied: <b className="text-white">{h.occupied}</b></span>
                  <span>Capacity: <b className="text-white">{h.capacity}</b></span>
                  <span>Rooms: <b className="text-white">{h.total_rooms}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Facilities Tickets Overview */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            Active Facilities & Maintenance Queue
          </h3>
          <span className="text-xs text-slate-400">
            {data.recent_complaints.length} tickets reported
          </span>
        </div>

        {data.recent_complaints.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No maintenance complaints currently open.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Issue Details</th>
                  <th className="px-4 py-3">Reported</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.recent_complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-medium text-white">
                      {c.hostel_name} - Rm {c.room_number}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase">
                        {c.complaint_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-300">{c.description}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        c.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : c.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {c.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
