'use client';

import React from 'react';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number;
  reviewNeeded?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceBadge({ score, reviewNeeded = false, size = 'md' }: ConfidenceBadgeProps) {
  let badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  let label = 'High Confidence';

  if (score < 75 || reviewNeeded) {
    badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    label = 'Human Review Needed';
  } else if (score >= 90) {
    badgeColor = 'bg-primary/10 text-primary border-primary/20';
    label = 'Certain AI Consensus';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${badgeColor} ${sizeClasses}`}>
      <Sparkles className="w-3.5 h-3.5" />
      <span>{score.toFixed(1)}% AI Confidence</span>
      <span className="opacity-75 font-normal">({label})</span>
    </span>
  );
}
