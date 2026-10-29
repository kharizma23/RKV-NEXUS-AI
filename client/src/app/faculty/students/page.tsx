'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, AlertTriangle, CheckCircle2, Download, Send, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

export default function StudentProgressTrackerPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [students] = useState([
    { id: 'st1', rank: 1, name: 'Dharshini', roll: '23CSE001', exams: '3/3', avg: '85%', co: 'A', status: 'ON_TRACK', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'st2', rank: 2, name: 'Kharizma', roll: '23CSE002', exams: '3/3', avg: '78%', co: 'B+', status: 'ON_TRACK', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'st3', rank: 3, name: 'Priya', roll: '23CSE003', exams: '2/3', avg: '72%', co: 'B', status: 'ON_TRACK', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'st4', rank: 4, name: 'Rahul', roll: '23CSE004', exams: '1/3', avg: '45%', co: 'D', status: 'AT_RISK', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'st5', rank: 5, name: 'Sita', roll: '23CSE005', exams: '1/3', avg: '38%', co: 'E', status: 'CRITICAL', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ]);

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSendReminders = () => {
    alert("Remedial study reminders sent to 2 At-Risk / Critical students!");
  };

  const handleExportProgressReport = () => {
    const reportText = `STUDENT PROGRESS & CO ATTAINMENT REPORT\n` +
      `Department: Computer Science & Engineering - BIT\n` +
      `-----------------------------------------\n` +
      `1. Dharshini (23CSE001) - Avg: 85% (Grade A) - On Track\n` +
      `2. Kharizma (23CSE002) - Avg: 78% (Grade B+) - On Track\n` +
      `3. Priya (23CSE003) - Avg: 72% (Grade B) - On Track\n` +
      `4. Rahul (23CSE004) - Avg: 45% (Grade D) - At Risk ⚠️\n` +
      `5. Sita (23CSE005) - Avg: 38% (Grade E) - Critical 🚨\n`;

    const element = document.createElement("a");
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "Student_Progress_Report.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-500" />
              👨‍🎓 Student Progress & Learning Tracker
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Faculty: {user?.full_name} {user?.faculty_profile?.designation ? `• ${user.faculty_profile.designation}` : ''}
            </p>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSendReminders} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm">
              <Send className="w-3.5 h-3.5 mr-1" /> Send At-Risk Alerts
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportProgressReport} className="text-xs font-bold border-slate-700">
              <Download className="w-3.5 h-3.5 mr-1" /> Export Report
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 bg-muted/20 border">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search student by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-foreground">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border bg-background text-foreground text-xs font-semibold"
              >
                <option value="ALL">All Students (5)</option>
                <option value="ON_TRACK">On Track (3)</option>
                <option value="AT_RISK">At Risk (1)</option>
                <option value="CRITICAL">Critical (1)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Student Table */}
        <Card className="border shadow-sm">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-black uppercase text-foreground">
              Class Performance Roster ({filteredStudents.length} Students)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Student Name</th>
                  <th className="py-2">Roll Number</th>
                  <th className="py-2">Exams Completed</th>
                  <th className="py-2">Avg Score</th>
                  <th className="py-2">CO Grade</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y font-semibold">
                {filteredStudents.map((st) => (
                  <tr key={st.id}>
                    <td className="py-3 font-mono font-bold">{st.rank}</td>
                    <td className="py-3 font-bold text-foreground">{st.name}</td>
                    <td className="py-3 font-mono text-muted-foreground">{st.roll}</td>
                    <td className="py-3 font-mono">{st.exams}</td>
                    <td className="py-3 font-mono font-bold text-indigo-500">{st.avg}</td>
                    <td className="py-3 font-mono font-bold">{st.co}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${st.bg} ${st.color}`}>
                        {st.status === 'ON_TRACK' && '✅ On Track'}
                        {st.status === 'AT_RISK' && '⚠️ At Risk'}
                        {st.status === 'CRITICAL' && '🔴 Critical'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => alert(`Contacting parents / student ${st.name}`)} className="text-[10px] font-bold h-7">
                        Contact
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Performance Summary Heatmap */}
        <Card className="border bg-indigo-500/5 border-indigo-500/20 shadow-sm">
          <CardContent className="p-5 space-y-2 text-xs">
            <p className="font-bold text-indigo-400 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4" /> Class Performance Insights:
            </p>
            <div className="space-y-1 text-muted-foreground">
              <p>💡 <strong>Top Performer:</strong> Dharshini (95% average across 3 internal tests).</p>
              <p>💡 <strong>At-Risk Alerts:</strong> 2 students (Rahul, Sita) require remedial support in Machine Learning algorithms.</p>
              <p>💡 <strong>Remedial Recommendation:</strong> Schedule an interactive tutorial on Neural Networks and CO3.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
