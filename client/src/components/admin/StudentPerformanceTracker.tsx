'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users, Search, Download, Mail,
  TrendingUp, TrendingDown, User, Award,
  AlertCircle, CheckCircle, XCircle, Filter
} from 'lucide-react';

export interface StudentItem {
  id: string;
  fullName: string;
  rollNumber: string;
  department: string;
  semester: number;
  coAvg: number;
  trend: number;
  status: 'On Track' | 'At Risk' | 'Critical';
}

export function StudentPerformanceTracker() {
  const [department, setDepartment] = useState('all');
  const [semester, setSemester] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [trackerData, setTrackerData] = useState({
    totalStudents: 8,
    onTrack: 4,
    atRisk: 2,
    critical: 2,
    predictedSuccess: 78,
    predictedDropouts: 2,
    interventions: [
      'Remedial classes scheduled for Vasudev (CO Avg: 45%)',
      'Academic advising assigned for Rahul (CO Avg: 38%)',
      'Mid-term lab review for 2 at-risk students'
    ],
    students: [
      { id: 'stu-1', fullName: 'Dharshini', rollNumber: '23CSE001', department: 'CSE', semester: 1, coAvg: 82, trend: 4, status: 'On Track' },
      { id: 'stu-2', fullName: 'Kharizma', rollNumber: '23CSE002', department: 'CSE', semester: 1, coAvg: 71, trend: -2, status: 'At Risk' },
      { id: 'stu-3', fullName: 'Vasudev', rollNumber: '23CSE003', department: 'CSE', semester: 1, coAvg: 45, trend: -5, status: 'Critical' },
      { id: 'stu-4', fullName: 'Priya', rollNumber: '23CSE004', department: 'CSE', semester: 1, coAvg: 92, trend: 6, status: 'On Track' },
      { id: 'stu-5', fullName: 'Rahul', rollNumber: '23CSE005', department: 'CSE', semester: 1, coAvg: 38, trend: -8, status: 'Critical' },
      { id: 'stu-6', fullName: 'Ananya', rollNumber: '23ECE001', department: 'ECE', semester: 2, coAvg: 78, trend: 3, status: 'On Track' },
      { id: 'stu-7', fullName: 'Siddharth', rollNumber: '23EEE001', department: 'EEE', semester: 3, coAvg: 54, trend: -1, status: 'At Risk' },
      { id: 'stu-8', fullName: 'Kavya', rollNumber: '23AIDS001', department: 'AI & DS', semester: 1, coAvg: 88, trend: 5, status: 'On Track' }
    ] as StudentItem[]
  });

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/student-tracker?department=${department}&semester=${semester}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) setTrackerData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [department, semester]);

  const filteredStudents = trackerData.students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    if (status === 'On Track') return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">🟢 On Track</span>;
    if (status === 'At Risk') return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold">🟡 At Risk</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-600 border border-rose-500/20 font-bold">🔴 Critical</span>;
  };

  const sendAlerts = () => {
    alert(`📢 Advisory notifications sent to ${trackerData.atRisk + trackerData.critical} at-risk students and faculty advisors!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-500" />
            📋 Student Performance Tracker
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Monitor student outcome progress and AI drop-out predictions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open('/api/v1/admin/reports/download')} className="text-xs font-bold">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={sendAlerts} className="text-xs font-bold text-amber-600 border-amber-500/30 bg-amber-500/10">
            <Mail className="h-3.5 w-3.5 mr-1.5" />
            Send Advisories
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 items-center bg-card p-3 rounded-xl border">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-1.5 text-xs border rounded-lg bg-background text-foreground focus:outline-none"
          >
            <option value="all">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="AI & DS">AI & DS</option>
          </select>
        </div>

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="px-3 py-1.5 text-xs border rounded-lg bg-background text-foreground focus:outline-none"
        >
          <option value="all">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={String(s)}>Semester {s}</option>
          ))}
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Enrolled</p>
              <p className="text-2xl font-black text-foreground">{trackerData.totalStudents}</p>
            </div>
            <Users className="h-7 w-7 text-indigo-500" />
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-600">On Track</p>
              <p className="text-2xl font-black text-emerald-600">{trackerData.onTrack}</p>
            </div>
            <CheckCircle className="h-7 w-7 text-emerald-500" />
          </CardContent>
        </Card>

        <Card className="border border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-600">At Risk</p>
              <p className="text-2xl font-black text-amber-600">{trackerData.atRisk}</p>
            </div>
            <AlertCircle className="h-7 w-7 text-amber-500" />
          </CardContent>
        </Card>

        <Card className="border border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-rose-600">Critical Attention</p>
              <p className="text-2xl font-black text-rose-600">{trackerData.critical}</p>
            </div>
            <XCircle className="h-7 w-7 text-rose-500" />
          </CardContent>
        </Card>
      </div>

      {/* Student List Table */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Student Records & Outcomes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-y text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Semester</th>
                  <th className="p-3">CO Average</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/20">
                    <td className="p-3 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 font-bold flex items-center justify-center text-[10px]">
                          {student.fullName.charAt(0)}
                        </div>
                        <span>{student.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono">{student.rollNumber}</td>
                    <td className="p-3">{student.department}</td>
                    <td className="p-3">Sem {student.semester}</td>
                    <td className="p-3 font-bold">
                      <div className="flex items-center gap-1.5">
                        <span>{student.coAvg}%</span>
                        {student.trend >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-3">{getStatusBadge(student.status)}</td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setSelectedStudent(student)} className="text-[10px] h-7 px-2 font-bold">
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => alert(`Remedial action plan created for ${student.fullName} (${student.rollNumber})`)}
                          className="text-[10px] h-7 px-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Intervene
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Predictions & Recommendations */}
      <Card className="border border-indigo-500/20 bg-indigo-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" />
            🧠 AI Dropout Risk Predictions & Remedial Guidance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-card border text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Predicted Next Sem Success Rate</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{trackerData.predictedSuccess}%</p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${trackerData.predictedSuccess}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-card border text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">At-Risk Student Count</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{trackerData.predictedDropouts}</p>
              <p className="text-[10px] text-rose-500 font-bold mt-1">Requires Immediate Remedial Action</p>
            </div>

            <div className="p-3 rounded-lg bg-card border">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Recommended Interventions</p>
              <ul className="space-y-1 text-[11px] text-foreground">
                {trackerData.interventions.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-card border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground">{selectedStudent.fullName}</h3>
                <p className="text-xs text-muted-foreground">Roll: {selectedStudent.rollNumber} | Dept: {selectedStudent.department}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-[10px] text-muted-foreground font-bold">CO Average</p>
                <p className="text-2xl font-black text-indigo-600">{selectedStudent.coAvg}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-[10px] text-muted-foreground font-bold">Semester</p>
                <p className="text-2xl font-black text-foreground">Sem {selectedStudent.semester}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-foreground">Performance Diagnosis:</p>
              <div className="p-2.5 rounded bg-muted/40 text-muted-foreground">
                • Status: <span className="font-bold text-foreground">{selectedStudent.status}</span>
              </div>
              <div className="p-2.5 rounded bg-muted/40 text-muted-foreground">
                • Outcome Attainment Trend: {selectedStudent.trend >= 0 ? `+${selectedStudent.trend}% growth` : `${selectedStudent.trend}% drop`}
              </div>
            </div>

            <div className="flex justify-end pt-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
              <Button size="sm" onClick={() => alert(`Academic counseling notification sent to ${selectedStudent.fullName}`)}>
                Send Counseling Alert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
