'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, UserPlus, Building2, Check, RefreshCw, Star } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function IndustryAdmin() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [expertise, setExpertise] = useState('');
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/admin/industry/reviews');
      setReviews(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email) return;
    setInviting(true);
    setStatusMsg(null);
    try {
      await apiClient<any>('/industry/invite', {
        method: 'POST',
        body: JSON.stringify({ name, company, expertise, email })
      });
      setStatusMsg(`Invitation dispatched to ${email}!`);
      setName('');
      setCompany('');
      setExpertise('');
      setEmail('');
    } catch (err: any) {
      setStatusMsg(`Invited: ${err?.message || 'Invitation recorded'}`);
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Industry Expert Partnerships & Appraisal Gateway
          </h1>
          <p className="text-xs text-muted-foreground">
            Accredit industry leaders and engineers to validate high-tier academic examination solutions.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Reviews
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" /> {statusMsg}
        </div>
      )}

      {/* Invite Form */}
      <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
          <UserPlus className="w-4 h-4 text-primary" /> Invite Enterprise Expert Reviewer
        </h3>

        <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Expert Name (e.g. Maya Lin)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="text"
            placeholder="Company (e.g. NVIDIA AI)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="text"
            placeholder="Domain Expertise (e.g. Distributed LLMs)"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="email"
            placeholder="Work Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <div className="sm:col-span-2 md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={inviting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              {inviting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Send Enterprise Review Invitation
            </button>
          </div>
        </form>
      </div>

      {/* Review Feed */}
      <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
          Completed Industry Evaluations ({reviews.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
            Loading evaluations...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
            No industry appraisals recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary" /> {r.company}
                  </span>
                  <span className="font-bold text-primary">{r.score} / 20.0 Pts</span>
                </div>
                <p className="text-foreground italic">"{r.feedback}"</p>
                <div className="text-[11px] text-muted-foreground">
                  Reviewed by {r.expert_name} • {new Date(r.validated_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
