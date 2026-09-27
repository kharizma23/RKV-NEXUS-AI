'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen, Users, Calendar, CheckSquare, Send, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RootCauseCard } from './RootCauseCard';
import { AffectedStudentsList, AffectedStudent } from './AffectedStudentsList';
import { apiClient } from '@/lib/api/client';

interface MisconceptionDetailModalProps {
  misconceptionId: string;
  onClose: () => void;
  onOpenIntervention: (misconceptionId: string, concept: string) => void;
  onOpenMicroLesson: (misconceptionId: string, concept: string) => void;
  onOpenRemedial: (misconceptionId: string, concept: string, students: AffectedStudent[]) => void;
  onOpenNotify: (misconceptionId: string, concept: string) => void;
  onOpenResolve: (misconceptionId: string, concept: string) => void;
}

export function MisconceptionDetailModal({
  misconceptionId,
  onClose,
  onOpenIntervention,
  onOpenMicroLesson,
  onOpenRemedial,
  onOpenNotify,
  onOpenResolve,
}: MisconceptionDetailModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [students, setStudents] = useState<AffectedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'students'>('diagnosis');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient<any>(`/faculty/doubts/${misconceptionId}/details`),
      apiClient<AffectedStudent[]>(`/faculty/doubts/${misconceptionId}/students`)
    ])
      .then(([detailData, studentData]) => {
        setDetails(detailData);
        setStudents(studentData || []);
      })
      .catch((err) => {
        console.error('Failed to load misconception details', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [misconceptionId]);

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-card border rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-5 border-b bg-muted/30 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {details?.subject_code || 'CS301'} • {details?.subject_name || 'DBMS'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                details?.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {details?.severity || 'HIGH'} SEVERITY
              </span>
            </div>
            <h2 className="text-lg font-black text-foreground">
              {details?.concept || 'Conceptual Bottleneck Drill-Down'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Detected across <strong className="text-foreground">{details?.frequency || 24} student assessments</strong> • Semester 6 CSE
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b bg-muted/10 flex gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('diagnosis')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'diagnosis'
                ? 'border-indigo-500 text-indigo-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Diagnostic & Root Cause</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'border-indigo-500 text-indigo-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Affected Students ({students.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs font-semibold">Running AI Root Cause Diagnostic...</span>
            </div>
          ) : activeTab === 'diagnosis' ? (
            <RootCauseCard
              concept={details?.concept}
              rootCause={details?.root_cause}
              suggestedAction={details?.suggested_action}
              suggestedMicroLesson={details?.suggested_micro_lesson}
              revisionMaterials={details?.suggested_revision_material}
              sampleWrongAnswers={details?.sample_wrong_answers}
            />
          ) : (
            <AffectedStudentsList students={students} />
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onOpenIntervention(misconceptionId, details?.concept)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Intervention Plan
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenMicroLesson(misconceptionId, details?.concept)}
              className="font-bold h-8 text-xs border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" /> Micro-Lesson
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenRemedial(misconceptionId, details?.concept, students)}
              className="font-bold h-8 text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
            >
              <Calendar className="w-3.5 h-3.5 mr-1" /> Schedule Remedial
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenNotify(misconceptionId, details?.concept)}
              className="font-bold h-8 text-xs border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Notify Students
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => onOpenResolve(misconceptionId, details?.concept)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs"
          >
            <CheckSquare className="w-3.5 h-3.5 mr-1" /> Mark Resolved
          </Button>
        </div>
      </div>
    </div>
  );
}
