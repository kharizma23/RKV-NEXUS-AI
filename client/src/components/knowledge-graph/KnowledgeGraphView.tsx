'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Brain, ArrowRight, CheckCircle2, AlertTriangle, BookOpen, Layers } from 'lucide-react';

interface GraphNode {
  id: string;
  topic: string;
  unit_number: number;
  co_number: string;
}

interface GapItem {
  topic: string;
  co_number: string;
  mastery_level: number;
  gap_severity: string;
  prerequisite: string;
}

interface RemedialStep {
  step: number;
  topic: string;
  action: string;
  target_co: string;
}

export function KnowledgeGraphView() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [remedialSteps, setRemedialSteps] = useState<RemedialStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const dummySubjectId = '00000000-0000-0000-0000-000000000001';
        const gRes = await fetch(`/api/v1/knowledge-graph/subject/${dummySubjectId}`);
        if (gRes.ok) {
          const gJson = await gRes.json();
          setNodes(gJson.data.nodes || []);
        }

        const gapsRes = await fetch('/api/v1/student/knowledge-graph/gaps');
        if (gapsRes.ok) {
          const gapsJson = await gapsRes.json();
          setGaps(gapsJson.data || []);
        }

        const remRes = await fetch('/api/v1/student/knowledge-graph/remedial-path');
        if (remRes.ok) {
          const remJson = await remRes.json();
          setRemedialSteps(remJson.data.remedial_sequence || []);
        }
      } catch (e) {
        console.error('Knowledge graph fetch error', e);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Curriculum Knowledge Graph & Prerequisite Chain
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Syllabus dependency graph tracking topic prerequisites and Course Outcome mappings.
          </p>
        </div>
      </div>

      {/* Visual Topic Flow Graph */}
      <Card className="border">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Topic Dependency Chain
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto py-2">
            {nodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                <div className="p-3.5 rounded-xl border bg-card hover:border-primary/50 transition-all flex flex-col items-center text-center min-w-44 shadow-xs">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary mb-1">
                    {node.co_number} &bull; Unit {node.unit_number}
                  </span>
                  <span className="text-xs font-bold text-foreground line-clamp-2">{node.topic}</span>
                </div>
                {idx < nodes.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Identified Gaps */}
        <Card className="border">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Diagnosed Knowledge Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-xs">
              {gaps.map((gap, i) => (
                <div key={i} className="p-3.5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">{gap.topic}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      {gap.mastery_level}% Mastery
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <span>Prerequisite Dependency:</span>
                    <span className="font-semibold text-foreground">{gap.prerequisite}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Remedial Sequence */}
        <Card className="border">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Suggested Remedial Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-xs">
              {remedialSteps.map((step) => (
                <div key={step.step} className="p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 font-black flex items-center justify-center shrink-0 text-xs">
                    {step.step}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-foreground">{step.topic}</div>
                    <div className="text-[11px] text-muted-foreground">{step.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
