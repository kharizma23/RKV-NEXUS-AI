'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Heart, Sparkles, Moon, AlertTriangle, Smile, Meh, Frown, CheckCircle } from 'lucide-react';

interface WellnessCheckinProps {
  onSuccess?: () => void;
  onCheckinSuccess?: () => void;
}

export function WellnessCheckin({ onSuccess, onCheckinSuccess }: WellnessCheckinProps) {
  const [moodScore, setMoodScore] = useState<number>(7);
  const [stressLevel, setStressLevel] = useState<number>(4);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [notes, setNotes] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/wellness/checkin', {
        method: 'POST',
        body: JSON.stringify({
          mood_score: moodScore,
          stress_level: stressLevel,
          sleep_hours: parseFloat(sleepHours.toString()),
          notes: notes.trim() || undefined,
          is_anonymous: isAnonymous
        })
      });
      setResult(res.data);
      if (onSuccess) onSuccess();
      if (onCheckinSuccess) onCheckinSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit wellness check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
          <Heart className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Daily Mental Health & Wellness Pulse</h2>
          <p className="text-xs text-muted-foreground">
            Confidential check-in to balance academic load, prevent burnout, and receive AI wellness tips
          </p>
        </div>
      </div>

      {result ? (
        <div className="p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-4">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span>Wellness Check-In Logged! Composite Score: {result.wellness_score}/100</span>
          </div>
          <p className="text-xs text-foreground font-medium">{result.insights}</p>
          {result.alert && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700 dark:text-amber-300 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Proactive Wellness Alert ({result.alert.severity}):</span>
                <p className="mt-0.5">{result.alert.recommended_action}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setResult(null)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Submit Another Check-in
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Mood Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground flex items-center space-x-1.5">
                <Smile className="w-4 h-4 text-amber-500" />
                <span>Overall Mood Today (1 - 10):</span>
              </label>
              <span className="text-xs font-black px-2 py-0.5 rounded bg-muted text-indigo-600">{moodScore}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={moodScore}
              onChange={(e) => setMoodScore(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
              <span>1 - Exhausted / Low</span>
              <span>5 - Neutral</span>
              <span>10 - Vibrant / Happy</span>
            </div>
          </div>

          {/* Stress Level */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Academic Stress Level (1 - 10):</span>
              </label>
              <span className="text-xs font-black px-2 py-0.5 rounded bg-muted text-rose-600">{stressLevel}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
              <span>1 - Calm & Controlled</span>
              <span>5 - Moderate Pressure</span>
              <span>10 - Critical Overload</span>
            </div>
          </div>

          {/* Sleep Hours */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground flex items-center space-x-1.5">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Sleep Duration (Hours):</span>
              </label>
              <span className="text-xs font-black px-2 py-0.5 rounded bg-muted text-indigo-600">{sleepHours} hrs</span>
            </div>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-background border rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
              required
            />
          </div>

          {/* Reflection Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Self-Reflection / Journal Notes (Optional):</label>
            <textarea
              rows={2}
              placeholder="What factors contributed to your mood or stress today? Any exam anxiety or deadlines?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anon"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="anon" className="text-xs text-muted-foreground font-medium cursor-pointer">
              Submit anonymously for campus-wide aggregate wellbeing statistics
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? 'Recording Pulse...' : 'Log Daily Wellness Check-In'}</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default WellnessCheckin;
