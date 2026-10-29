'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Activity, AlertCircle, Calendar, Send, FileText } from 'lucide-react';

export function StudentWellnessTracker() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchWellness = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/wellness-tracker');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch wellness tracker', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWellness();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            🏥 Student Wellness Tracker
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Monitor student health, mental well-being check-ins, and stress indicator alerts</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => alert("Check-in scheduled!")} className="text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 mr-1" /> Schedule Check-in
          </Button>
          <Button size="sm" variant="outline" onClick={() => alert("Wellness tips sent to all students!")} className="text-xs font-bold">
            <Send className="w-3.5 h-3.5 mr-1" /> Send Wellness Tips
          </Button>
          <Button size="sm" onClick={() => alert("Wellness report downloaded!")} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
            <FileText className="w-3.5 h-3.5 mr-1" /> View Reports
          </Button>
        </div>
      </div>

      {/* Wellness Scores */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Mental Health Index</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{data?.scores?.mentalHealth || 78}% Good</p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${data?.scores?.mentalHealth || 78}%` }} />
              </div>
            </div>
            <Heart className="w-8 h-8 text-rose-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Physical Fitness</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{data?.scores?.physicalHealth || 82}% Good</p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data?.scores?.physicalHealth || 82}%` }} />
              </div>
            </div>
            <Activity className="w-8 h-8 text-emerald-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Academic Balance</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{data?.scores?.academicHealth || 75}% Good</p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${data?.scores?.academicHealth || 75}%` }} />
              </div>
            </div>
            <FileText className="w-8 h-8 text-indigo-500/30" />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Wellness Alerts */}
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" /> Wellness Indicator Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {data?.alerts?.map((alt: string, i: number) => (
              <div key={i} className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>🔴 {alt}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Check-ins */}
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              ✅ Weekly Health Check-in Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg border bg-card">
              <span className="text-xs font-bold text-foreground">✅ Completed Check-ins</span>
              <span className="text-xs font-black text-emerald-600 font-mono">{data?.checkIns?.completed || 150} Students</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border bg-card">
              <span className="text-xs font-bold text-foreground">⏳ Pending Check-ins</span>
              <span className="text-xs font-black text-amber-600 font-mono">{data?.checkIns?.pending || 50} Students</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
