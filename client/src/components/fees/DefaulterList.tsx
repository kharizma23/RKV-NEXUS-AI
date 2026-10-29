'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { AlertTriangle, Send, Mail, CheckCircle2, ShieldAlert } from 'lucide-react';

export function DefaulterList() {
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  const loadDefaulters = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/admin/fees/defaulters');
      setDefaulters(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDefaulters();
  }, []);

  const handleSendReminder = async (studentId: string) => {
    setSendingId(studentId);
    try {
      // Find fee structure ID or generate mock
      const feesRes = await apiClient<any>('/fees/student');
      const structId = feesRes.data?.fee_items?.[0]?.fee_structure_id || '00000000-0000-0000-0000-000000000001';

      await apiClient('/admin/fees/reminder', {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentId,
          fee_structure_id: structId,
          reminder_type: 'EMAIL'
        })
      });
      setSentMap((prev) => ({ ...prev, [studentId]: true }));
    } catch (err) {
      console.error(err);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">AI Predicted Fee Defaulters Radar</h3>
          <p className="text-xs text-muted-foreground">Logistic ML probability model scoring payment delay risk</p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
          {defaulters.length} Candidates Evaluated
        </span>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground p-8 text-center animate-pulse">Running ML prediction model...</div>
      ) : defaulters.length === 0 ? (
        <div className="text-xs text-muted-foreground p-8 text-center">No fee default risks detected.</div>
      ) : (
        <div className="divide-y text-xs">
          {defaulters.map((d) => (
            <div key={d.student_id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-foreground">{d.student_name}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">({d.roll_number})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    d.risk_tier === 'CRITICAL' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {d.risk_tier} RISK ({(d.predicted_default_risk * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-muted-foreground">
                  <span>Attendance: {d.attendance_rate?.toFixed(0)}%</span>
                  <span>•</span>
                  <span>Overdue Days: {d.overdue_days}</span>
                  <span>•</span>
                  <span className="italic text-foreground">{d.suggested_action}</span>
                </div>
              </div>

              <div>
                {sentMap[d.student_id] ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dispatched</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleSendReminder(d.student_id)}
                    disabled={sendingId === d.student_id}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>{sendingId === d.student_id ? 'Sending...' : 'Send AI Reminder'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DefaulterList;
