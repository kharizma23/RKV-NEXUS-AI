'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const coTrendData = [
  { semester: 'Sem 1', CO1: 72, CO2: 68, CO3: 75, CO4: 70 },
  { semester: 'Sem 2', CO1: 84, CO2: 79, CO3: 82, CO4: 80 },
  { semester: 'Sem 3', CO1: 92, CO2: 88, CO3: 91, CO4: 87 },
  { semester: 'Sem 4 (Forecast)', CO1: 94, CO2: 91, CO3: 93, CO4: 90 },
];

const departmentData = [
  { name: 'CSE', attainment: 88.5, placement: 93.4 },
  { name: 'AI & DS', attainment: 91.0, placement: 94.8 },
  { name: 'ECE', attainment: 78.4, placement: 86.2 },
  { name: 'EEE', attainment: 72.0, placement: 82.5 },
  { name: 'Mech', attainment: 75.6, placement: 84.0 },
  { name: 'Civil', attainment: 70.2, placement: 78.0 },
];

export function AnalyticsCharts() {
  const [selectedDept, setSelectedDept] = React.useState<any | null>(null);

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      setSelectedDept(data.activePayload[0].payload);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* CO Attainment Trend Line Chart */}
      <Card className="shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-indigo-500" />
              CO Attainment Trend (Last 3 Semesters)
            </CardTitle>
            <CardDescription className="text-xs">
              Course Outcome attainment benchmarks across semesters
            </CardDescription>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            ↑ 12% Growth
          </span>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={coTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.2)" />
                <XAxis dataKey="semester" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="CO1" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="CO2" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="CO3" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="CO4" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Department-wise Performance Bar Chart */}
      <Card className="shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-500" />
              Department-wise Academic Performance
            </CardTitle>
            <CardDescription className="text-xs">
              Click any department bar to drill-down into detailed subject outcome statistics
            </CardDescription>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
            6 Departments (Interactive)
          </span>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} onClick={handleBarClick} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="attainment" name="CO Attainment %" fill="#6366f1" radius={[4, 4, 0, 0]} className="cursor-pointer" />
                <Bar dataKey="placement" name="Placement Rate %" fill="#06b6d4" radius={[4, 4, 0, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Modal */}
      {selectedDept && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-card border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-foreground">
                  📊 {selectedDept.name} Department Analytics
                </h3>
                <p className="text-xs text-muted-foreground">Detailed outcome and placement breakdown</p>
              </div>
              <button onClick={() => setSelectedDept(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">CO Attainment</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{selectedDept.attainment}%</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Placement Rate</p>
                <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{selectedDept.placement}%</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-foreground">Subject Outcome Breakdown:</p>
              <div className="p-2.5 rounded bg-muted/40 flex justify-between items-center">
                <span>Programming Fundamentals & Data Structures</span>
                <span className="font-bold text-emerald-600">89.2% CO-3</span>
              </div>
              <div className="p-2.5 rounded bg-muted/40 flex justify-between items-center">
                <span>Database Management & SQL Architecture</span>
                <span className="font-bold text-emerald-600">86.4% CO-2</span>
              </div>
              <div className="p-2.5 rounded bg-muted/40 flex justify-between items-center">
                <span>Artificial Intelligence & Neural Networks</span>
                <span className="font-bold text-amber-600">74.5% CO-4</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDept(null)}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
