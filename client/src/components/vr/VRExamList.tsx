'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Glasses, Play, Clock, Sparkles, CheckCircle2, ShieldCheck, Atom } from 'lucide-react';
import Link from 'next/link';

export function VRExamList() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/vr/exams');
      setExams(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">3D AR/VR Practical Exam Simulations</h1>
          <p className="text-xs text-muted-foreground">
            Immersive virtual laboratories, equipment calibration, and telemetry-evaluated practicals
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
          <Glasses className="w-4 h-4" />
          <span>WebXR & Desktop 3D Enabled</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
          Loading virtual lab environments...
        </div>
      ) : exams.length === 0 ? (
        <div className="p-12 text-center bg-card border rounded-2xl text-xs text-muted-foreground">
          No active VR examinations scheduled.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                    {exam.experiment_type?.replace(/_/g, ' ') || 'VIRTUAL LAB'}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exam.duration_minutes} mins</span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-foreground group-hover:text-indigo-600 transition-colors">
                  {exam.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {exam.description}
                </p>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>AI Step Telemetry</span>
                  </span>
                  <span className="font-mono text-indigo-500 font-semibold">WebXR 2.0</span>
                </div>

                <Link
                  href={`/student/vr-exams/${exam.id}`}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch 3D Simulation</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VRExamList;
