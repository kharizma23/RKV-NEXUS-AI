'use client';

import React from 'react';
import { Download, Printer, FileText } from 'lucide-react';

interface SeatingExportProps {
  examId?: string;
  examTitle?: string;
  hallName?: string;
}

export function SeatingExport({ examId, examTitle = "Final Semester Examination", hallName = "Main Hall Alpha" }: SeatingExportProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handlePrint}
        className="px-3.5 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs font-semibold text-foreground flex items-center space-x-1.5 border transition-colors"
      >
        <Printer className="w-3.5 h-3.5 text-muted-foreground" />
        <span>Print Seating Roster</span>
      </button>

      <button
        onClick={handlePrint}
        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export Door Notice PDF</span>
      </button>
    </div>
  );
}

export default SeatingExport;
