'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bot, X, Sparkles, MessageSquare, Maximize2 } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // If already on the dedicated full-page AI tutor page, don't show the duplicate floating popup
  if (pathname === '/student/ai-tutor') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Window Popup */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[420px] md:w-[460px] h-[640px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden border border-slate-800 bg-slate-950 animate-in slide-in-from-bottom-5 duration-300">
          <ChatWindow
            isFullPage={false}
            onClose={() => setIsOpen(false)}
            onMaximize={() => {
              setIsOpen(false);
              router.push('/student/ai-tutor');
            }}
          />
        </div>
      )}

      {/* Floating Launcher Button */}
      <div className="relative group">
        {!isOpen && (
          <div className="absolute -top-10 right-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white shadow-xl flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask AI Academic Tutor</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle AI Academic Tutor"
          className={`relative p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center active:scale-95 ${
            isOpen
              ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white ring-4 ring-indigo-500/20 shadow-indigo-600/30 hover:scale-105'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-slate-200" />
          ) : (
            <>
              <Bot className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900" />
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
