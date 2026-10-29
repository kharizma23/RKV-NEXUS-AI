'use client';

import React, { useState } from 'react';
import { Bot, User as UserIcon, Copy, Check, Volume2, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language?: string;
  created_at: string;
  is_escalated?: boolean;
}

interface MessageBubbleProps {
  message: ChatMessageItem;
  onEscalate?: (content: string) => void;
}

export function MessageBubble({ message, onEscalate }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    if (message.language === 'ta') {
      utterance.lang = 'ta-IN';
    } else if (message.language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  // Simple Markdown parser for bold, headers, bullet points, and code blocks
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          // Code block delimiter
          if (line.startsWith('```')) {
            return (
              <div key={idx} className="my-1 border-t border-border/50 opacity-40" />
            );
          }
          // Markdown Header ###
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-base text-indigo-400 dark:text-indigo-300 mt-2.5 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {line.replace('### ', '')}
              </h4>
            );
          }
          // Markdown Header ####
          if (line.startsWith('#### ')) {
            return (
              <h5 key={idx} className="font-semibold text-sm text-foreground mt-2 mb-0.5">
                {line.replace('#### ', '')}
              </h5>
            );
          }
          // Bullet list
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const bulletText = line.trim().replace(/^[-*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-foreground/90">
                <span className="text-indigo-500 font-bold leading-5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(bulletText) }} />
              </div>
            );
          }
          // Numbered list
          if (/^\d+\.\s+/.test(line.trim())) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-foreground/90">
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.trim()) }} />
              </div>
            );
          }
          // Table row or code line
          if (line.startsWith('|') || line.startsWith('┌') || line.startsWith('│') || line.startsWith('├') || line.startsWith('└')) {
            return (
              <pre key={idx} className="font-mono text-xs bg-muted/60 p-2 rounded-xl border border-border text-foreground overflow-x-auto whitespace-pre">
                {line}
              </pre>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
          );
        })}
      </div>
    );
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-bold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-xs font-mono border border-indigo-500/20">$1</code>')
      .replace(/\*(.*?)\*/g, '<em class="text-muted-foreground italic">$1</em>');
  };

  const timeFormatted = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex items-start gap-3 w-full my-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-400/30">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-medium text-slate-400">
            {isUser ? 'You' : 'RKV AI Academic Tutor'}
          </span>
          {message.language && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {message.language}
            </span>
          )}
          <span className="text-[10px] text-slate-500">{timeFormatted}</span>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-sm shadow-sm transition-all ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-xs shadow-indigo-500/20 shadow-md'
              : 'bg-white dark:bg-slate-800 text-foreground border border-border/70 backdrop-blur-md rounded-tl-xs'
          }`}
        >
          {renderFormattedContent(message.content)}

          {!isUser && (
            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-1.5 py-0.5 rounded hover:bg-muted"
                  title="Copy explanation"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleSpeak}
                  className={`flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-1.5 py-0.5 rounded hover:bg-muted ${
                    isPlaying ? 'text-amber-500 font-medium' : ''
                  }`}
                  title="Listen (Text to Speech)"
                >
                  {isPlaying ? <VolumeX className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{isPlaying ? 'Stop' : 'Listen'}</span>
                </button>
              </div>

              {onEscalate && (
                <button
                  onClick={() => onEscalate(message.content)}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors px-1.5 py-0.5 rounded hover:bg-rose-950/30"
                  title="Forward question to faculty"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Ask Faculty</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
          <UserIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
