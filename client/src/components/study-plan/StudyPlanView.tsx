'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle2, Circle, ExternalLink, BookOpen, Video, Code, Award } from 'lucide-react';

export interface PlanItem {
  id: string;
  day_number: number;
  topic: string;
  resource_type: string;
  resource_url: string | null;
  estimated_minutes: number;
  status: string;
}

interface StudyPlanViewProps {
  items: PlanItem[];
  onCompleteItem: (itemId: string) => void;
}

export function StudyPlanView({ items, onCompleteItem }: StudyPlanViewProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'CODING':
        return <Code className="w-4 h-4 text-emerald-500" />;
      case 'READING':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'PRACTICE_QUIZ':
      default:
        return <Award className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {items.map((it) => {
        const isCompleted = it.status === 'COMPLETED';
        return (
          <Card
            key={it.id}
            className={`border transition-all ${
              isCompleted ? 'bg-muted/15 border-emerald-500/30' : 'hover:border-primary/40'
            }`}
          >
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 flex flex-col items-center justify-center w-12 text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Day</span>
                  <span className="text-base font-black leading-none">{it.day_number}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-foreground">{it.topic}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                      {getResourceIcon(it.resource_type)}
                      {it.resource_type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {it.estimated_minutes} mins estimated
                    </span>
                    {it.resource_url && (
                      <a
                        href={it.resource_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-0.5 font-semibold"
                      >
                        Module Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {isCompleted ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onCompleteItem(it.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    Mark as Finished
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
