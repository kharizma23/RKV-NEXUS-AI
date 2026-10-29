'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, CheckCircle, XCircle, ArrowRight, Trophy, Zap, AlertCircle } from 'lucide-react';

interface QuestionOption {
  id: string;
  text: string;
  order: number;
}

interface AdaptiveQuestion {
  id: string;
  prompt: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question_type: string;
  marks: number;
  options: QuestionOption[];
}

export function AdaptiveExamView() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<string>('MEDIUM');
  const [currentAbility, setCurrentAbility] = useState<number>(50.0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastFeedback, setLastFeedback] = useState<{ wasCorrect: boolean; abilityChange: number } | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const startExam = async () => {
    setLoading(true);
    setLastFeedback(null);
    setIsCompleted(false);
    try {
      const res = await fetch('/api/v1/adaptive/start', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setSessionId(data.adaptive_exam_id);
        setCurrentDifficulty(data.current_difficulty);
        setCurrentAbility(data.current_ability);
        setQuestionsAnswered(0);
        setCurrentQuestion(data.question);
      }
    } catch (e) {
      console.error('Failed to start adaptive exam', e);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!sessionId || !currentQuestion || !selectedOptionId || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/v1/adaptive/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adaptive_exam_id: sessionId,
          question_id: currentQuestion.id,
          selected_option_id: selectedOptionId
        })
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        const diffChange = data.new_ability - currentAbility;
        setLastFeedback({
          wasCorrect: data.was_correct,
          abilityChange: diffChange
        });

        setCurrentAbility(data.new_ability);
        setCurrentDifficulty(data.current_difficulty);
        setQuestionsAnswered(data.questions_answered);
        setSelectedOptionId(null);

        if (data.is_completed) {
          setIsCompleted(true);
          setFinalScore(data.final_score);
          setCurrentQuestion(null);
        } else {
          setCurrentQuestion(data.next_question);
        }
      }
    } catch (e) {
      console.error('Answer submission error', e);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">🟢 Level: Foundational (EASY)</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 border border-amber-500/30">🟡 Level: Intermediate (MEDIUM)</span>;
      case 'HARD':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-600 border border-rose-500/30">🔴 Level: Advanced (HARD)</span>;
    }
  };

  return (
    <Card className="border shadow-md">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-950/40 via-background to-purple-950/40 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" />
              Dynamic Adaptive Assessment Engine
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Difficulty real-time calibrates based on your cognitive ability score and question precision.
            </p>
          </div>
          {sessionId && !isCompleted && getDifficultyBadge(currentDifficulty)}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {!sessionId && !isCompleted && (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Begin Personalized Adaptive Exam</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                The exam starts at Medium difficulty. Answer correctly to unlock advanced Bloom-taxonomy problems, or receive reinforcing questions on missed concepts.
              </p>
            </div>
            <Button onClick={startExam} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6">
              <Sparkles className="w-4 h-4 mr-2" /> Start Diagnostic Adaptive Flow
            </Button>
          </div>
        )}

        {sessionId && !isCompleted && currentQuestion && (
          <div className="space-y-6">
            {/* Ability & Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">Progress: Question {questionsAnswered + 1} of 10</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  Estimated Ability Score: {currentAbility.toFixed(1)} / 100
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${((questionsAnswered) / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Previous Answer Alert */}
            {lastFeedback && (
              <div
                className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                  lastFeedback.wasCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                }`}
              >
                {lastFeedback.wasCorrect ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {lastFeedback.wasCorrect
                    ? `Correct! Cognitive Ability increased by +${lastFeedback.abilityChange.toFixed(1)}. Difficulty adjusted.`
                    : `Incorrect. Ability adjusted by ${lastFeedback.abilityChange.toFixed(1)}. Lowering difficulty to reinforce foundation.`}
                </span>
              </div>
            )}

            {/* Question Prompt */}
            <div className="p-4 rounded-xl border bg-muted/10 space-y-3">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="font-bold uppercase tracking-wider">Question #{questionsAnswered + 1}</span>
                <span>Worth: {currentQuestion.marks} Marks</span>
              </div>
              <p className="text-sm font-bold text-foreground leading-relaxed">
                {currentQuestion.prompt}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQuestion.options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 text-xs ${
                    selectedOptionId === opt.id
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 font-bold'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedOptionId === opt.id
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {selectedOptionId === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-foreground">{opt.text}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <Button
                onClick={submitAnswer}
                disabled={!selectedOptionId || loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Submit & Next Question <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">Adaptive Exam Completed!</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your performance has been evaluated and Course Outcome ability score updated.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
              <div className="p-3 rounded-lg border bg-muted/20">
                <div className="text-2xl font-black text-primary">{finalScore?.toFixed(1)}%</div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase">Exam Score</div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20">
                <div className="text-2xl font-black text-indigo-600">{currentAbility.toFixed(1)}</div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase">Final Ability Score</div>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={startExam} variant="outline" className="text-xs font-bold">
                Retake Another Diagnostic Test
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
