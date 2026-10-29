'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Award, Star, Users, CheckCircle2, AlertTriangle,
  BookOpen, Send, UserCheck, PlusCircle
} from 'lucide-react';

export function FacultyPerformanceDashboard() {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [facultyData, setFacultyData] = useState({
    totalFaculty: 45,
    avgRating: 4.2,
    studentSatisfaction: 87,
    topPerformers: [
      { id: 'fac-1', name: 'Dr. Grace Hopper', department: 'AI & DS', rating: 4.9, coAttainment: 94.2 },
      { id: 'fac-2', name: 'Dr. Alan Turing', department: 'CSE', rating: 4.8, coAttainment: 92.5 },
      { id: 'fac-3', name: 'Dr. Ada Lovelace', department: 'Programming', rating: 4.7, coAttainment: 90.1 }
    ],
    needsImprovement: [
      { id: 'fac-4', name: 'Dr. John Doe', department: 'Physics', rating: 2.5, coAttainment: 58.0 },
      { id: 'fac-5', name: 'Dr. Jane Smith', department: 'Chemistry', rating: 2.8, coAttainment: 62.4 }
    ]
  });

  const fetchFacultyData = async () => {
    try {
      const res = await fetch('/api/v1/admin/faculty-performance');
      if (res.ok) {
        const json = await res.json();
        if (json.data) setFacultyData(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" />
            👨‍🏫 Faculty Performance & Teaching Effectiveness
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track faculty ratings, student satisfaction, and course assignments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setShowAssignModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Assign Course
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowFeedbackModal(true)} className="text-xs font-bold">
            <Send className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Send Feedback
          </Button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Faculty</p>
              <p className="text-2xl font-black text-foreground">{facultyData.totalFaculty}</p>
            </div>
            <Users className="h-8 w-8 text-indigo-500" />
          </CardContent>
        </Card>

        <Card className="border border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-600">Average Rating</p>
              <p className="text-2xl font-black text-amber-600 flex items-center gap-1">
                {facultyData.avgRating} <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </p>
            </div>
            <Award className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-600">Student Satisfaction</p>
              <p className="text-2xl font-black text-emerald-600">{facultyData.studentSatisfaction}%</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </CardContent>
        </Card>
      </div>

      {/* Performers Grids */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="border border-emerald-500/20">
          <CardHeader className="pb-3 bg-emerald-500/5 border-b border-emerald-500/10">
            <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Top Performing Faculty Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {facultyData.topPerformers.map((fac, i) => (
              <div key={fac.id} className="p-3 rounded-xl border flex items-center justify-between gap-3 bg-card">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center">
                    #{i + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{fac.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{fac.department} Department</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-black text-amber-500 flex items-center gap-0.5 justify-end">
                      ⭐ {fac.rating}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-semibold">{fac.coAttainment}% CO</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => alert(`Viewing profile for ${fac.name}`)} className="text-[10px] h-7 px-2 font-bold">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Needs Improvement */}
        <Card className="border border-amber-500/20">
          <CardHeader className="pb-3 bg-amber-500/5 border-b border-amber-500/10">
            <CardTitle className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Faculty Needs Teaching Support / Review
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {facultyData.needsImprovement.map((fac) => (
              <div key={fac.id} className="p-3 rounded-xl border flex items-center justify-between gap-3 bg-card">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{fac.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{fac.department} Department</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-black text-rose-500 flex items-center gap-0.5 justify-end">
                      ⭐ {fac.rating}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-semibold">{fac.coAttainment}% CO</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => alert(`Assigned teaching peer review for ${fac.name}`)} className="text-[10px] h-7 px-2 font-bold">
                    Support
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Assign Course Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-card border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-sm text-foreground">Assign Faculty Course Lead</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-xs font-bold text-muted-foreground">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground">Select Faculty Member:</label>
                <select className="w-full mt-1 p-2 border rounded bg-background text-foreground">
                  <option>Dr. Grace Hopper (AI & DS)</option>
                  <option>Dr. Alan Turing (CSE)</option>
                  <option>Dr. Ada Lovelace (Programming)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-muted-foreground">Select Subject / Course:</label>
                <select className="w-full mt-1 p-2 border rounded bg-background text-foreground">
                  <option>CSE101 - Programming Fundamentals</option>
                  <option>MAT101 - Engineering Mathematics I</option>
                  <option>PHY101 - Engineering Physics</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button size="sm" onClick={() => { setShowAssignModal(false); alert('Course assignment updated successfully!'); }}>
                Confirm Assignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-card border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-sm text-foreground">Send Faculty Feedback</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-xs font-bold text-muted-foreground">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground">Select Recipient:</label>
                <select className="w-full mt-1 p-2 border rounded bg-background text-foreground">
                  <option>All Faculty Leads</option>
                  <option>Dr. Grace Hopper</option>
                  <option>Dr. Alan Turing</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-muted-foreground">Feedback Message:</label>
                <textarea rows={3} placeholder="Enter administrative evaluation guidance..." className="w-full mt-1 p-2 border rounded bg-background text-foreground" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setShowFeedbackModal(false)}>Cancel</Button>
              <Button size="sm" onClick={() => { setShowFeedbackModal(false); alert('Feedback advisory sent!'); }}>
                Send Advisory
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
