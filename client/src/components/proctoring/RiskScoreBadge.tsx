'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RiskScoreBadgeProps {
  score: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskScoreBadge({ score, showIcon = true, size = 'md' }: RiskScoreBadgeProps) {
  let badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  let label = 'Low Risk';
  let Icon = ShieldCheck;

  if (score >= 70) {
    badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    label = 'Critical Risk';
    Icon = ShieldAlert;
  } else if (score >= 40) {
    badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    label = 'Moderate Risk';
    Icon = AlertTriangle;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${badgeColor} ${sizeClasses}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{score.toFixed(1)}%</span>
      <span className="opacity-70 font-normal">({label})</span>
    </span>
  );
}
