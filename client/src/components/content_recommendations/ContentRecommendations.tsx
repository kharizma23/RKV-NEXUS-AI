'use client';

import React, { useState, useEffect } from 'react';
import { Youtube, BookOpen, ExternalLink, Sparkles, RefreshCw, Video } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function ContentRecommendations() {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any[]>('/student/content/recommendations');
      setRecs(data || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-red-950/40 via-rose-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-red-500/20 shadow-xl">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-500/20 text-red-300 rounded-full border border-red-500/30 flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3 text-red-400" /> AI External Curation
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart Supplementary Learning Recommendations</h1>
          <p className="text-sm text-slate-300">
            Curated YouTube lectures, arXiv preprints, and MIT/Stanford open courseware targeted at your identified conceptual weaknesses.
          </p>
        </div>
        <button
          onClick={fetchRecs}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recs.map((r, idx) => (
          <div
            key={idx}
            className="p-5 bg-slate-900/70 border border-slate-800 hover:border-red-500/30 rounded-2xl space-y-3 transition shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 flex items-center gap-1">
                  <Video className="w-3 h-3" /> {r.content_type}
                </span>
                <span className="text-[11px] text-slate-400">{r.source}</span>
              </div>
              <h4 className="text-sm font-semibold text-white leading-snug">{r.title}</h4>
              <p className="text-xs text-slate-400">Target Concept: {r.topic}</p>
            </div>

            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:underline pt-2"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Curated Resource
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
