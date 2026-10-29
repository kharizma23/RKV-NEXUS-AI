'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, HelpCircle, Award, Sparkles, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface MCQ {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  co_number: string;
}

export function MCQPractice({ lectureId = 'default-lecture' }: { lectureId?: string }) {
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const fetchMcqs = async () => {
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setSelectedAnswers({});
    try {
      const data = await apiClient<MCQ[]>(`/student/lectures/${lectureId}/mcqs`);
      setMcqs(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch AI-generated lecture MCQs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMcqs();
  }, [lectureId]);

  const handleSelect = (qId: string, option: string) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const calculateScore = () => {
    let correct = 0;
    mcqs.forEach(m => {
      if (selectedAnswers[m.id] === m.correct_answer) correct++;
    });
    return correct;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-emerald-500/20 shadow-xl">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Formative Assessment Checkpoint
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI-Generated Lecture MCQs</h1>
          <p className="text-sm text-slate-300">
            Self-assessment questions aligned directly with Course Outcome attainment.
          </p>
        </div>
        <button
          onClick={fetchMcqs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Reset Quiz
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-slate-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : mcqs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <p className="text-sm text-slate-400">No MCQs generated for this lecture yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {mcqs.map((mcq, idx) => {
            const chosen = selectedAnswers[mcq.id];
            const isCorrect = chosen === mcq.correct_answer;

            return (
              <div key={mcq.id} className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Question {idx + 1} • {mcq.co_number}
                  </span>
                  {submitted && (
                    <span className="text-xs font-bold flex items-center gap-1">
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-white">{mcq.question_text}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mcq.options.map((opt, oIdx) => {
                    const isSelected = chosen === opt;
                    let style = 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-indigo-500/50';

                    if (submitted) {
                      if (opt === mcq.correct_answer) {
                        style = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        style = 'bg-rose-950/40 border-rose-500 text-rose-200';
                      }
                    } else if (isSelected) {
                      style = 'bg-indigo-950/40 border-indigo-500 text-indigo-200 font-semibold';
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelect(mcq.id, opt)}
                        className={`p-3.5 rounded-xl border text-left text-sm transition flex items-center justify-between ${style}`}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              Submit Responses & Grade
            </button>
          ) : (
            <div className="p-5 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Assessment Result</span>
                <p className="text-xl font-bold text-white mt-0.5">
                  Score: {calculateScore()} / {mcqs.length} ({Math.round((calculateScore() / mcqs.length) * 100)}%)
                </p>
              </div>
              <button
                onClick={fetchMcqs}
                className="px-4 py-2 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-900/40 rounded-xl transition"
              >
                Retake Assessment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
