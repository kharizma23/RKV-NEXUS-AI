'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface TimeWindowSelectorProps {
  windowStart: string;
  windowEnd: string;
  durationMinutes: number;
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
  onDurationChange: (val: number) => void;
}

export function TimeWindowSelector({
  windowStart,
  windowEnd,
  durationMinutes,
  onStartChange,
  onEndChange,
  onDurationChange
}: TimeWindowSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" /> Window Opens
        </label>
        <input
          type="datetime-local"
          value={windowStart}
          onChange={(e) => onStartChange(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" /> Window Closes
        </label>
        <input
          type="datetime-local"
          value={windowEnd}
          onChange={(e) => onEndChange(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" /> Max Attempt Duration
        </label>
        <select
          value={durationMinutes}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
        >
          <option value={45}>45 Minutes</option>
          <option value={60}>60 Minutes (1 Hour)</option>
          <option value={90}>90 Minutes (1.5 Hours)</option>
          <option value={120}>120 Minutes (2 Hours)</option>
          <option value={180}>180 Minutes (3 Hours)</option>
        </select>
      </div>
    </div>
  );
}
