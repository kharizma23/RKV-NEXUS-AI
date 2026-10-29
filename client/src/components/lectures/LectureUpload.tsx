'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Video, Sparkles, CheckCircle2, AlertCircle, FileText, HelpCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function LectureUpload() {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [lectures, setLectures] = useState<any[]>([]);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLectures = async () => {
    try {
      const data = await apiClient<any[]>('/faculty/lectures');
      setLectures(data || []);
    } catch {
      // Ignore if not loaded
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) return;
    setUploading(true);
    setStatusMsg(null);
    try {
      const res = await apiClient<any>('/faculty/lectures/upload', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), video_url: videoUrl.trim() }),
      });
      setStatusMsg({
        type: 'success',
        text: `Lecture "${res.title}" successfully ingested! Starting AI transcription pipeline...`,
      });
      setTitle('');
      setVideoUrl('');
      fetchLectures();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to upload lecture video.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSummarize = async (lectureId: string) => {
    setSummarizingId(lectureId);
    setStatusMsg(null);
    try {
      const res = await apiClient<any>(`/faculty/lectures/${lectureId}/summarize`, {
        method: 'POST',
      });
      setStatusMsg({
        type: 'success',
        text: `AI summary & ${res.mcqs?.length || 2} MCQs generated and mapped to Course Outcomes!`,
      });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to trigger summarization.' });
    } finally {
      setSummarizingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-red-950/40 via-orange-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-red-500/20 shadow-xl space-y-2">
        <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-500/20 text-red-300 rounded-full border border-red-500/30 flex items-center gap-1 w-fit">
          <Sparkles className="w-3 h-3 text-red-400" /> Whisper AI + Gemini Pro
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Lecture Ingestion & Summarizer</h1>
        <p className="text-sm text-slate-300">
          Upload recorded class lectures or laboratory videos. AI extracts audio, generates structured summaries, builds practice MCQs, and tags COs.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-orange-400" /> Ingest New Lecture Video
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Lecture Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus: Raft vs Paxos Deep Dive"
              className="w-full px-4 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Video Storage URL (.mp4 / stream)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://storage.rkvnexus.edu/lectures/lecture-04.mp4"
              className="w-full px-4 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-xl transition shadow-md shadow-orange-600/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Processing Video...' : 'Ingest & Transcribe'}
        </button>
      </form>

      {/* Lectures List */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-base font-semibold text-white">Ingested Lectures Catalog</h3>
        <div className="divide-y divide-slate-800/80">
          {lectures.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No lectures uploaded yet.</p>
          ) : (
            lectures.map((lec) => (
              <div key={lec.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">{lec.title}</h4>
                  <p className="text-xs text-slate-400 font-mono truncate max-w-md">{lec.video_url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSummarize(lec.id)}
                    disabled={summarizingId === lec.id}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    {summarizingId === lec.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                    )}
                    {summarizingId === lec.id ? 'Summarizing...' : 'Trigger AI Summary'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
