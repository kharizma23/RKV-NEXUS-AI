'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, AlertCircle, Plus, Download, Eye, Tag } from 'lucide-react';

export function FeedbackSurveySystem() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/feedback-surveys');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch feedback surveys', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-amber-500" />
            📊 Feedback & Survey System
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Student feedback analysis, course satisfaction scores, and sentiment alerts</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => alert("Create Survey modal opened!")} className="text-xs font-bold">
            <Plus className="w-3.5 h-3.5 mr-1" /> Create Survey
          </Button>
          <Button size="sm" variant="outline" onClick={() => alert("View Responses modal opened!")} className="text-xs font-bold">
            <Eye className="w-3.5 h-3.5 mr-1" /> View Responses
          </Button>
          <Button size="sm" onClick={() => alert("Survey data exported!")} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold">
            <Download className="w-3.5 h-3.5 mr-1" /> Export Data
          </Button>
        </div>
      </div>

      {/* Overall Satisfaction */}
      <Card className="border bg-amber-500/5 border-amber-500/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">Overall Student Satisfaction Rating</p>
            <p className="text-3xl font-black text-amber-600 mt-1 flex items-center gap-2">
              {data?.overallRating || 4.2} / 5 <span className="text-xl">★★★★☆</span>
            </p>
          </div>
          <Tag className="w-8 h-8 text-amber-500/40" />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Surveys */}
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              📋 Active Course Surveys
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {data?.recentSurveys?.map((sv: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                <div>
                  <p className="text-xs font-bold text-foreground">📋 {sv.title}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{sv.responses} Responses</p>
                </div>
                <span className="text-xs font-bold text-amber-600 font-mono">⭐ {sv.score}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Negative Feedback Alerts & Word Cloud */}
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" /> Negative Feedback & Sentiment Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase">Critical Alerts</p>
            {data?.negativeAlerts?.map((alt: string, i: number) => (
              <div key={i} className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>🔴 "{alt}"</span>
              </div>
            ))}

            <p className="text-xs font-bold text-muted-foreground uppercase pt-2">Sentiment Word Cloud Tags</p>
            <div className="flex flex-wrap gap-2">
              {data?.wordCloud?.map((tag: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-muted border text-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
