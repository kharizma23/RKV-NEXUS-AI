'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Sparkles, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MicroLessonPreview } from './MicroLessonPreview';
import { apiClient } from '@/lib/api/client';

interface MicroLessonGeneratorProps {
  misconceptionId: string;
  concept?: string;
  onClose: () => void;
  onShareToStudents?: (misconceptionId: string) => void;
}

export function MicroLessonGenerator({
  misconceptionId,
  concept = 'Targeted Concept',
  onClose,
  onShareToStudents,
}: MicroLessonGeneratorProps) {
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<any>(null);

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any>(
        `/faculty/doubts/${misconceptionId}/generate-micro-lesson`,
        { method: 'POST' }
      );
      setLesson(data);
    } catch (err) {
      console.error('Failed to generate micro lesson', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [misconceptionId]);

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-card border rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                AI 5-Minute Student Micro-Lesson Generator
              </h2>
              <p className="text-xs text-muted-foreground">
                Concept: <strong className="text-foreground">{concept}</strong>
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

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <RefreshCw className="w-7 h-7 animate-spin text-purple-500" />
              <div className="text-center">
                <p className="font-bold text-foreground">Synthesizing 5-Minute Micro-Lesson...</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Formulating targeted concept explanation, common pitfall contrasts, and quick formative quiz
                </p>
              </div>
            </div>
          ) : lesson ? (
            <MicroLessonPreview lesson={lesson} />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Failed to generate micro-lesson. Please try again.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchLesson}
            disabled={loading}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>

          <div className="flex items-center gap-2">
            {onShareToStudents && (
              <Button
                size="sm"
                onClick={() => {
                  onShareToStudents(misconceptionId);
                  onClose();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8"
              >
                <Send className="w-3.5 h-3.5 mr-1" /> Publish & Notify Students
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold h-8"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
