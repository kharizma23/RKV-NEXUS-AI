'use client';

import React from 'react';
import { ConfidenceBadge } from '@/components/confidence/ConfidenceBadge';
import { Sparkles, CheckCircle2, Shield } from 'lucide-react';

export default function StudentConfidencePage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Grading Confidence & Explainability
        </h1>
        <p className="text-xs text-muted-foreground">
          Inspect the AI certainty index and semantic breakdown for your recently graded examination answers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { question: 'Q1: Byzantine Fault Tolerance Quorum', marks: 19.5, confidence: 96.8, review: false },
          { question: 'Q2: Amortized Doubling Array Derivation', marks: 18.0, confidence: 92.4, review: false },
          { question: 'Q3: Non-deterministic Finite Automata Equivalence', marks: 16.5, confidence: 73.2, review: true }
        ].map((item, idx) => (
          <div key={idx} className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-bold text-foreground text-xs">{item.question}</span>
              <ConfidenceBadge score={item.confidence} reviewNeeded={item.review} size="sm" />
            </div>
            <div className="text-xs text-muted-foreground">
              Evaluated Score: <strong className="text-foreground">{item.marks} / 20.0 Pts</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
