'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function StudentMultimodalUploadPage() {
  const params = useParams();
  const examId = params.id as string;

  const [handwrittenUploaded, setHandwrittenUploaded] = useState(false);
  const [vivaUploaded, setVivaUploaded] = useState(false);
  const [diagramUploaded, setDiagramUploaded] = useState(false);

  const ocrMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/multimodal/upload-handwritten/${examId}`, { method: 'POST' });
      if (!res.ok) throw new Error('OCR upload failed');
      return res.json();
    },
    onSuccess: () => setHandwrittenUploaded(true),
  });

  const vivaMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/multimodal/upload-viva/${examId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Viva upload failed');
      return res.json();
    },
    onSuccess: () => setVivaUploaded(true),
  });

  const diagramMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/multimodal/upload-diagram/${examId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Diagram upload failed');
      return res.json();
    },
    onSuccess: () => setDiagramUploaded(true),
  });

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Multimodal Answer Submission Workspace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Upload handwritten answer sheet images, record voice viva audio, and submit technical diagram region scans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Handwritten OCR */}
          <Card className="border-indigo-100 dark:border-indigo-900/30">
            <CardHeader>
              <CardTitle className="text-base">1. Handwritten Script OCR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">
                <span className="text-2xl">📄</span>
                <p className="text-xs text-slate-500 mt-2">Upload JPEG/PNG/PDF Answer Script</p>
              </div>
              <Button
                onClick={() => ocrMutation.mutate()}
                disabled={ocrMutation.isPending || handwrittenUploaded}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                {handwrittenUploaded ? '✓ Script Processed' : ocrMutation.isPending ? 'Processing OCR...' : 'Process Handwritten OCR'}
              </Button>
            </CardContent>
          </Card>

          {/* 2. Voice Viva */}
          <Card className="border-indigo-100 dark:border-indigo-900/30">
            <CardHeader>
              <CardTitle className="text-base">2. Voice Viva Audio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">
                <span className="text-2xl">🎙️</span>
                <p className="text-xs text-slate-500 mt-2">Record Spoken Viva Response (MP3/WAV)</p>
              </div>
              <Button
                onClick={() => vivaMutation.mutate()}
                disabled={vivaMutation.isPending || vivaUploaded}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                {vivaUploaded ? '✓ Audio Transcribed' : vivaMutation.isPending ? 'Transcribing Audio...' : 'Process Voice Viva'}
              </Button>
            </CardContent>
          </Card>

          {/* 3. Diagram Region */}
          <Card className="border-indigo-100 dark:border-indigo-900/30">
            <CardHeader>
              <CardTitle className="text-base">3. Technical Diagram Scan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">
                <span className="text-2xl">📐</span>
                <p className="text-xs text-slate-500 mt-2">Upload Architectural Diagram Image</p>
              </div>
              <Button
                onClick={() => diagramMutation.mutate()}
                disabled={diagramMutation.isPending || diagramUploaded}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                {diagramUploaded ? '✓ Diagram Analyzed' : diagramMutation.isPending ? 'Analyzing Structure...' : 'Process Diagram Region'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
