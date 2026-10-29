'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Building2, CheckCircle2, RefreshCw, Upload, X } from 'lucide-react';

const toast = {
  success: (msg: string) => console.log('[SUCCESS]', msg),
  error: (msg: string) => console.error('[ERROR]', msg),
};

interface OnboardedData {
  code: string;
  name: string;
  location: string;
  accredited_courses_count: number;
  departments_count: number;
  previous_co_attainment_avg: number;
  recommended_departments: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SmartInstitutionOnboarding({ isOpen, onClose, onSuccess }: Props) {
  const [code, setCode] = useState('BIT-12345');
  const [loading, setLoading] = useState(false);
  const [detectedData, setDetectedData] = useState<OnboardedData | null>(null);

  if (!isOpen) return null;

  const handleAutoDetect = async () => {
    if (!code.trim()) {
      toast.error('Please enter a valid UGC/AICTE Code');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/institutions/auto-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error('Auto-detect failed');
      const data = await res.json();
      setDetectedData(data);
      toast.success('AI Institution metadata auto-detected!');
    } catch (err) {
      toast.error('Failed to auto-detect institution metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOnboard = () => {
    toast.success(`Successfully onboarded: ${detectedData?.name || 'Institution'}`);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex justify-between items-center border-b border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">SMART INSTITUTION ONBOARDING 2.0</h3>
              <p className="text-xs text-slate-300">
                AI Auto-Detect Institution Structure from UGC/AICTE Accreditation Code
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Enter UGC / AICTE Accreditation Code
            </label>
            <div className="flex gap-3">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. BIT-12345 or UGC-AIT-001"
                className="bg-card font-mono"
              />
              <Button onClick={handleAutoDetect} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs shrink-0">
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                AUTO-DETECT
              </Button>
            </div>
          </div>

          {detectedData && (
            <div className="space-y-4 border rounded-xl p-4 bg-card">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Auto-Detected Verification
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-600 rounded font-bold">
                  CODE: {detectedData.code}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground font-semibold">Institution Name:</span>
                  <p className="font-bold text-foreground mt-0.5">{detectedData.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Location:</span>
                  <p className="font-bold text-foreground mt-0.5">{detectedData.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Accredited Courses:</span>
                  <p className="font-bold text-foreground mt-0.5">{detectedData.accredited_courses_count} Courses</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Departments:</span>
                  <p className="font-bold text-foreground mt-0.5">{detectedData.departments_count} Departments</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground">Auto-Discovered Departments:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {detectedData.recommended_departments.map((dept, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-[11px] font-medium bg-muted border rounded-md">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/40 border-t flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          {detectedData && (
            <Button size="sm" onClick={handleConfirmOnboard} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6">
              AUTO-CONFIGURE INSTITUTION
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
