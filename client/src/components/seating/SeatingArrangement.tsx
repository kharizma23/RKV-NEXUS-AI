'use client';

import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

interface SeatingArrangementProps {
  chartData?: any;
  examId?: string;
}

export function SeatingArrangement({ chartData: initialChartData, examId }: SeatingArrangementProps) {
  const [chartData, setChartData] = React.useState<any>(initialChartData);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (initialChartData) {
      setChartData(initialChartData);
    } else if (examId) {
      setLoading(true);
      fetch(`/api/v1/seating/${examId}/chart`)
        .then((r) => r.json())
        .then((data) => setChartData(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [initialChartData, examId]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Loading seating grid...</div>;
  }

  if (!chartData || !chartData.rows_layout) {
    return <div className="p-8 text-center text-xs text-muted-foreground">No seating chart generated yet.</div>;
  }

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Visual Examination Hall 2D Seating Grid</h3>
          <p className="text-xs text-muted-foreground">Anti-collusion checkerboard interleaving active</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Cheating Prevention Active</span>
        </div>
      </div>

      {/* Invigilator Podium Indicator */}
      <div className="w-48 mx-auto py-1.5 bg-muted border rounded-md text-center text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        Invigilator Desk & Stage Front
      </div>

      {/* Grid Layout */}
      <div className="space-y-4 pt-2 overflow-x-auto">
        {chartData.rows_layout.map((r: any) => (
          <div key={r.row} className="flex items-center space-x-3 justify-center min-w-fit">
            <span className="w-8 text-[11px] font-mono font-bold text-muted-foreground">Row {r.row}</span>
            <div className="flex items-center space-x-2.5">
              {r.seats.map((seat: any) => (
                <div
                  key={seat.id}
                  className="w-24 p-2 bg-muted/40 rounded-xl border border-indigo-500/30 flex flex-col items-center justify-center text-center space-y-1 hover:border-indigo-500 transition-colors shadow-sm"
                >
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono">
                    {seat.seat_label}
                  </span>
                  <span className="text-[10px] font-bold text-foreground truncate w-full">
                    {seat.student_name}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">
                    CSE-{seat.seat_label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-muted/30 rounded-xl border text-[11px] text-muted-foreground text-center">
        {chartData.verification_status}
      </div>
    </div>
  );
}

export default SeatingArrangement;
