'use client';

import React, { useState, useEffect } from 'react';
import { Users, Crown, Search, Send, CheckCircle2, AlertCircle, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function GroupExamView({ groupExamId = 'default-group-exam' }: { groupExamId?: string }) {
  const [role, setRole] = useState<'leader' | 'researcher' | 'presenter' | 'contributor'>('leader');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [questionId, setQuestionId] = useState('b8b3017a-592d-4592-94ea-e137f6a70e70');
  const [answerText, setAnswerText] = useState('');
  const [joining, setJoining] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const joinGroup = async () => {
    setJoining(true);
    setStatusMsg(null);
    try {
      const res = await apiClient<any>(`/group-exams/${groupExamId}/join`, {
        method: 'POST',
        body: JSON.stringify({ role })
      });
      if (res?.data?.group_id) {
        setGroupId(res.data.group_id);
        setStatusMsg(`Joined squad as ${role.toUpperCase()}!`);
        fetchResults();
      }
    } catch (e: any) {
      setStatusMsg(`Join error: ${e?.message || 'Server error'}`);
    } finally {
      setJoining(false);
    }
  };

  const submitAnswer = async () => {
    if (!groupId || !answerText.trim()) return;
    setSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await apiClient<any>(`/group-exams/${groupId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          question_id: questionId,
          answer: answerText.trim()
        })
      });
      if (res?.data?.id) {
        setSubmittedAnswers((prev) => [
          {
            id: res.data.id,
            question_id: questionId,
            answer: answerText,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
        setAnswerText('');
        setStatusMsg('Collaborative submission recorded for squad review.');
        fetchResults();
      }
    } catch (e: any) {
      setStatusMsg(`Submit error: ${e?.message || 'Submission failed'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await apiClient<any>(`/group-exams/${groupExamId}/results`);
      if (res?.data?.groups?.length > 0) {
        const myGroup = res.data.groups.find((g: any) => g.group_id === groupId) || res.data.groups[0];
        setTeamMembers(myGroup.members || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Squad Synchronous Examination Portal
          </h1>
          <p className="text-xs text-muted-foreground">
            Collaborate synchronously with your assigned academic squad. Team and individual scores are weighted based on verified role contributions.
          </p>
        </div>
        {groupId && (
          <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1.5 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" /> Group ID: {groupId.slice(0, 8)}...
          </span>
        )}
      </div>

      {statusMsg && (
        <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {statusMsg}
        </div>
      )}

      {/* Join Step if not yet in a group */}
      {!groupId ? (
        <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-sm max-w-lg mx-auto text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Select Your Squad Role</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Choose your primary responsibility for this collaborative challenge.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            {[
              { id: 'leader', label: 'Squad Leader', desc: 'Synthesizes final answers & directs strategy' },
              { id: 'researcher', label: 'Researcher', desc: 'Fact-checks edge cases & explores references' },
              { id: 'presenter', label: 'Presenter', desc: 'Structures clean proof write-ups & diagrams' },
              { id: 'contributor', label: 'Peer Reviewer', desc: 'Validates computational steps & complexity' }
            ].map((r) => (
              <div
                key={r.id}
                onClick={() => setRole(r.id as any)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                  role === r.id
                    ? 'border-primary bg-primary/5 shadow-sm font-semibold'
                    : 'border-border/60 hover:bg-muted/40'
                }`}
              >
                <div className="font-bold text-foreground capitalize mb-0.5">{r.label}</div>
                <div className="text-[11px] text-muted-foreground">{r.desc}</div>
              </div>
            ))}
          </div>

          <button
            onClick={joinGroup}
            disabled={joining}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
          >
            {joining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            Confirm Squad Role & Enter Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Squad Roster */}
          <div className="lg:col-span-4 bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
                Active Squad Roster
              </h3>
              <span className="text-[11px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>

            <div className="space-y-2">
              {teamMembers.length === 0 ? (
                <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
                  You are the first member in this squad. Waiting for peers to join...
                </div>
              ) : (
                teamMembers.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border/50 bg-background flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-foreground">{m.name || 'Fellow Scholar'}</div>
                      <div className="text-[11px] text-muted-foreground uppercase">{m.role}</div>
                    </div>
                    {m.role === 'leader' && <Crown className="w-4 h-4 text-amber-500" />}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Collaborative Question Answer Area */}
          <div className="lg:col-span-8 bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                Group Challenge Question
              </span>
              <h3 className="text-sm font-bold text-foreground mt-2">
                Problem 4: Architect an optimal Byzantine Fault Tolerant distributed state machine for 100k TPS.
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Collaborate to synthesize consensus quorum sizes, network partitions handling, and recovery proof.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Squad Collaborative Synthesis Draft
              </label>
              <textarea
                rows={5}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Draft your solution here. All squad members' contributions will be logged and analyzed for individual + group credit..."
                className="w-full p-3 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Author Role: <span className="font-bold text-foreground capitalize">{role}</span>
              </span>
              <button
                onClick={submitAnswer}
                disabled={submitting || !answerText.trim()}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Submit Squad Contribution
              </button>
            </div>

            {submittedAnswers.length > 0 && (
              <div className="border-t border-border/40 pt-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Recent Squad Submissions ({submittedAnswers.length})
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {submittedAnswers.map((sub, i) => (
                    <div key={i} className="p-3 bg-muted/20 border border-border/40 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold text-primary">Logged Submission #{i + 1}</span>
                        <span>{sub.timestamp}</span>
                      </div>
                      <p className="text-foreground">{sub.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
