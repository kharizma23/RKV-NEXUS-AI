'use client';

import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  availableLanguages?: { code: string; label: string; native: string }[];
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  availableLanguages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' }
  ]
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/60">
      <div className="px-2 text-muted-foreground flex items-center gap-1 text-xs">
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-medium">Language:</span>
      </div>
      {availableLanguages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
            selectedLanguage === lang.code
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {lang.native} ({lang.code.toUpperCase()})
        </button>
      ))}
    </div>
  );
}
