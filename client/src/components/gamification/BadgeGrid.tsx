'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Award, CheckCircle, Lock } from 'lucide-react';

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_earned: boolean;
  earned_at?: string | null;
}

interface BadgeGridProps {
  badges: BadgeItem[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <Card className="border">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" /> CO & Exam Achievement Badges
          </CardTitle>
          <span className="text-xs font-semibold text-muted-foreground">
            {badges.filter(b => b.is_earned).length} / {badges.length} Unlocked
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                b.is_earned
                  ? 'bg-primary/5 border-primary/30 shadow-sm'
                  : 'bg-muted/10 border-border/40 opacity-50 grayscale'
              }`}
            >
              <div className="text-3xl mb-1 relative">
                <span>{b.icon}</span>
                {b.is_earned ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 absolute -bottom-1 -right-1 bg-background rounded-full" />
                ) : (
                  <Lock className="w-3 h-3 text-muted-foreground absolute -bottom-1 -right-1 bg-background rounded-full" />
                )}
              </div>
              <h4 className="text-xs font-bold text-foreground mt-1">{b.name}</h4>
              <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{b.description}</p>
              {b.is_earned && b.earned_at && (
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  Earned
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
