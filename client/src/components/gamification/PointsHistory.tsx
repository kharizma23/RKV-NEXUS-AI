'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History, Star, Clock } from 'lucide-react';

interface HistoryItem {
  id: string;
  points: number;
  reason: string;
  created_at: string;
}

interface PointsHistoryProps {
  history: HistoryItem[];
}

export function PointsHistory({ history }: PointsHistoryProps) {
  return (
    <Card className="border">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <History className="w-4 h-4 text-primary" /> Points Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y max-h-60 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No recent points activity recorded.
            </div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 px-4 hover:bg-muted/20 text-xs">
                <div>
                  <div className="font-semibold text-foreground">{h.reason}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {new Date(h.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                  +{h.points}
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
