'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Sparkles, Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { DifficultyChart } from './DifficultyChart';
import { FlaggedQuestions } from './FlaggedQuestions';
import { ReplaceQuestion } from './ReplaceQuestion';

export function CalibrationDashboard() {
  const [calibrations, setCalibrations] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [calibrating, setCalibrating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, fRes] = await Promise.all([
        apiClient<any>('/questions/calibration'),
        apiClient<any>('/questions/flagged')
      ]);
      setCalibrations(cRes.data || []);
      setFlags(fRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runBatchCalibration = async () => {
    setCalibrating(true);
    try {
      await apiClient('/questions/calibrate', {
        method: 'POST',
        body: JSON.stringify({ batch_id: 'BATCH-2026-AUTONOMOUS' })
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setCalibrating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">AI Question Difficulty Calibration Hub</h1>
          <p className="text-xs text-muted-foreground">
            Item Response Theory (IRT) psychometric analytics across examination student cohorts
          </p>
        </div>
        <button
          onClick={runBatchCalibration}
          disabled={calibrating}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-2 shadow-sm"
        >
          {calibrating ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{calibrating ? 'Re-calculating Psychometrics...' : 'Run Cohort Batch Calibration'}</span>
        </button>
      </div>

      {selectedQuestionId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <ReplaceQuestion
            questionId={selectedQuestionId}
            onClose={() => setSelectedQuestionId(null)}
            onSuccess={() => {
              loadData();
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
          Computing item difficulty and discrimination indices...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DifficultyChart calibrations={calibrations} />
            <FlaggedQuestions
              flags={flags}
              onReplaceClick={(qid) => setSelectedQuestionId(qid)}
            />
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Calibrated Question Bank Registry</h3>
              <span className="text-xs font-mono text-muted-foreground">{calibrations.length} Items Indexed</span>
            </div>

            <div className="divide-y text-xs">
              {calibrations.map((item) => (
                <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 max-w-xl">
                    <p className="font-bold text-foreground truncate">&quot;{item.question_text}&quot;</p>
                    <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-indigo-500">{item.difficulty_level}</span>
                      <span>•</span>
                      <span>Sample Size: {item.sample_size} students</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Difficulty (P)</span>
                      <span className="font-black text-foreground">{item.difficulty_index}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Discrimination (D)</span>
                      <span className={`font-black ${item.discrimination_index < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {item.discrimination_index > 0 ? `+${item.discrimination_index}` : item.discrimination_index}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalibrationDashboard;
