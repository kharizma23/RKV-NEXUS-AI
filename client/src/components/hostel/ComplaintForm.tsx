'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Wrench, CheckCircle2, AlertCircle } from 'lucide-react';

interface ComplaintFormProps {
  onSuccess?: () => void;
}

export function ComplaintForm({ onSuccess }: ComplaintFormProps) {
  const [complaintType, setComplaintType] = useState('MAINTENANCE');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/hostel/complaint', {
        method: 'POST',
        body: JSON.stringify({
          complaint_type: complaintType,
          description: description.trim()
        })
      });
      setSuccess(res.data);
      setDescription('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to lodge complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Raise Hostel Maintenance Request</h3>
          <p className="text-xs text-muted-foreground">Automated SLA ticket dispatch to campus facility engineering</p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Complaint #{success.complaint_id?.slice(0, 8)} registered. SLA resolution window: &lt; 4 Hours.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-foreground">Issue Category:</label>
          <select
            value={complaintType}
            onChange={(e) => setComplaintType(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground font-semibold"
          >
            <option value="MAINTENANCE">General Carpentry & Furniture</option>
            <option value="ELECTRICAL">Electrical, AC & Lighting</option>
            <option value="PLUMBING">Plumbing & Water Supply</option>
            <option value="HYGIENE">Housekeeping & Hygiene</option>
            <option value="WIFI_NETWORK">Hostel Wi-Fi 6 & LAN Connectivity</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-foreground">Specific Issue Description:</label>
          <textarea
            rows={3}
            placeholder="Describe the issue in detail, including room area and urgency..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !description.trim()}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Wrench className="w-4 h-4" />
          )}
          <span>{loading ? 'Dispatching Ticket...' : 'Submit Maintenance Ticket'}</span>
        </button>
      </form>
    </div>
  );
}

export default ComplaintForm;
