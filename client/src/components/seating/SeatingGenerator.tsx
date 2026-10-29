'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Users, Sparkles, CheckCircle2, Building, RefreshCw } from 'lucide-react';

interface SeatingGeneratorProps {
  onGenerated?: (result: any) => void;
}

export function SeatingGenerator({ onGenerated }: SeatingGeneratorProps) {
  const [exams, setExams] = useState<any[]>([]);
  const [halls, setHalls] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedHallId, setSelectedHallId] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [eRes, hRes] = await Promise.all([
          apiClient<any>('/examinations/published'),
          apiClient<any>('/seating/halls')
        ]);
        const examList = Array.isArray(eRes) ? eRes : (eRes.data || []);
        setExams(examList);
        if (examList.length > 0) setSelectedExamId(examList[0].id);

        const hallList = hRes.data || [];
        setHalls(hallList);
        if (hallList.length > 0) setSelectedHallId(hallList[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) return;

    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await apiClient<any>('/seating/generate', {
        method: 'POST',
        body: JSON.stringify({
          exam_id: selectedExamId,
          hall_id: selectedHallId || undefined
        })
      });
      setSuccessMsg(`Arrangement generated! Total ${res.data.total_assigned} candidates allocated.`);
      if (onGenerated) onGenerated(res.data);
    } catch (err: any) {
      alert(err?.message || 'Failed to generate seating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">AI Smart Seating Matrix Generator</h2>
          <p className="text-xs text-muted-foreground">
            Interleave departments and enforce minimum Manhattan distance between flagged candidates
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-foreground">Select Examination:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground font-semibold"
            required
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-foreground">Examination Hall / Venue:</label>
          <select
            value={selectedHallId}
            onChange={(e) => setSelectedHallId(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground font-semibold"
          >
            {halls.map((h) => (
              <option key={h.id} value={h.id}>{h.name} (Cap: {h.capacity})</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading || !selectedExamId}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors shadow-sm"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? 'Optimizing Grid...' : 'Generate Seating Arrangement'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default SeatingGenerator;
