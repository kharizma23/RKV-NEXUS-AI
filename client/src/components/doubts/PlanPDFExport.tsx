'use client';

import React from 'react';
import { Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanPDFExportProps {
  planData: {
    concept: string;
    topic_to_reteach: string;
    duration_minutes: number;
    plan_text: string;
    example_problems?: Array<{ title: string; scenario: string; solution_key: string }>;
    practice_questions?: string[];
    assessment_method: string;
    generated_at?: string;
  };
}

export function PlanPDFExport({ planData }: PlanPDFExportProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI Lecture Intervention Plan - ${planData.concept}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 8px; font-size: 24px; }
            h2 { color: #334155; margin-top: 24px; font-size: 18px; border-bottom: 1px solid #e2e8f0; }
            .meta { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; margin: 16px 0; font-size: 14px; }
            .problem { background: #f1f5f9; padding: 12px; border-radius: 6px; margin-bottom: 12px; }
            .solution { color: #047857; font-weight: 600; margin-top: 6px; }
            pre { white-space: pre-wrap; font-family: inherit; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>RKV NEXUS AI — Remedial Lecture Intervention Plan</h1>
          <div class="meta">
            <p><strong>Target Conceptual Bottleneck:</strong> ${planData.concept}</p>
            <p><strong>Topic to Re-Teach:</strong> ${planData.topic_to_reteach}</p>
            <p><strong>Recommended Duration:</strong> ${planData.duration_minutes} Minutes</p>
            <p><strong>Verification Assessment:</strong> ${planData.assessment_method}</p>
            <p><strong>Generated:</strong> ${new Date(planData.generated_at || Date.now()).toLocaleString()}</p>
          </div>

          <h2>1. Structured Pedagogical Intervention Flow</h2>
          <pre>${planData.plan_text}</pre>

          <h2>2. Curated Walkthrough Problems</h2>
          ${(planData.example_problems || [])
            .map(
              (p, idx) => `
              <div class="problem">
                <strong>Problem #${idx + 1}: ${p.title}</strong>
                <p>${p.scenario}</p>
                <div class="solution">Solution Invariant: ${p.solution_key}</div>
              </div>`
            )
            .join('')}

          <h2>3. Formative Practice Questions</h2>
          <ol>
            ${(planData.practice_questions || []).map((q) => `<li>${q}</li>`).join('')}
          </ol>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handlePrint}
      className="font-bold text-xs h-8 border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 flex items-center gap-1.5"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print / Save as PDF</span>
    </Button>
  );
}
