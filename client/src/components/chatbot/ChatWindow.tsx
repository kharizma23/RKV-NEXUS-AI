'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Bot, Sparkles, RefreshCw, AlertCircle, ArrowUpRight,
  ShieldAlert, BookOpen, Target, Calendar, Check
} from 'lucide-react';
import { MessageBubble, ChatMessageItem } from './MessageBubble';
import { SuggestedPrompts } from './SuggestedPrompts';
import { LanguageSelector, SupportedLanguage } from './LanguageSelector';
import { VoiceInput } from './VoiceInput';
import { EscalationModal } from './EscalationModal';
import { Button } from '@/components/ui/button';

interface ChatWindowProps {
  isFullPage?: boolean;
  onClose?: () => void;
  onMaximize?: () => void;
}

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('antigravity_token') ||
      localStorage.getItem('token') ||
      '';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const userStr = localStorage.getItem('antigravity_auth_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) headers['X-User-Email'] = u.email;
        if (u.role || (u.roles && u.roles[0])) headers['X-Demo-Role'] = String(u.role || u.roles[0]).toLowerCase();
      } catch {}
    }
  }
  return headers;
};

export function ChatWindow({ isFullPage = false, onClose, onMaximize }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [studentContext, setStudentContext] = useState<any>(null);
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [escalateDraft, setEscalateDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    initSessionAndHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const initSessionAndHistory = async () => {
    try {
      // 1. Fetch suggestions and context
      const res = await fetch('/api/v1/student/ai-tutor/history', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        if (data.student_context) {
          setStudentContext(data.student_context);
        }
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          // Add rich personalized welcome message
          const studentName = data.student_context?.name || 'Student';
          setMessages([
            {
              id: 'welcome-init',
              role: 'assistant',
              content: `👋 Hello **${studentName}**! I am your **RKV AI Academic Mentor**.\n\n` +
                `I am synchronized with your enrolled subjects, syllabi, and recent performance evaluations.\n\n` +
                `Here is how I can help you today:\n` +
                `- 📖 **Teach Any Topic:** Ask \`"Teach me DBMS normalization"\` or \`"Explain 3NF"\`\n` +
                `- 🎯 **Diagnostic Weak Areas:** Ask \`"What is my weakest topic?"\`\n` +
                `- 📝 **Practice Questions:** Ask \`"Give me 5 practice questions on Neural Networks"\`\n` +
                `- 🌐 **Multi-Language:** I speak **English**, **தமிழ் (Tamil)**, and **हिन्दी (Hindi)**.\n` +
                `- 🎙️ **Voice Input:** Click the microphone button anytime to speak!`,
              created_at: new Date().toISOString()
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to init AI tutor', err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMessage: ChatMessageItem = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      language: language,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch('/api/v1/student/ai-tutor/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: text,
          language: language,
          session_id: sessionId
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const textReply = json.data?.response || json.data?.reply || json.data?.content;
        if (json.data && textReply) {
          const assistantMessage: ChatMessageItem = {
            id: `ast-${Date.now()}`,
            role: 'assistant',
            content: textReply,
            language: language,
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, assistantMessage]);
          if (json.data.session_id) {
            setSessionId(json.data.session_id);
          }
        }
      } else {
        throw new Error('Server responded with an error');
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ I encountered a temporary network delay connecting to the AI neural model. Please try asking again in a few moments.',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputValue(transcript);
    handleSend(transcript);
  };

  const handleEscalateFromMessage = (content: string) => {
    setEscalateDraft(content);
    setIsEscalateOpen(true);
  };

  return (
    <div className={`flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl text-foreground overflow-hidden ${
      isFullPage ? 'h-full w-full rounded-3xl border border-white/50 dark:border-white/10 shadow-2xl shadow-indigo-500/10' : 'h-[620px] w-full rounded-2xl border border-border shadow-xl'
    }`}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-3.5 bg-white/80 dark:bg-slate-900/80 border-b border-border/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/20">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-foreground tracking-tight">RKV AI Academic Tutor</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                Model 2026
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
              <span>{studentContext?.name || 'Context-Aware Tutor'}</span>
              <span>•</span>
              <span className="text-emerald-500 font-bold">Syllabus Synced</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={(lang) => setLanguage(lang)}
          />

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEscalateDraft('');
              setIsEscalateOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold rounded-xl border-rose-300 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 h-8 px-2.5 transition-colors"
            title="Escalate doubt to course faculty"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Ask Faculty</span>
          </Button>

          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Open full page chat"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Minimize chat"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          )}
        </div>
      </div>

      {/* Student Academic Snapshot Strip (When context is available) */}
      {studentContext && studentContext.weak_topics && (
        <div className="flex-shrink-0 px-5 py-2 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-200/50 dark:border-indigo-900/40 text-[11px] text-foreground flex items-center justify-between overflow-x-auto gap-4 no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
              <Target className="w-3.5 h-3.5" /> Focus Area:
            </span>
            <span className="font-semibold text-foreground truncate max-w-xs">{studentContext.weak_topics[0]}</span>
          </div>

          <div className="flex items-center gap-3 min-w-max text-muted-foreground text-xs">
            {studentContext.upcoming_exams && studentContext.upcoming_exams[0] && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Next: <strong className="text-foreground">{studentContext.upcoming_exams[0].split('(')[0]}</strong>
              </span>
            )}
            {studentContext.growth_metrics && (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {studentContext.growth_metrics}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-950/40">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onEscalate={handleEscalateFromMessage}
          />
        ))}

        {loading && (
          <div className="flex items-start gap-3 my-3">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-border text-foreground text-xs flex items-center gap-2.5 shadow-md">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" />
              </div>
              <span className="text-muted-foreground font-medium">RKV AI Tutor is analyzing your syllabus & metrics...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex-shrink-0 px-4 pt-1 bg-white/70 dark:bg-slate-900/70 border-t border-border/50 backdrop-blur-md">
        <SuggestedPrompts
          onSelectPrompt={(p) => handleSend(p)}
          disabled={loading}
        />
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 p-4 bg-white/90 dark:bg-slate-900/90 border-t border-border/60 backdrop-blur-xl">
        <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-950/80 border border-border/70 rounded-2xl p-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-inner">
          <VoiceInput
            language={language}
            onTranscript={handleVoiceTranscript}
            disabled={loading}
          />

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'ta'
                ? 'உங்கள் வினாவை தட்டச்சு செய்யவும் அல்லது பேசவும்...'
                : language === 'hi'
                ? 'अपना प्रश्न लिखें या बोलें...'
                : 'Ask anything ("Teach me DBMS", "Give 5 questions", "Weakest topic")...'
            }
            rows={1}
            className="flex-1 bg-transparent border-0 text-sm text-foreground placeholder:text-muted-foreground p-2 focus:outline-none resize-none max-h-28 overflow-y-auto font-medium"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !inputValue.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-600/25 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 active:scale-95"
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-muted-foreground font-medium">
          <span>Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for newline</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">Personalized to Your Syllabus & COs</span>
        </div>
      </div>

      {/* Escalation Modal */}
      <EscalationModal
        isOpen={isEscalateOpen}
        onClose={() => setIsEscalateOpen(false)}
        defaultQuestion={escalateDraft}
        onSuccess={(id) => {
          setMessages(prev => [
            ...prev,
            {
              id: `esc-conf-${Date.now()}`,
              role: 'assistant',
              content: `✅ Your question has been forwarded to faculty! Reference Ticket: \`${id.slice(0, 8)}\`. They will answer within 24 hours.`,
              created_at: new Date().toISOString()
            }
          ]);
        }}
      />
    </div>
  );
}
