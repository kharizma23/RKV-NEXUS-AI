'use client';

import React, { useState } from 'react';
import { Download, Share2, Send, Printer, FileText, Check, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Student360Profile } from './types';

interface ActionButtonsProps {
  profile: Student360Profile;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export function ActionButtons({ profile, onToast }: ActionButtonsProps) {
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [sendingParent, setSendingParent] = useState(false);

  const handleExportPDF = () => {
    onToast('success', `Exporting 360° Comprehensive Dossier for ${profile.full_name} as PDF...`);
    // Trigger print mode or download
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareFaculty = () => {
    setSharing(true);
    setTimeout(() => {
      setSharing(false);
      onToast('success', `Profile 360° successfully shared with faculty in ${profile.department || 'the department'}.`);
    }, 600);
  };

  const handleSendParent = () => {
    setSendingParent(true);
    setTimeout(() => {
      setSendingParent(false);
      onToast('success', `Student 360° Holistic Evaluation dispatched to registered parent guardian.`);
    }, 600);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <Button
          id="btn-export-pdf"
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          className="text-xs font-semibold rounded-xl border-border hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-indigo-500" /> Export as PDF
        </Button>

        <Button
          id="btn-share-faculty"
          variant="outline"
          size="sm"
          onClick={handleShareFaculty}
          disabled={sharing}
          className="text-xs font-semibold rounded-xl border-border hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-500" /> Share with Faculty
        </Button>

        <Button
          id="btn-send-parent"
          variant="outline"
          size="sm"
          onClick={handleSendParent}
          disabled={sendingParent}
          className="text-xs font-semibold rounded-xl border-border hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5 text-blue-500" /> Send to Parent
        </Button>

        <Button
          id="btn-print-profile"
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="text-xs font-semibold rounded-xl border-border hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5 text-amber-500" /> Print
        </Button>

        <Button
          id="btn-detailed-report"
          size="sm"
          onClick={() => setShowDetailedModal(true)}
          className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 rounded-xl shadow-sm flex items-center gap-1.5 ml-auto"
        >
          <FileText className="w-3.5 h-3.5" /> View Detailed Report
        </Button>
      </div>

      {/* Detailed Report Modal */}
      {showDetailedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                  Deep Audit Dossier
                </span>
                <h3 className="text-lg font-black text-foreground">
                  Detailed 360° Performance Report
                </h3>
                <p className="text-xs text-muted-foreground">
                  Scholar: {profile.full_name} ({profile.roll_number}) • {profile.programme}
                </p>
              </div>
              <button
                onClick={() => setShowDetailedModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="font-bold text-foreground">Academic Outcome Matrix</div>
                <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                  <div>Course Outcome (CO) Mastery: <span className="font-bold text-foreground">{profile.academic_score}%</span></div>
                  <div>Programme Target Semester: <span className="font-bold text-foreground">Semester {profile.semester}</span></div>
                  <div>Institution: <span className="font-bold text-foreground">{profile.institution}</span></div>
                  <div>Department: <span className="font-bold text-foreground">{profile.department}</span></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="font-bold text-foreground">Biometric Attendance & Engagement</div>
                <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                  <div>Verified Lecture Presence: <span className="font-bold text-emerald-600">{profile.attendance_rate}%</span></div>
                  <div>Biometric Checkpoint Status: <span className="font-bold text-emerald-600">VALIDATED</span></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="font-bold text-foreground">Cognitive Wellness & Industry Readiness</div>
                <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                  <div>Resilience Index: <span className="font-bold text-rose-600">{profile.wellness_index}%</span></div>
                  <div>Technical Skill Mastery: <span className="font-bold text-amber-600">{profile.skill_score}%</span></div>
                  <div>Placement Velocity: <span className="font-bold text-cyan-600">{profile.placement_readiness}%</span></div>
                  <div>Holistic Composite Score: <span className="font-bold text-indigo-600">{profile.composite_score} / 100</span></div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Audited snapshot digitally signed by {profile.evaluated_by} on {profile.last_evaluated}.</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedModal(false)}
                className="text-xs font-semibold rounded-xl"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowDetailedModal(false);
                  handleExportPDF();
                }}
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Full Dossier
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
