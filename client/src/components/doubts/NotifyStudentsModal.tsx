'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle2, Bell, BookOpen, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';

interface NotifyStudentsModalProps {
  misconceptionId: string;
  concept: string;
  onClose: () => void;
}

export function NotifyStudentsModal({
  misconceptionId,
  concept,
  onClose,
}: NotifyStudentsModalProps) {
  const [message, setMessage] = useState(
    `Hello! Based on our recent assessment diagnostic, a review session and interactive micro-lesson for '${concept}' has been assigned to your portal. Please review to master this core invariant before upcoming exams.`
  );
  const [includeMicroLesson, setIncludeMicroLesson] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await apiClient<any>(`/faculty/doubts/${misconceptionId}/notify-students`, {
        method: 'POST',
        body: JSON.stringify({
          message: message,
          include_micro_lesson: includeMicroLesson,
          send_email: sendEmail,
        }),
      });
      setResult(data);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      alert(err?.message || 'Failed to dispatch student notifications.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-card border rounded-2xl max-w-lg w-full shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">Notify Affected Students</h2>
              <p className="text-xs text-muted-foreground">
                Targeting: <strong className="text-foreground">{concept}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {result ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
              <p className="font-bold text-foreground">Notifications Dispatched!</p>
              <p className="text-[11px] text-muted-foreground">{result.message}</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Personalized Remedial Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-background border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-xs"
                />
              </div>

              {/* Delivery Channels */}
              <div className="space-y-2 pt-2 border-t">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Attached Resources & Channels
                </span>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-card cursor-pointer hover:bg-muted/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeMicroLesson}
                    onChange={(e) => setIncludeMicroLesson(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <div>
                      <p className="font-bold text-foreground">Embed 5-Minute Micro-Lesson Link</p>
                      <p className="text-[10px] text-muted-foreground">Students can immediately launch self-paced practice</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-card cursor-pointer hover:bg-muted/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="font-bold text-foreground">Send In-App & Email Push Broadcast</p>
                      <p className="text-[10px] text-muted-foreground">Direct notification to student inbox and student portal</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="text-xs font-semibold h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8"
                >
                  {submitting ? 'Dispatching...' : 'Dispatch Notifications'}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
