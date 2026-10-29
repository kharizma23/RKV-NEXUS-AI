'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Award, Calendar, Bell, Send, CheckCircle2, MessageSquare, BookOpen, ArrowLeft } from 'lucide-react';

export function ParentDashboard() {
  const [perf, setPerf] = useState<any>(null);
  const [att, setAtt] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParentData = async () => {
      setLoading(true);
      try {
        const pRes = await fetch('/api/v1/parent/child/performance');
        if (pRes.ok) {
          const pJson = await pRes.json();
          setPerf(pJson.data);
        }

        const aRes = await fetch('/api/v1/parent/child/attendance');
        if (aRes.ok) {
          const aJson = await aRes.json();
          setAtt(aJson.data);
        }

        const nRes = await fetch('/api/v1/parent/notifications');
        if (nRes.ok) {
          const nJson = await nRes.json();
          setNotifs(nJson.data || []);
        }
      } catch (e) {
        console.error('Parent portal fetch error', e);
      } finally {
        setLoading(false);
      }
    };

    fetchParentData();
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      const res = await fetch('/api/v1/parent/message/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });
      if (res.ok) {
        alert('Message successfully forwarded to the academic department advisor.');
        setMessageText('');
      }
    } catch (e) {
      console.error('Error sending teacher message', e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-400" />
              RKV Parent Academic Portal
            </h1>
            <p className="text-xs text-indigo-200 mt-1">
              Monitoring Ward: <span className="font-bold text-white">{perf?.child_name || 'Dharshini Ramesh'}</span> (Roll: {perf?.roll_number || '23CSE001'})
            </p>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-right">
          <div className="text-xl font-black text-indigo-200">{perf?.overall_gpa || '8.75'} GPA</div>
          <p className="text-[10px] text-indigo-300 uppercase font-semibold">Cumulative Grade Point</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Attendance Card */}
        <Card className="border">
          <CardHeader className="pb-2 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-500" /> Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="text-3xl font-black text-emerald-600">
              {att?.overall_attendance_percentage || '94.5'}%
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              {att?.classes_attended || 189} of {att?.total_classes || 200} lecture sessions attended
            </p>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${att?.overall_attendance_percentage || 94.5}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Outcomes Attainment */}
        <Card className="border md:col-span-2">
          <CardHeader className="pb-2 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" /> Outcome Mastery Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {Object.entries(perf?.co_attainment_summary || { CO1: '88%', CO2: '82%', CO3: '78%', CO4: '85%' }).map(([co, val]: any) => (
                <div key={co} className="p-3 rounded-xl border bg-muted/10">
                  <div className="text-xs font-black text-primary">{co}</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{val}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Parent Alerts */}
        <Card className="border">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Official Institutional Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-xs">
              {notifs.map((n) => (
                <div key={n.id} className="p-3.5 space-y-1 hover:bg-muted/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {n.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-foreground">{n.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Academic Advisor */}
        <Card className="border">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Contact Department Advisor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Send an inquiry directly to the student's assigned academic counseling mentor.
            </p>
            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your question regarding attendance, examinations, or grade improvement..."
              className="w-full text-xs p-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Forward Inquiry to Faculty
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
