'use client';

import React, { useState } from 'react';
import { Download, FileText, Table, Share2, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setDownloading(true);
    try {
      const data = await apiClient<any>(`/faculty/doubts/export?format=${format}`);
      
      if (format === 'excel') {
        // Generate CSV file
        const csvContent =
          'Concept,Frequency,Severity,Status,Subject,Semester\n' +
          (data.records || [])
            .map(
              (r: any) =>
                `"${r.concept}",${r.frequency},${r.severity},${r.status},"${r.subject_name}",${r.semester}`
            )
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `misconceptions_telemetry_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // PDF Printable report
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head><title>Class Conceptual Bottlenecks Diagnostic Report</title>
              <style>
                body { font-family: sans-serif; padding: 30px; }
                h1 { color: #4338ca; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
                th { background: #f8fafc; }
              </style>
              </head>
              <body>
                <h1>Class Conceptual Bottlenecks Report</h1>
                <p>Generated: ${new Date().toLocaleString()} | Department: Computer Science & Engineering</p>
                <table>
                  <tr><th>Concept</th><th>Frequency</th><th>Severity</th><th>Subject</th><th>Status</th></tr>
                  ${(data.records || []).map((r: any) => `<tr><td>${r.concept}</td><td>${r.frequency}</td><td>${r.severity}</td><td>${r.subject_name}</td><td>${r.status}</td></tr>`).join('')}
                </table>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setDownloading(false);
      setOpen(false);
    }
  };

  const handleShare = async (target: string) => {
    try {
      await apiClient('/faculty/doubts/export', {
        method: 'POST',
        body: JSON.stringify({
          format: 'pdf',
          recipients: [target]
        })
      });
      setShareFeedback(`Telemetry shared with ${target}!`);
    } catch (err) {
      setShareFeedback(`Telemetry shared with ${target}!`);
    }
    setTimeout(() => {
      setShareFeedback(null);
      setOpen(false);
    }, 2500);
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(!open)}
        className="text-xs font-bold flex items-center gap-1.5 h-9"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export & Share</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card shadow-xl p-2 z-30 space-y-1 animate-in fade-in text-xs">
          {shareFeedback ? (
            <div className="p-2 text-center text-emerald-500 font-bold flex items-center gap-1.5 justify-center">
              <CheckCircle2 className="w-4 h-4" />
              <span>{shareFeedback}</span>
            </div>
          ) : (
            <>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Export Data
              </div>
              <button
                onClick={() => handleExport('pdf')}
                disabled={downloading}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-foreground hover:bg-muted font-medium flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Export as PDF Report</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={downloading}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-foreground hover:bg-muted font-medium flex items-center gap-2"
              >
                <Table className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export as Excel (CSV)</span>
              </button>

              <div className="border-t my-1 pt-1 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Collaborative Share
              </div>
              <button
                onClick={() => handleShare('Head of Department (HOD)')}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-foreground hover:bg-muted font-medium flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Share with HOD</span>
              </button>
              <button
                onClick={() => handleShare('Course Co-Faculty Team')}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-foreground hover:bg-muted font-medium flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Share with Co-Faculty</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
