'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Building, CheckCircle2, UserPlus, Users } from 'lucide-react';

interface RoomAllocationProps {
  onAllocated?: () => void;
}

export function RoomAllocation({ onAllocated }: RoomAllocationProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      const res = await apiClient<any>('/hostel/rooms');
      const rList = res.data || [];
      setRooms(rList);
      if (rList.length > 0) setSelectedRoomId(rList[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    try {
      const res = await apiClient<any>('/hostel/allocate', {
        method: 'POST',
        body: JSON.stringify({
          room_id: selectedRoomId || undefined
        })
      });
      setSuccess('Room successfully allocated to student.');
      await fetchRooms();
      if (onAllocated) onAllocated();
    } catch (err: any) {
      alert(err?.message || 'Failed to allocate room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
          <Building className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">AI Hostel Room Allocation Engine</h3>
          <p className="text-xs text-muted-foreground">Automatic roommate compatibility balancing, floor quotas, and bed assignment</p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleAllocate} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-foreground">Available Room Selection:</label>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground font-semibold"
          >
            <option value="">Auto-Assign Best Available (AI Recommended)</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id} disabled={r.is_full}>
                {r.hostel_name} — Room {r.room_number} (Floor {r.floor}) [Beds: {r.available_beds}/{r.capacity} Available] {r.is_full ? '• FULL' : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          <span>{loading ? 'Assigning Bed...' : 'Confirm Room Allocation'}</span>
        </button>
      </form>
    </div>
  );
}

export default RoomAllocation;
