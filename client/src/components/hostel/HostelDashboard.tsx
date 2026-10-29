'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import ComplaintForm from './ComplaintForm';
import { Home, Users, CheckCircle, AlertTriangle, MessageSquare, ShieldCheck, MapPin } from 'lucide-react';

interface RoomInfo {
  allocation_id: string;
  allocated_at: string;
  room_number: string;
  hostel_name: string;
  hostel_type: string;
  capacity: number;
  occupied: number;
  status: string;
}

interface Complaint {
  id: string;
  complaint_type: string;
  description: string;
  status: string;
  created_at: string;
}

export default function HostelDashboard() {
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  const fetchHostelData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>('/hostel/my-room');
      if (res && res.room) {
        setRoom(res.room);
        setComplaints(res.complaints || []);
      } else {
        setRoom(null);
      }
    } catch (err) {
      console.error('Failed to load hostel details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Home className="w-6 h-6 text-indigo-400" />
            Hostel & Campus Residency
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            View your current room allocation, resident policies, and submit facilities maintenance tickets.
          </p>
        </div>
        {room && (
          <button
            onClick={() => setShowComplaintModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-xl text-sm hover:opacity-90 transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Report Issue / Complaint
          </button>
        )}
      </div>

      {!room ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
          <Home className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h3 className="text-lg font-semibold text-white mb-1">No Active Room Allocation</h3>
          <p className="text-sm">You are not currently allocated a hostel room for this academic term.</p>
          <p className="text-xs text-slate-500 mt-2">Please contact the Estate & Hostel Management Office for allotment queries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Details Card */}
          <div className="lg:col-span-1 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {room.status.toUpperCase()}
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-3">Room {room.room_number}</h2>
                <p className="text-indigo-400 font-medium text-sm flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {room.hostel_name} ({room.hostel_type})
                </p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
              <div className="p-3 bg-slate-800/40 rounded-xl">
                <p className="text-xs text-slate-400">Total Capacity</p>
                <p className="text-lg font-bold text-white mt-0.5">{room.capacity} Beds</p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl">
                <p className="text-xs text-slate-400">Occupancy</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">{room.occupied} / {room.capacity}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>Allocated Since:</span>
                <span className="text-slate-200">{new Date(room.allocated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>Curfew Time:</span>
                <span className="text-amber-400 font-medium">10:00 PM IST</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Wi-Fi SSID:</span>
                <span className="text-slate-200 font-mono">RKV-CAMPUS-WLAN</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Residency Protocol
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Biometric attendance check occurs daily between 9:00 PM and 10:00 PM at your hostel wing lobby.
              </p>
            </div>
          </div>

          {/* Maintenance & Complaint History */}
          <div className="lg:col-span-2 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
              <span>Maintenance & Facilities Tickets</span>
              <span className="text-xs text-slate-400 font-normal">{complaints.length} registered</span>
            </h3>

            {complaints.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm text-slate-300">No reported maintenance issues</p>
                <p className="text-xs text-slate-500 mt-1">If your room requires electrical, plumbing, or internet repair, raise a ticket.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase">
                            {c.complaint_type}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-200 mt-2">{c.description}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        c.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : c.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {c.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for raising complaint */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowComplaintModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Raise Facilities Ticket</h3>
            <ComplaintForm
              onSuccess={() => {
                setShowComplaintModal(false);
                fetchHostelData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
