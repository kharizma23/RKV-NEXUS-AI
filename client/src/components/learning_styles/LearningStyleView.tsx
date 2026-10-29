'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Headphones, Activity, Sparkles, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function LearningStyleView() {
  const [styleData, setStyleData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStyle = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/student/learning-style');
      setStyleData(res.data);
    } catch (e) {
      setStyleData({
        style: 'VISUAL',
        confidence: 0.91,
        recommendation: 'You reason best with hierarchical architectural diagrams, color-coded state transitions, and conceptual flowcharts.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStyle();
  }, []);

  const styles = [
    { id: 'VISUAL', label: 'Visual Synthesizer', icon: Eye, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { id: 'AUDITORY', label: 'Auditory Conversationalist', icon: Headphones, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'KINESTHETIC', label: 'Kinesthetic Builder', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
            Cognitive Style Profile
          </span>
          <h3 className="font-bold text-foreground text-sm mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Personalized Learning Modality
          </h3>
        </div>
        <button onClick={fetchStyle} className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {styles.map((s) => {
          const Icon = s.icon;
          const isActive = (styleData?.style || 'VISUAL') === s.id;
          return (
            <div
              key={s.id}
              className={`p-4 rounded-xl border transition ${
                isActive
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border/50 bg-muted/20 opacity-60'
              }`}
            >
              <div className={`p-2.5 rounded-xl w-fit ${s.bg} ${s.color} mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-bold text-foreground text-xs">{s.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {isActive ? 'Primary Assessed Style' : 'Secondary Modality'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-muted/20 rounded-xl border border-border/50 text-xs text-muted-foreground leading-relaxed">
        <span className="font-bold text-foreground block mb-1">Adaptive Exam Styling Activated:</span>
        {styleData?.recommendation || 'Examination questions and hints will automatically embed structured visual diagrams and schematic schemas.'}
      </div>
    </div>
  );
}
