'use client';

import React, { useState } from 'react';
import { Radio, Users, Activity, AlertTriangle, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function LiveEngagementView() {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [starting, setStarting] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [attentionScore, setAttentionScore] = useState(92);
  const [interactions, setInteractions] = useState(5);
  const [logging, setLogging] = useState(false);
  const [logStatus, setLogStatus] = useState<string | null>(null);

  const handleStartSession = async () => {
    setStarting(true);
    try {
      const res = await apiClient<any>('/faculty/live-session/start', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setActiveSession(res);
    } catch {
      // Ignore
    } finally {
      setStarting(false);
    }
  };

  const handleLogEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !studentIdInput.trim()) return;
    setLogging(true);
    setLogStatus(null);
    try {
      await apiClient(`/faculty/live-session/${activeSession.session_id}/engagement`, {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentIdInput.trim(),
          attention_score: Number(attentionScore),
          interaction_count: Number(interactions),
        }),
      });
      setLogStatus(`Logged telemetry for scholar: ${attentionScore}% attention score.`);
    } catch (err: any) {
      setLogStatus(`Error: ${err?.message || 'Failed to log telemetry'}`);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-cyan-950/40 via-teal-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-cyan-500/20 shadow-xl space-y-2">
        <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30 flex items-center gap-1 w-fit">
          <Activity className="w-3 h-3 text-cyan-400" /> Biometric Attention Telemetry
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Live Class Engagement Sentinel</h1>
        <p className="text-sm text-slate-300">
          Tracks scholar attention, poll responsiveness, and chat velocity during synchronous lectures with automatic disengagement alerts.
        </p>
      </div>

      {!activeSession ? (
        <div className="p-8 bg-slate-900/70 border border-slate-800 rounded-2xl text-center space-y-4">
          <Radio className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-white">No Live Stream Session Active</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Launch a synchronous session room to begin logging scholar attention telemetry and real-time interaction frequencies.
          </p>
          <button
            onClick={handleStartSession}
            disabled={starting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition shadow-lg shadow-cyan-600/30 active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
            {starting ? 'Starting Session...' : 'Start Live Lecture Session'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              Live Session Active: {activeSession.session_id}
            </span>
            <span className="text-xs text-slate-400">
              Started: {new Date(activeSession.started_at).toLocaleTimeString()}
            </span>
          </div>

          {logStatus && (
            <div className="p-3 bg-slate-950/60 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>{logStatus}</span>
            </div>
          )}

          {/* Telemetry Logger */}
          <form onSubmit={handleLogEngagement} className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-base font-semibold text-white">Log Scholar Attention Telemetry</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Student UUID</label>
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="Paste student UUID..."
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Attention Score ({attentionScore}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={attentionScore}
                  onChange={(e) => setAttentionScore(Number(e.target.value))}
                  className="w-full h-8 accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Interactions (Chat / Polls)</label>
                <input
                  type="number"
                  min="0"
                  value={interactions}
                  onChange={(e) => setInteractions(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={logging}
                className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {logging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                {logging ? 'Logging...' : 'Record Telemetry Point'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
