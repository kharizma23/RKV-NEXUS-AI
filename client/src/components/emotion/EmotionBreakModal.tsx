'use client';

import React, { useState, useEffect } from 'react';
import { Coffee, Lightbulb, Zap, X, Check, Timer } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface EmotionBreakModalProps {
  isOpen: boolean;
  interventionType: '2_MIN_BREAK' | 'SHOW_HINT' | 'SUGGEST_HARDER_QUESTION';
  examId: string;
  onClose: () => void;
  onAccepted?: () => void;
}

export function EmotionBreakModal({ isOpen, interventionType, examId, onClose, onAccepted }: EmotionBreakModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [breakActive, setBreakActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breakActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setBreakActive(false);
    }
    return () => clearInterval(interval);
  }, [breakActive, secondsRemaining]);

  if (!isOpen) return null;

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await apiClient<any>('/emotion/intervention', {
        method: 'POST',
        body: JSON.stringify({
          exam_id: examId,
          intervention_type: interventionType,
          accepted: true
        })
      });
      if (interventionType === '2_MIN_BREAK') {
        setBreakActive(true);
        setSecondsRemaining(120);
      } else {
        if (onAccepted) onAccepted();
        onClose();
      }
    } catch (e) {
      console.error(e);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    try {
      await apiClient<any>('/emotion/intervention', {
        method: 'POST',
        body: JSON.stringify({
          exam_id: examId,
          intervention_type: interventionType,
          accepted: false
        })
      });
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {breakActive ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <Coffee className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Relaxation Break in Progress</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Close your eyes and breathe deeply. Exam countdown is paused.
              </p>
            </div>
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
            </div>
            <button
              onClick={() => {
                setBreakActive(false);
                onClose();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              Resume Exam Early
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {interventionType === '2_MIN_BREAK' && (
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                    <Coffee className="w-6 h-6" />
                  </div>
                )}
                {interventionType === 'SHOW_HINT' && (
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                )}
                {interventionType === 'SUGGEST_HARDER_QUESTION' && (
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <Zap className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-foreground text-sm">
                    {interventionType === '2_MIN_BREAK' && 'High Stress Detected (>80%)'}
                    {interventionType === 'SHOW_HINT' && 'Cognitive Confusion Detected (>70%)'}
                    {interventionType === 'SUGGEST_HARDER_QUESTION' && 'High Ease & Boredom (>60%)'}
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Adaptive Well-Being Assistant</span>
                </div>
              </div>
              <button onClick={handleDecline} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {interventionType === '2_MIN_BREAK' &&
                'Our computer vision sentiment analyzer noticed signs of elevated anxiety. Would you like to pause the clock for a 2-minute mindful breathing break?'}
              {interventionType === 'SHOW_HINT' &&
                'It looks like this question might be causing cognitive roadblock. Would you like an optional directional hint to guide your reasoning?'}
              {interventionType === 'SUGGEST_HARDER_QUESTION' &&
                'You seem comfortably ahead and confident! Would you like to unlock an advanced challenge question for extra bonus credit?'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
              <button
                onClick={handleDecline}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-muted-foreground transition"
              >
                No Thanks, Continue
              </button>
              <button
                onClick={handleAccept}
                disabled={submitting}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {interventionType === '2_MIN_BREAK' && 'Take 2-Min Break'}
                {interventionType === 'SHOW_HINT' && 'Reveal Hint'}
                {interventionType === 'SUGGEST_HARDER_QUESTION' && 'Accept Challenge'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
