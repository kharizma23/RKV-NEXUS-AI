'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  X,
  Sparkles,
  Layers,
  Scale,
  Check,
  ImageIcon,
  Type
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FlaggedRecord {
  id: string;
  student_a: string;
  student_b: string;
  student_a_name: string;
  student_a_roll: string;
  student_b_name: string;
  student_b_roll: string;
  exam_name: string;
  question_snippet: string;
  similarity_score: number;
  answer_a_text: string;
  answer_b_text: string;
  answer_a_image?: string;
  answer_b_image?: string;
  matching_phrases?: string[];
  status: string;
}

export function FlaggedSubmissions() {
  const [records, setRecords] = useState<FlaggedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<FlaggedRecord | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'image'>('text');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchFlagged = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/faculty/plagiarism/flagged');
      if (res.ok) {
        const json = await res.json();
        setRecords(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching flagged plagiarism records', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  const handleAction = async (recordId: string, action: 'CONFIRMED_PLAGIARISM' | 'CLEARED') => {
    setProcessingId(recordId);
    try {
      const res = await fetch(`/api/v1/faculty/plagiarism/${recordId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        setRecords(prev => prev.filter(r => r.id !== recordId));
        setSelectedRecord(null);
        setToastMessage(
          action === 'CONFIRMED_PLAGIARISM'
            ? 'Flagged submission confirmed as Plagiarism. Dispatched to Academic Disciplinary Committee.'
            : 'Submission pair marked as False Positive and cleared.'
        );
        setTimeout(() => setToastMessage(null), 4500);
      } else {
        alert('Could not update status. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting action', err);
      alert('Error communicating with server.');
    } finally {
      setProcessingId(null);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score > 90) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          {score.toFixed(1)}% Critical
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        {score.toFixed(1)}% High
      </span>
    );
  };

  const highlightMatching = (text: string, phrases: string[] = []) => {
    if (!phrases || phrases.length === 0) return text;
    let parts: React.ReactNode[] = [text];

    phrases.forEach(phrase => {
      const newParts: React.ReactNode[] = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          const index = part.toLowerCase().indexOf(phrase.toLowerCase());
          if (index !== -1) {
            const before = part.slice(0, index);
            const match = part.slice(index, index + phrase.length);
            const after = part.slice(index + phrase.length);
            if (before) newParts.push(before);
            newParts.push(
              <mark
                key={Math.random()}
                className="bg-amber-200/80 dark:bg-amber-500/30 text-amber-950 dark:text-amber-100 px-1 py-0.5 rounded font-semibold"
              >
                {match}
              </mark>
            );
            if (after) newParts.push(after);
          } else {
            newParts.push(part);
          }
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return parts;
  };

  const filtered = records.filter(
    r =>
      r.student_a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student_b.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.exam_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.question_snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-xs shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            {toastMessage}
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-200/50">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-foreground tracking-tight">
              Plagiarism &amp; Semantic Similarity Review
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Detect verbatim paraphrasing and pairwise cross-student copied scripts using cosine vector embeddings.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchFlagged}
          disabled={loading}
          className="gap-2 text-xs font-semibold rounded-xl shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Flagged Queue
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/70 shadow-sm bg-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Flagged Student Pairs
          </p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{records.length}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Similarity &gt; 80% threshold</p>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm bg-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Highest Detected Match
          </p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">
            {records.length > 0 ? `${Math.max(...records.map(r => r.similarity_score))}%` : '0%'}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Cosine distance &lt; 0.05</p>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm bg-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Embedding Verification Model
          </p>
          <h3 className="text-sm font-black text-foreground mt-1">pgvector Cosine Sim</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Active 768-dim Sentence Transformers
          </p>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden bg-card">
        <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by student name, roll number, or exam..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-xl h-9 bg-background"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            Showing <strong className="text-foreground">{filtered.length}</strong> flagged comparison pairs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Student A</th>
                <th className="py-3.5 px-4">Student B</th>
                <th className="py-3.5 px-4">Exam / Question</th>
                <th className="py-3.5 px-4">Similarity Score</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading semantic plagiarism telemetry...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-foreground text-sm">No Plagiarism Flags Active</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      All student submissions satisfy integrity and citation standards.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    {/* Student A */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {item.student_a_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-foreground font-bold text-xs leading-none">
                            {item.student_a_name}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-mono mt-0.5 inline-block">
                            {item.student_a_roll}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Student B */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {item.student_b_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-foreground font-bold text-xs leading-none">
                            {item.student_b_name}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-mono mt-0.5 inline-block">
                            {item.student_b_roll}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Exam / Question Snippet */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground mb-1">
                        {item.exam_name}
                      </span>
                      <p className="text-muted-foreground line-clamp-2 leading-relaxed" title={item.question_snippet}>
                        {item.question_snippet}
                      </p>
                    </td>

                    {/* Similarity Score */}
                    <td className="py-3.5 px-4">
                      {getScoreBadge(item.similarity_score)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedRecord(item)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs h-8 px-3.5 gap-1.5 shadow-sm font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review Evidence
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Evidence Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-5xl my-8 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-border/70 flex items-center justify-between bg-muted/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    Pairwise Semantic Plagiarism Review
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      {selectedRecord.similarity_score}% Match
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Exam: <strong className="text-foreground">{selectedRecord.exam_name}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-muted p-1 rounded-xl flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('text')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      viewMode === 'text'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" /> Text Compare
                  </button>
                  <button
                    onClick={() => setViewMode('image')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      viewMode === 'image'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Scan Images
                  </button>
                </div>

                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Question Bar */}
            <div className="px-6 py-3 bg-muted/40 border-b border-border/60 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                Evaluated Question:
              </span>
              <p className="font-semibold text-foreground">
                {selectedRecord.question_snippet}
              </p>
            </div>

            {/* Side-by-Side Comparison Area */}
            <div className="p-6 overflow-y-auto space-y-4">
              {viewMode === 'text' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Student A Text */}
                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
                          A
                        </div>
                        <span className="font-bold text-foreground text-xs">
                          {selectedRecord.student_a_name} ({selectedRecord.student_a_roll})
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        Candidate A
                      </span>
                    </div>

                    <div className="p-3 bg-muted/30 rounded-xl font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto border border-border/40">
                      {highlightMatching(selectedRecord.answer_a_text, selectedRecord.matching_phrases)}
                    </div>
                  </div>

                  {/* Student B Text */}
                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-txs flex items-center justify-center">
                          B
                        </div>
                        <span className="font-bold text-foreground text-xs">
                          {selectedRecord.student_b_name} ({selectedRecord.student_b_roll})
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        Candidate B
                      </span>
                    </div>

                    <div className="p-3 bg-muted/30 rounded-xl font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto border border-border/40">
                      {highlightMatching(selectedRecord.answer_b_text, selectedRecord.matching_phrases)}
                    </div>
                  </div>
                </div>
              ) : (
                /* Side-by-Side Images */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="font-bold text-foreground text-xs">
                        {selectedRecord.student_a_name} — Original Bluebook Scan
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-border/60 bg-muted/40 h-72 flex items-center justify-center">
                      {selectedRecord.answer_a_image ? (
                        <img
                          src={selectedRecord.answer_a_image}
                          alt="Student A Paper Scan"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No image available</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="font-bold text-foreground text-xs">
                        {selectedRecord.student_b_name} — Original Bluebook Scan
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-border/60 bg-muted/40 h-72 flex items-center justify-center">
                      {selectedRecord.answer_b_image ? (
                        <img
                          src={selectedRecord.answer_b_image}
                          alt="Student B Paper Scan"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No image available</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Matching Phrases Summary */}
              {selectedRecord.matching_phrases && selectedRecord.matching_phrases.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> High-Confidence Overlapping Phrases Detected
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRecord.matching_phrases.map((phrase, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-amber-200/70 text-amber-950 dark:bg-amber-800/50 dark:text-amber-200 border border-amber-300/60"
                      >
                        &ldquo;{phrase}&rdquo;
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/30 shrink-0">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                Actions are logged with faculty digital signature and time-stamped.
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(selectedRecord.id, 'CLEARED')}
                  disabled={processingId === selectedRecord.id}
                  className="rounded-xl text-xs font-bold border-border text-foreground hover:bg-muted"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  Dismiss (False Positive)
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleAction(selectedRecord.id, 'CONFIRMED_PLAGIARISM')}
                  disabled={processingId === selectedRecord.id}
                  className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  {processingId === selectedRecord.id ? 'Updating DB...' : 'Flag as Plagiarism'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
