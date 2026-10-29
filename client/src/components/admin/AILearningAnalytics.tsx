'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Flame, TrendingUp, TrendingDown, AlertTriangle, FileText, Send, Sparkles, RefreshCw } from 'lucide-react';

export function AILearningAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/learning-analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch learning analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-500" />
            🧠 AI Learning Analytics Engine
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Deep learning pattern analysis, topic trends, and proactive AI recommendations</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={fetchAnalytics} className="text-xs font-bold">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={() => alert("Learning report generated successfully!")} className="text-xs font-bold">
            <FileText className="w-3.5 h-3.5 mr-1" /> Generate Learning Report
          </Button>
          <Button size="sm" onClick={() => alert("AI Recommendations dispatched to department heads!")} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold">
            <Send className="w-3.5 h-3.5 mr-1" /> Send Recommendations
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Student Learning Patterns */}
        <Card className="border">
          <CardHeader className="py-3.5 border-b bg-muted/30">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Student Learning Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase">Most Active Students</p>
            {data?.mostActiveStudents?.map((st: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 font-bold text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{st.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{st.hoursPerWeek} hrs/week</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${st.status === 'UP' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                  {st.change} {st.status === 'WARNING' && '⚠️'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card className="border">
          <CardHeader className="py-3.5 border-b bg-muted/30">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" /> Trending Topics & Material Demand
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase">Topic Search Volume</p>
            {data?.trendingTopics?.map((tp: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  {tp.status === 'HOT' && <Flame className="w-4 h-4 text-rose-500 animate-bounce" />}
                  {tp.status === 'UP' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                  {tp.status === 'DOWN' && <TrendingDown className="w-4 h-4 text-slate-400" />}
                  <span className="text-xs font-bold text-foreground">{tp.topic}</span>
                </div>
                <span className="text-xs font-bold text-indigo-600 font-mono">{tp.searches}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="border bg-indigo-500/5 border-indigo-500/20">
        <CardHeader className="py-3 border-b border-indigo-500/20">
          <CardTitle className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            💡 AI Recommendations & Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {data?.aiRecommendations?.map((rec: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs font-semibold text-foreground p-2 rounded bg-card border">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
