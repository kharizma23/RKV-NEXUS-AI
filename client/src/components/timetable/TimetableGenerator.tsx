'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Calendar, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

interface TimetableGeneratorProps {
  onGenerated?: (timetableId?: string) => void;
}

export function TimetableGenerator({ onGenerated }: TimetableGeneratorProps) {
  const [semester, setSemester] = useState(1);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    try {
      const res = await apiClient<any>('/timetable/generate', {
        method: 'POST',
        body: JSON.stringify({
          semester,
          academic_year: academicYear
        })
      });
      setSuccess(res.data);
      if (onGenerated) onGenerated(res.data?.id || res.data?.timetable_id);
    } catch (err: any) {
      alert(err?.message || 'Failed to generate timetable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">AI Conflict-Free Timetable Generator</h2>
          <p className="text-xs text-muted-foreground">
            Genetic algorithm optimization balancing faculty workload, room capacity, and pedagogical rest intervals
          </p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Optimal schedule generated with {success.optimization_score}% constraint satisfaction!</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-foreground">Target Semester:</label>
          <select
            value={semester}
            onChange={(e) => setSemester(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground font-semibold"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-foreground">Academic Year:</label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground font-semibold"
            required
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors shadow-sm"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? 'Solving Constraints...' : 'Generate AI Timetable'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default TimetableGenerator;
