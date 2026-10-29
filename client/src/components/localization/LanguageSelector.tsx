'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' }
];

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rkv_lang_pref');
    if (saved && ['en', 'ta', 'hi'].includes(saved)) {
      setCurrentLang(saved);
    }
  }, []);

  const handleSelectLang = async (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem('rkv_lang_pref', langCode);
    setIsOpen(false);

    try {
      await fetch('/api/v1/user/language', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: langCode })
      });
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('language_changed', { detail: { lang: langCode } }));
    } catch (e) {
      console.error('Failed to save language preference', e);
    }
  };

  const selected = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-muted/50 text-xs font-semibold text-foreground transition-colors"
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span>{selected.flag} {selected.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-background border border-border rounded-xl shadow-lg z-50 p-1 divide-y text-xs">
            <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">
              Select Language
            </div>
            <div className="pt-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLang(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-muted/60 transition-colors text-left font-medium ${
                    currentLang === lang.code ? 'text-primary font-bold bg-primary/10' : 'text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                  {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
