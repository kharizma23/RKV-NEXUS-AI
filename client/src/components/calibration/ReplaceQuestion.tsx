'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReplaceQuestionProps {
  questionId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function ReplaceQuestion({ questionId, onSuccess, onClose }: ReplaceQuestionProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReplace = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>(`/questions/${questionId}/replace`, {
        method: 'POST'
      });
      setResult(res.data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to replace question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-card border rounded-2xl shadow-lg space-y-4 max-w-lg mx-auto">
      <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
        <Sparkles className="w-5 h-5" />
        <span>Gemini 3.6 Flash Question Auto-Calibration</span>
      </div>

      {result ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Question Successfully Replaced!</span>
          </div>
          <p className="text-xs font-semibold text-foreground">&quot;{result.new_question_text}&quot;</p>
          <div className="flex items-center space-x-4 text-[11px] text-muted-foreground font-mono">
            <span>Calibrated Difficulty: {result.calibrated_difficulty}</span>
            <span>Discrimination D: +{result.calibrated_discrimination}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Gemini AI will re-formulate the question stem, correct distractor probabilities, and target an optimal item discrimination index (D &gt; 0.40).
          </p>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-xs font-semibold text-foreground transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleReplace}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{loading ? 'Synthesizing with Gemini AI...' : 'Generate Replacement'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
