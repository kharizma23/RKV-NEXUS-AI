'use client';

import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecalculateButtonProps {
  onRecalculate: () => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

export function RecalculateButton({ onRecalculate, loading, disabled }: RecalculateButtonProps) {
  return (
    <Button
      id="recalculate-360-button"
      size="sm"
      onClick={onRecalculate}
      disabled={loading || disabled}
      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Recalculating...</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate 360°</span>
        </>
      )}
    </Button>
  );
}
