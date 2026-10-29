'use client';

import React from 'react';
import { BookOpen, Sparkles, Lightbulb, ExternalLink } from 'lucide-react';

interface BestPracticesListProps {
  practices: any[];
}

export function BestPracticesList({ practices }: BestPracticesListProps) {
  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">World-Class Pedagogical & Assessment Best Practices</h3>
          <p className="text-xs text-muted-foreground">Curated continuous improvement models from Stanford, MIT, and NUS</p>
        </div>
        <Lightbulb className="w-5 h-5 text-amber-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {practices.map((p) => (
          <div key={p.id} className="p-4 bg-muted/40 rounded-xl space-y-2.5 border flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                  {p.category}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold flex items-center space-x-1">
                  <span>{p.source}</span>
                </span>
              </div>
              <h4 className="font-bold text-xs text-foreground">{p.practice}</h4>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </div>
            <div className="pt-2 border-t flex items-center justify-between text-[11px] text-indigo-600 font-semibold">
              <span>Ready for Curriculum Adoption</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
