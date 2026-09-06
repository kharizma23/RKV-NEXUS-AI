'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  User,
  BookOpen,
  Award,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CounterfactualCard {
  id: string;
  student_id: string;
  student_name: string;
  exam_name: string;
  question_text: string;
  student_answer: string;
  score_awarded: number;
  max_marks: number;
  lost_marks: number;
  ai_feedback: string;
  counterfactual_feedback: string;
  status: string;
}

export function CounterfactualEngineDashboard() {
  const [cards, setCards] = useState<CounterfactualCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const fetchFeed = async (query = '') => {
    setLoading(true);
    try {
      const url = new URL('http://127.0.0.1:8000/api/v1/evaluation/counterfactual-feed');
      if (query) {
        url.searchParams.append('query', query);
      }
      const res = await fetch(url.toString(), {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data.feed || []);
      }
    } catch (err) {
      console.error('Failed to load counterfactual feed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFeed(searchQuery);
  };

  const handleSendToStudent = async (card: CounterfactualCard) => {
    setSendingId(card.id);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/notifications/send-feedback/${card.student_id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: `AI Feedback: ${card.exam_name}`,
          message: `${card.ai_feedback}`,
          counterfactual_feedback: card.counterfactual_feedback,
          question_text: card.question_text,
          answer_id: card.id
        })
      });

      if (res.ok) {
        setSentMap(prev => ({ ...prev, [card.id]: true }));
        setNotificationBanner(`Counterfactual guidance successfully dispatched to ${card.student_name}'s student portal!`);
        setTimeout(() => setNotificationBanner(null), 4500);
      } else {
        alert('Could not dispatch notification. Verify server connection.');
      }
    } catch (e) {
      console.error('Error dispatching feedback', e);
      alert('Error sending notification.');
    } finally {
      setSendingId(null);
    }
  };

  const filteredCards = cards.filter(
    c =>
      c.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.exam_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.question_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notificationBanner && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-sm shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            {notificationBanner}
          </div>
          <button onClick={() => setNotificationBanner(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Counterfactual AI Analysis
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Examine actionable &quot;What-If&quot; learning feedback synthesized by LLM rubrics to bridge student concept gaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchFeed(searchQuery)}
            disabled={loading}
            className="gap-2 text-xs font-semibold rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="rounded-2xl border-border/70 shadow-sm bg-card p-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Student Name, Subject, or Exam..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 text-xs rounded-xl h-10 bg-muted/30 border-border/70"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs h-10 px-5 gap-1.5 shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            Filter
          </Button>
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                fetchFeed('');
              }}
              className="text-xs rounded-xl h-10 text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </form>
      </Card>

      {/* Feed Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground bg-card border border-border/60 rounded-3xl">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-500" />
            <p className="text-sm font-semibold text-foreground">Synthesizing Counterfactual Guidance Feed...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground bg-card border border-border/60 rounded-3xl">
            <Sparkles className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">No counterfactual evaluations found</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Try adjusting your search criteria or running new student assessments.
            </p>
          </div>
        ) : (
          filteredCards.map(card => {
            const isSent = !!sentMap[card.id];
            const isSending = sendingId === card.id;

            return (
              <Card
                key={card.id}
                className="rounded-3xl border-border/70 shadow-sm hover:shadow-md transition-shadow bg-card overflow-hidden"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Card Header: Student & Exam */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                        {card.student_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground text-sm">
                            {card.student_name}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-muted text-muted-foreground border border-border/60">
                            {card.exam_name}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Scored: <strong className="text-foreground">{card.score_awarded}</strong> / {card.max_marks} marks
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300">
                        -{card.lost_marks} Marks Headroom
                      </span>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5 mb-1">
                      <HelpCircle className="w-3.5 h-3.5 text-primary" /> Question Evaluated
                    </span>
                    <p className="text-xs font-semibold text-foreground leading-relaxed">
                      {card.question_text}
                    </p>
                  </div>

                  {/* Box 1: AI Feedback (Lost Marks) */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> AI Feedback Diagnosis
                    </span>
                    <p className="text-xs text-amber-900 dark:text-amber-100 font-medium leading-relaxed">
                      {card.ai_feedback}
                    </p>
                  </div>

                  {/* Box 2: Counterfactual Box (Highlighted in Green) */}
                  <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-400/80 dark:border-emerald-600 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-black text-emerald-800 dark:text-emerald-300 tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Counterfactual Guidance (What-If Analysis)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100">
                        High Pedagogical Lift
                      </span>
                    </div>
                    <p className="text-xs text-emerald-950 dark:text-emerald-100 font-semibold leading-relaxed">
                      &ldquo;{card.counterfactual_feedback}&rdquo;
                    </p>
                  </div>

                  {/* Footer Action Button */}
                  <div className="pt-2 flex items-center justify-between border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      Provides targeted recovery insights to student
                    </span>

                    <Button
                      size="sm"
                      onClick={() => handleSendToStudent(card)}
                      disabled={isSent || isSending}
                      className={`rounded-xl text-xs px-4 h-9 gap-1.5 font-bold transition-all shadow-sm ${
                        isSent
                          ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Sent to Student Dashboard ✓
                        </>
                      ) : (
                        <>
                          <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                          {isSending ? 'Dispatching...' : 'Send to Student Dashboard'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
