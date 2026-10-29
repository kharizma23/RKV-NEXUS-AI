'use client';

import React from 'react';
import { Languages } from 'lucide-react';

export type SupportedLanguage = 'en' | 'ta' | 'hi';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const languages: { code: SupportedLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'EN' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
      <div className="flex items-center gap-1 px-1.5 text-slate-400">
        <Languages className="w-3.5 h-3.5 text-indigo-400" />
      </div>
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => onLanguageChange(l.code)}
          className={`px-2 py-1 rounded-lg font-medium transition-all text-[11px] ${
            currentLanguage === l.code
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
          title={`${l.label} (${l.native})`}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
}
