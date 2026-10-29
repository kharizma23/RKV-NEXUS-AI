'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Microscope, FileText, BookOpen, Award, Plus, Star, Users } from 'lucide-react';

export function ResearchPublicationHub() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchResearch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/research-hub');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch research hub', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Microscope className="h-6 w-6 text-cyan-500" />
            🔬 Research & Publication Hub
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track faculty publications, patents, research output, and top scholars</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => alert("Add Publication modal opened!")} className="text-xs font-bold">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Publication
          </Button>
          <Button size="sm" onClick={() => alert("Create Research Group modal opened!")} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold">
            <Users className="w-3.5 h-3.5 mr-1" /> Create Research Group
          </Button>
        </div>
      </div>

      {/* Publication Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Research Papers</p>
              <p className="text-2xl font-black text-cyan-600 mt-1">{data?.stats?.papers || 234}</p>
              <p className="text-[10px] font-bold text-cyan-600 mt-0.5">▲ +45 published</p>
            </div>
            <FileText className="w-8 h-8 text-cyan-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Books Published</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{data?.stats?.books || 12}</p>
              <p className="text-[10px] font-bold text-indigo-600 mt-0.5">▲ +3 books</p>
            </div>
            <BookOpen className="w-8 h-8 text-indigo-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Patents Granted</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{data?.stats?.patents || 8}</p>
              <p className="text-[10px] font-bold text-amber-600 mt-0.5">▲ +2 patents</p>
            </div>
            <Award className="w-8 h-8 text-amber-500/30" />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Researchers */}
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Top Faculty Scholars
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {data?.topResearchers?.map((rs: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                <div>
                  <p className="text-xs font-bold text-foreground">{rs.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{rs.papers} Papers Published</p>
                </div>
                <span className="text-xs font-bold text-amber-500 font-mono">⭐ {rs.rating}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Publications */}
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-500" /> Recent Publications Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {data?.recentPublications?.map((pb: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border bg-card flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-foreground">📄 "{pb.title}"</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{pb.year} • {pb.author}</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold">View Paper</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
