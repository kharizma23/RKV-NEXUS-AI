'use client';

import React from 'react';
import { FileText, Sparkles, CheckCircle2, Globe } from 'lucide-react';

interface VoiceTranscriptionProps {
  transcription: string;
  languageCode?: string;
  confidenceScore?: number;
  isTranscribing?: boolean;
}

export function VoiceTranscription({
  transcription,
  languageCode = 'en',
  confidenceScore = 96.4,
  isTranscribing = false
}: VoiceTranscriptionProps) {
  if (isTranscribing) {
    return (
      <div className="p-4 bg-muted/40 border border-border/50 rounded-xl text-center space-y-2 animate-pulse">
        <Sparkles className="w-5 h-5 text-primary mx-auto animate-spin" />
        <span className="text-xs text-muted-foreground font-medium block">
          Whisper Speech-to-Text Neural Engine transcribing audio stream...
        </span>
      </div>
    );
  }

  if (!transcription) return null;

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Whisper Transcribed Response</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Globe className="w-3 h-3" /> {languageCode.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
            {confidenceScore.toFixed(1)}% Confidence
          </span>
        </div>
      </div>

      <div className="p-3 bg-muted/20 rounded-xl text-xs text-foreground leading-relaxed font-sans">
        "{transcription}"
      </div>
    </div>
  );
}
