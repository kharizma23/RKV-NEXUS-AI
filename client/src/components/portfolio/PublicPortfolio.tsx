'use client';

import React, { useState, useEffect } from 'react';
import { Award, Briefcase, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function PublicPortfolio({ urlSlug }: { urlSlug: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient<any>(`/public/portfolio/${urlSlug}`);
        setData(res);
      } catch (err: any) {
        setError(err?.message || 'Verified Portfolio not found.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [urlSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="h-64 bg-slate-800/40 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-white">Portfolio Not Found</h2>
        <p className="text-sm text-slate-400">The requested portfolio URL is inactive or private.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in">
      <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cryptographically Verified Scholar
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{data.title}</h1>
        <p className="text-base text-slate-300 max-w-2xl leading-relaxed">{data.bio}</p>
        <div className="pt-2 text-xs text-slate-400">
          Institution: <span className="text-indigo-300 font-semibold">RKV University of Engineering & Autonomous Systems</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" /> Academic & Engineering Artifacts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.items?.map((it: any) => (
            <div key={it.id} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {it.item_type}
              </span>
              <h4 className="text-base font-bold text-white">{it.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{it.description}</p>
              {it.evidence_url && (
                <a
                  href={it.evidence_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline pt-2 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Verifiable Artifact
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
