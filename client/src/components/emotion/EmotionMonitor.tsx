'use client';

import React, { useState, useEffect } from 'react';
import { Smile, Frown, Flame, HelpCircle, Meh, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { EmotionBreakModal } from './EmotionBreakModal';

interface EmotionMonitorProps {
  examId: string;
}

export function EmotionMonitor({ examId }: EmotionMonitorProps) {
  const [currentEmotion, setCurrentEmotion] = useState<'happy' | 'sad' | 'stressed' | 'confused' | 'bored'>('happy');
  const [confidence, setConfidence] = useState(0.88);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIntervention, setActiveIntervention] = useState<'2_MIN_BREAK' | 'SHOW_HINT' | 'SUGGEST_HARDER_QUESTION'>('2_MIN_BREAK');
  const [hintShown, setHintShown] = useState(false);

  const logEmotion = async (emotion: 'happy' | 'sad' | 'stressed' | 'confused' | 'bored', conf: number) => {
    setCurrentEmotion(emotion);
    setConfidence(conf);
    try {
      const res = await apiClient<any>('/emotion/log', {
        method: 'POST',
        body: JSON.stringify({
          exam_id: examId,
          emotion: emotion,
          confidence: conf
        })
      });

      if (res?.data?.intervention) {
        setActiveIntervention(res.data.intervention);
        setModalOpen(true);
      }
    } catch (e) {
      console.error('Emotion sync error', e);
    }
  };

  const emotionIcons = {
    happy: { icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Calm & Confident' },
    sad: { icon: Frown, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', label: 'Fatigued' },
    stressed: { icon: Flame, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Stressed / Anxious' },
    confused: { icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Confused' },
    bored: { icon: Meh, color: 'text-neutral-400', bg: 'bg-neutral-500/10', border: 'border-neutral-500/20', label: 'Bored / Understimulated' }
  };

  const CurrIcon = emotionIcons[currentEmotion].icon;

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${emotionIcons[currentEmotion].bg} ${emotionIcons[currentEmotion].color}`}>
            <CurrIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Adaptive Emotion Sentinel</h4>
            <p className="text-[11px] text-muted-foreground">
              Current state: <span className="font-semibold text-foreground">{emotionIcons[currentEmotion].label}</span> ({(confidence * 100).toFixed(0)}% AI confidence)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
          Continuous Facial Sentiment
        </span>
      </div>

      {/* Simulator controls for candidate feedback demo */}
      <div className="pt-2 border-t border-border/40">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
          Simulate Sentiment State:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => logEmotion('happy', 0.92)}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition"
          >
            Calm (92%)
          </button>
          <button
            onClick={() => logEmotion('stressed', 0.89)}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition"
          >
            Stress &gt; 80% (Break)
          </button>
          <button
            onClick={() => logEmotion('confused', 0.78)}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition"
          >
            Confused &gt; 70% (Hint)
          </button>
          <button
            onClick={() => logEmotion('bored', 0.65)}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 transition"
          >
            Bored &gt; 60% (Harder)
          </button>
        </div>
      </div>

      {hintShown && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <div>
            <span className="font-bold block">Optional Hint Unlocked:</span>
            Consider breaking down the recurrence relation using the Master Theorem Case 2 where f(n) = Θ(n^(log_b a)).
          </div>
        </div>
      )}

      <EmotionBreakModal
        isOpen={modalOpen}
        interventionType={activeIntervention}
        examId={examId}
        onClose={() => setModalOpen(false)}
        onAccepted={() => {
          if (activeIntervention === 'SHOW_HINT') setHintShown(true);
        }}
      />
    </div>
  );
}
