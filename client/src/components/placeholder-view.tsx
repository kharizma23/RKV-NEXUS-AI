'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface PlaceholderViewProps {
  moduleName: string;
  plannedPhase: string;
  description: string;
}

export function PlaceholderView({ moduleName, plannedPhase, description }: PlaceholderViewProps) {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card className="border-dashed border-2">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-2">
            <Construction className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">{moduleName}</CardTitle>
          <CardDescription className="text-sm font-medium text-amber-600 dark:text-amber-400">
            Module planned for a later development phase ({plannedPhase})
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground space-y-4">
          <p className="max-w-lg mx-auto leading-relaxed">{description}</p>
          <div className="p-4 bg-muted/50 rounded-md text-xs font-mono text-muted-foreground inline-block">
            Architecture Ready &bull; Modular Monolith Scaffolding Intact
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
