'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Info, X,
  GraduationCap, Building2, User, Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { apiClient, ApiError } from '@/lib/api/client';
import { Student360Profile, ToastMessage } from './types';
import { UUIDSearchBar } from './UUIDSearchBar';
import { ProfileCards } from './ProfileCards';
import { CompetencyRadar } from './CompetencyRadar';
import { AIHospiceSummary } from './AIHospiceSummary';
import { RecalculateButton } from './RecalculateButton';
import { ActionButtons } from './ActionButtons';

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function Student360Page() {
  const [profile, setProfile] = useState<Student360Profile | null>(null);
  const [currentUUID, setCurrentUUID] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Inspect Profile Handler
  const handleInspect = async (searchVal: string) => {
    const trimmed = (searchVal || '').trim();

    // Step 2: If empty → load the currently selected/active student's profile
    if (!trimmed) {
      addToast('info', 'No UUID provided — showing active scholar profile');
      await fetchProfile('');
      return;
    }

    // Step 3: If UUID entered → validate UUID format
    if (!UUID_REGEX.test(trimmed)) {
      addToast('error', 'Invalid Student UUID format');
      // Do not make API call
      return;
    }

    // Step 4: Valid UUID -> send API request
    await fetchProfile(trimmed);
  };

  const fetchProfile = async (targetId: string) => {
    setSearchLoading(true);
    try {
      const endpoint = targetId
        ? `/admin/students/${encodeURIComponent(targetId)}/profile-360`
        : '/admin/students/profile-360';

      const data = await apiClient.get<Student360Profile>(endpoint);
      if (data && typeof data === 'object') {
        setProfile(data);
        setCurrentUUID(data.student_id);
      } else {
        throw new Error('Malformed profile data received');
      }
    } catch (err: any) {
      // Step 7: On error → show toast with error message
      setProfile(null);
      if (err instanceof ApiError && err.status === 404) {
        addToast('error', `Student not found with ID: ${targetId}`);
      } else if (err instanceof ApiError && err.status === 400) {
        addToast('error', err.message || 'Invalid Student UUID format');
      } else {
        addToast('error', err?.message || 'Failed to inspect student profile');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // Recalculate 360° Profile Handler
  const handleRecalculate = async () => {
    const targetId = currentUUID || profile?.student_id || '';
    setRecalcLoading(true);
    try {
      const endpoint = targetId
        ? `/admin/students/${encodeURIComponent(targetId)}/profile-360/recalculate`
        : '/admin/students/profile-360/recalculate';

      const updated = await apiClient.post<Student360Profile>(endpoint);
      if (updated && typeof updated === 'object') {
        setProfile(updated);
        addToast('success', 'Profile recalculated successfully');
      }
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to recalculate 360° profile');
    } finally {
      setRecalcLoading(false);
    }
  };

  // Initial load of active scholar
  useEffect(() => {
    fetchProfile('');
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur-md transition-all animate-in slide-in-from-top-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/95 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : toast.type === 'error'
                ? 'bg-rose-50/95 dark:bg-rose-950/95 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                : 'bg-indigo-50/95 dark:bg-indigo-950/95 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />}
            <span className="flex-1 leading-relaxed">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-indigo-400" /> Multi-Dimensional Analytics
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">Student 360° Comprehensive Profile Inspector</h1>
          <p className="text-slate-300 text-xs mt-1">
            Audit candidate academic attainment, lecture attendance, wellness resilience, verified competencies, and career velocity.
          </p>
        </div>

        {profile && (
          <RecalculateButton
            onRecalculate={handleRecalculate}
            loading={recalcLoading}
          />
        )}
      </div>

      {/* Search Input Card */}
      <Card className="p-5 border-border shadow-sm">
        <UUIDSearchBar
          onInspect={handleInspect}
          loading={searchLoading}
          value={currentUUID}
          onChange={(val) => setCurrentUUID(val)}
        />
      </Card>

      {/* Profile Presentation */}
      {profile ? (
        <div className="space-y-6">
          {/* Scholar Meta Identity Bar */}
          <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                {profile.full_name?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-foreground">
                    {profile.full_name || profile.student_name}
                  </h2>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px] font-mono font-bold rounded-md">
                    {profile.roll_number}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5 font-medium">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> {profile.institution}
                  </span>
                  <span>•</span>
                  <span>{profile.department}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" /> {profile.programme} (Sem {profile.semester})
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-muted-foreground font-semibold">Composite Score</div>
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                {profile.composite_score} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Export PDF, Share Faculty, Send Parent, Print, Detailed Report */}
          <ActionButtons profile={profile} onToast={addToast} />

          {/* 5 Score Cards: Academic, Attendance, Wellness, Skill, Placement */}
          <ProfileCards profile={profile} />

          {/* Grid: Pentagonal Competency Radar Chart & AI Holistic Synthesis Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Pentagonal Competency Radar Card */}
            <Card className="p-6 flex flex-col items-center justify-between border-border">
              <div className="w-full flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Pentagonal Competency Radar
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    5 Dimensions Audited: Academics, Attendance, Wellness, Skill, Placement
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase rounded-lg border border-indigo-200 dark:border-indigo-800">
                  5 AUDITED
                </span>
              </div>
              <div className="w-full flex justify-center py-2 flex-1 items-center">
                <CompetencyRadar
                  dimensions={profile.radar_dimensions}
                  academicScore={profile.academic_score}
                  attendanceRate={profile.attendance_rate}
                  wellnessIndex={profile.wellness_index ?? profile.wellness_score}
                  skillScore={profile.skill_score}
                  placementReadiness={profile.placement_readiness}
                />
              </div>
            </Card>

            {/* AI Holistic Synthesis Summary Panel */}
            <AIHospiceSummary profile={profile} />
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-2 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Profile Loaded</h3>
          <p className="text-xs text-muted-foreground max-w-md">
            Enter a valid Student UUID or leave empty to inspect the active scholar profile.
          </p>
        </Card>
      )}
    </div>
  );
}
