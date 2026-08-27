'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MultimodalInspection {
  answer_id: string;
  ocr_scripts: Array<{ id: string; extracted_text: string; confidence_score: number; page_number: number }>;
  viva_transcripts: Array<{ id: string; transcript_text: string; speech_confidence: number; duration_seconds: number }>;
  diagram_evaluations: Array<{ id: string; structural_score: number; detected_components: string[]; missing_components: string[] }>;
}

export default function FacultyMultimodalInspectionPage() {
  const params = useParams();
  const evaluationId = params.id as string;

  const { data: inspection, isLoading } = useQuery<MultimodalInspection>({
    queryKey: ['multimodal-inspection', evaluationId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/multimodal/inspection/${evaluationId}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Multimodal Answer Paper Inspector
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Side-by-side inspection of handwritten OCR text overlays, voice viva transcripts, and diagram region analysis.
          </p>
        </div>

        {isLoading || !inspection ? (
          <div className="py-8 text-center text-slate-500">Loading multimodal inspection components...</div>
        ) : (
          <div className="space-y-6">
            {/* 1. Handwritten OCR Inspection */}
            <Card className="border-indigo-100 dark:border-indigo-900/30">
              <CardHeader>
                <CardTitle className="text-base font-bold">1. Extracted Handwritten Answer Script (Page {inspection.ocr_scripts[0]?.page_number || 1})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800">
                  <span className="text-emerald-400 font-bold">[OCR Extracted Text - Conf: {((inspection.ocr_scripts[0]?.confidence_score || 0.94) * 100).toFixed(0)}%]:</span>
                  <p className="mt-2">{inspection.ocr_scripts[0]?.extracted_text}</p>
                </div>
              </CardContent>
            </Card>

            {/* 2. Voice Viva Transcript */}
            <Card className="border-indigo-100 dark:border-indigo-900/30">
              <CardHeader>
                <CardTitle className="text-base font-bold">2. Voice Viva Audio Transcript ({inspection.viva_transcripts[0]?.duration_seconds || 60}s)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800">
                  <span className="text-indigo-400 font-bold">[Speech-to-Text Transcript - Conf: {((inspection.viva_transcripts[0]?.speech_confidence || 0.89) * 100).toFixed(0)}%]:</span>
                  <p className="mt-2">{inspection.viva_transcripts[0]?.transcript_text}</p>
                </div>
              </CardContent>
            </Card>

            {/* 3. Diagram Region Component Breakdown */}
            <Card className="border-indigo-100 dark:border-indigo-900/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold">3. Technical Diagram Structural Analysis</CardTitle>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  Score: {inspection.diagram_evaluations[0]?.structural_score || 88} / 100
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Detected Diagram Components:</span>
                  <ul className="pl-5 list-disc text-xs text-slate-700 dark:text-slate-300">
                    {inspection.diagram_evaluations[0]?.detected_components?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Missing Diagram Components:</span>
                  <ul className="pl-5 list-disc text-xs text-slate-700 dark:text-slate-300">
                    {inspection.diagram_evaluations[0]?.missing_components?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
