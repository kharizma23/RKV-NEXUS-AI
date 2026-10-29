'use client';

import React, { useState } from 'react';
import {
  Trophy, Plus, CheckCircle2, AlertCircle, Loader2,
  Sparkles, Award, Users, ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';

export function CompetitionAdmin() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('CO Attainment & Autonomous Systems');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeTournaments = [
    { id: '1', name: 'National Autonomous AI & Robotics Challenge', category: 'Autonomous Systems', colleges: 24, leader: 'Apex Institute (Score: 98.2)', prize: '₹2,50,000' },
    { id: '2', name: 'Algorithmic Speed Coding Olympiad 2026', category: 'Algorithms & DS', colleges: 38, leader: 'Vellore Tech (Score: 96.5)', prize: '₹1,50,000' },
    { id: '3', name: 'Sustainable Green Energy & IoT Hackathon', category: 'Hardware & IoT', colleges: 18, leader: 'Bannari Amman (Score: 94.0)', prize: '₹1,00,000' },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setMsg(null);
    try {
      const now = new Date();
      const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await apiClient('/admin/competitions/create', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          category,
          start_date: now.toISOString(),
          end_date: end.toISOString(),
          metrics: [
            { metric_name: 'CO Attainment Score', weight: 0.5 },
            { metric_name: 'Placement Conversion Rate', weight: 0.3 },
            { metric_name: 'Peer Reviewed Publications', weight: 0.2 },
          ],
        }),
      });
      setMsg({ type: 'success', text: `Competition "${title}" initiated on the global ledger!` });
      setTitle('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Failed to create competition.' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-amber-400" /> Grand Tournament Ledger
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">Inter-College Academic Competitions Hub</h1>
          <p className="text-slate-300 text-xs mt-1">
            Orchestrate regional engineering hackathons, cross-institutional OBE challenges, and verifiable prize distribution.
          </p>
        </div>
      </div>

      {/* Creation Card */}
      <Card className="p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-600" /> Launch Inter-Collegiate Grand Tournament
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

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground">Tournament Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. National Autonomous Robotics & Drone Hackathon 2026"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground">Scoring Track Domain</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="CO Attainment & Autonomous Systems">Autonomous Systems & Robotics</option>
              <option value="Algorithmic Speed Coding">Algorithmic Speed Coding</option>
              <option value="Generative AI & LLM Systems">Generative AI & LLM Systems</option>
              <option value="Clean Energy & EV Electronics">Clean Energy & EV Electronics</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <Button
              type="submit"
              disabled={creating}
              className="px-6 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {creating ? 'Broadcasting...' : 'Launch Grand Tournament'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Active Tournaments Table */}
      <Card className="p-6 shadow-sm">
        <h4 className="text-sm font-bold text-foreground mb-3">Live Inter-Collegiate Tournaments</h4>
        <div className="divide-y divide-border/60">
          {activeTournaments.map((t) => (
            <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-bold text-foreground flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  {t.name}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Track: {t.category} • Current Leader: <span className="font-semibold text-emerald-600">{t.leader}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-semibold">{t.colleges} Institutions</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Prize: {t.prize}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
