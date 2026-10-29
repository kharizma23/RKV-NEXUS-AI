'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function ClassContentView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any[]>('/faculty/content/class-recommendations');
      setItems(data || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-950/40 via-red-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-purple-500/20 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Class Curated Supplementary Content</h1>
          <p className="text-sm text-slate-300">
            Open-source and academic external materials mapped to high-difficulty topics for entire student cohorts.
          </p>
        </div>
        <button
          onClick={fetchItems}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((it, idx) => (
          <div key={idx} className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              {it.source}
            </span>
            <h4 className="text-sm font-semibold text-white">{it.title}</h4>
            <p className="text-xs text-slate-400">Curated Topic: {it.topic}</p>
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline pt-2 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Launch Course Resource
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
