'use client';

import React, { useState } from 'react';
import {
  BookOpen, Plus, CheckCircle2, AlertCircle, Loader2,
  ExternalLink, Sparkles, RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';

export function ContentAdmin() {
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('YouTube Academic');
  const [contentType, setContentType] = useState('VIDEO');
  const [curating, setCurating] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const curatedList = [
    { id: '1', title: 'MIT 6.824: Raft Consensus In-Depth', topic: 'Distributed Systems', type: 'VIDEO', source: 'MIT OpenCourseWare' },
    { id: '2', title: 'Stanford CS229: Machine Learning Full Lecture', topic: 'AI & Data Science', type: 'VIDEO', source: 'Stanford Online' },
    { id: '3', title: 'Harvard CS50: Memory & Pointers in C', topic: 'Programming Fundamentals', type: 'VIDEO', source: 'Harvard University' },
  ];

  const handleCurate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !title.trim() || !url.trim()) return;
    setCurating(true);
    setMsg(null);
    try {
      await apiClient('/admin/content/curate', {
        method: 'POST',
        body: JSON.stringify({
          topic: topic.trim(),
          title: title.trim(),
          url: url.trim(),
          source,
          content_type: contentType,
        }),
      });
      setMsg({ type: 'success', text: `Resource "${title}" successfully cataloged in the institutional library!` });
      setTopic('');
      setTitle('');
      setUrl('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Failed to catalog content.' });
    } finally {
      setCurating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 border border-red-400/30 text-red-300 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-red-400" /> Curated Knowledge
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">Library Content Curation Hub</h1>
          <p className="text-slate-300 text-xs mt-1">
            Curate world-class verified educational resources and link video micro-lessons to course learning outcomes.
          </p>
        </div>
      </div>

      <Card className="p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-red-600" /> Curate University Knowledge Library Resource
        </h3>

        {msg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleCurate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Target Conceptual Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Distributed Consensus Algorithms"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Resource Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MIT 6.824: Raft Consensus In-Depth"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground">Resource URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <Button
              type="submit"
              disabled={curating}
              className="px-6 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              {curating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {curating ? 'Cataloging...' : 'Catalog Content'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Existing Curated Resources */}
      <Card className="p-6 shadow-sm">
        <h4 className="text-sm font-bold text-foreground mb-3">Recently Indexed Courseware</h4>
        <div className="divide-y divide-border/60">
          {curatedList.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-foreground">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.topic} • {item.source}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
