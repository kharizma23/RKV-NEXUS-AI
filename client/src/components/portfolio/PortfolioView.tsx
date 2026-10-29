'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Award, ExternalLink, Plus, Globe, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { PortfolioEditor } from './PortfolioEditor';

interface PortfolioItem {
  id: string;
  item_type: string;
  title: string;
  description: string;
  evidence_url?: string;
  created_at: string;
}

interface PortfolioData {
  id: string;
  student_id: string;
  student_name: string;
  title: string;
  bio: string;
  public_url: string;
  items: PortfolioItem[];
}

export function PortfolioView() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<PortfolioData>('/student/portfolio');
      setPortfolio(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load digital portfolio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleCopyLink = () => {
    if (!portfolio) return;
    const url = `${window.location.origin}/portfolio/${portfolio.public_url}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-blue-500/20 shadow-xl">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3 text-blue-400" /> Tamper-Proof Scholar Showcase
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Verified Digital Academic Portfolio</h1>
          <p className="text-sm text-slate-300">
            Auto-synthesizes highest-attaining assessments, Capstone repositories, and verified credentials into an employer-ready public profile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md shadow-indigo-600/30 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Artifact
          </button>
          <button
            onClick={fetchPortfolio}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 bg-slate-800/40 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-800/40 rounded-2xl animate-pulse" />
        </div>
      ) : portfolio && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">{portfolio.title}</h2>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl">{portfolio.bio}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-xl transition"
              >
                <Globe className="w-4 h-4" />
                {copied ? 'Public URL Copied!' : 'Share Public URL'}
              </button>
            </div>
          </div>

          {/* Artifacts Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" /> Verified Achievements & Artifacts ({portfolio.items.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.items.map((it) => (
                <div
                  key={it.id}
                  className="p-5 bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition space-y-3 shadow-lg group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {it.item_type}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(it.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-white group-hover:text-indigo-300 transition">
                    {it.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">{it.description}</p>

                  {it.evidence_url && (
                    <a
                      href={it.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:underline pt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Cryptographic Proof
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showEditor && (
        <PortfolioEditor
          onClose={() => setShowEditor(false)}
          onAdded={() => {
            setShowEditor(false);
            fetchPortfolio();
          }}
        />
      )}
    </div>
  );
}
