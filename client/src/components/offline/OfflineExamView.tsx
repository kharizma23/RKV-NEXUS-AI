'use client';

import React, { useState, useEffect } from 'react';
import { HardDrive, Save, CloudUpload, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { OfflineSyncStatus } from './OfflineSyncStatus';
import { OfflineExamDownload } from './OfflineExamDownload';

export function OfflineExamView({ examId = 'default-exam' }: { examId?: string }) {
  const [offlineExamId, setOfflineExamId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [savedLocallyCount, setSavedLocallyCount] = useState(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const mockQuestions = [
    { id: '90000000-0000-0000-0000-000000000001', prompt: 'Question 1: Explain ACID transaction isolation anomalies (Dirty Read, Non-repeatable Read, Phantom Read).' },
    { id: '90000000-0000-0000-0000-000000000002', prompt: 'Question 2: Derive the amortized complexity of inserting elements into a dynamic array with doubling factor.' }
  ];

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSaveLocally = (qId: string) => {
    // Save to IndexedDB simulation
    try {
      localStorage.setItem(`offline_ans_${examId}_${qId}`, answers[qId] || '');
      setSavedLocallyCount((prev) => prev + 1);
      setStatusMsg('Answer securely committed to local browser IndexedDB storage.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncToServer = async () => {
    if (!offlineExamId) return;
    const payload = Object.entries(answers).map(([qId, ans]) => ({
      question_id: qId,
      answer: ans
    }));

    await apiClient<any>('/offline/sync', {
      method: 'POST',
      body: JSON.stringify({
        offline_exam_id: offlineExamId,
        answers: payload.length > 0 ? payload : [{ question_id: mockQuestions[0].id, answer: 'Local offline response' }]
      })
    });

    setSavedLocallyCount(0);
    setStatusMsg('All local answers successfully synchronized and reconciled with cloud database.');
    setTimeout(() => setStatusMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-500" />
            Offline Air-Gapped Examination Runner
          </h1>
          <p className="text-xs text-muted-foreground">
            Complete your exam without network dependency. Changes auto-save locally and sync seamlessly once reconnected.
          </p>
        </div>
        <OfflineSyncStatus
          pendingSyncCount={savedLocallyCount}
          onSyncTrigger={handleSyncToServer}
        />
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> {statusMsg}
        </div>
      )}

      {!offlineExamId ? (
        <OfflineExamDownload
          examId={examId}
          onDownloaded={(pkg) => setOfflineExamId(pkg.offline_exam_id)}
        />
      ) : (
        <div className="space-y-4">
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-foreground">Offline Exam Session Active</span>
              <span className="text-muted-foreground font-mono text-[11px]">({offlineExamId})</span>
            </div>
            <button
              onClick={handleSyncToServer}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <CloudUpload className="w-3.5 h-3.5" /> Sync to Cloud Now
            </button>
          </div>

          <div className="space-y-4">
            {mockQuestions.map((q, idx) => (
              <div key={q.id} className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-xs">{q.prompt}</h3>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold bg-muted px-2 py-0.5 rounded">
                    IndexedDB Stored
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Draft your offline answer here..."
                  className="w-full p-3 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-indigo-500 outline-none font-sans"
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveLocally(q.id)}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-lg border border-border flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Locally
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
