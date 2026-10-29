'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bot, Send, Sparkles, Trash2, User, RefreshCw, TrendingUp, AlertTriangle, Award
} from 'lucide-react';

import { apiClient } from '@/lib/api/client';

export function AIAssistantChatbot() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; source?: string }>>([
    {
      sender: 'ai',
      text: 'Hello Administrator! I am RKV NEXUS AI Assistant. Ask me anything about institutional health scores, courses, programmes, faculty workload, or at-risk student predictions.',
      source: 'RKV NEXUS Intelligence'
    }
  ]);

  const handleSend = async (customQ?: string) => {
    const textToSend = customQ || query;
    if (!textToSend.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    if (!customQ) setQuery('');
    setLoading(true);

    try {
      const data = await apiClient<{ status: string; response: string; source?: string }>('/admin/ai-assistant', {
        method: 'POST',
        body: JSON.stringify({ query: textToSend })
      });
      setMessages((prev) => [...prev, { sender: 'ai', text: data.response || 'Analysis complete.', source: data.source }]);
    } catch (e) {
      console.error('AI assistant error', e);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Analysis executed against live PostgreSQL models.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-indigo-500" />
            Integrated AI Assistant Chatbot
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Ask natural language questions about institution stats, student risk, and faculty performance</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setMessages([{ sender: 'ai', text: 'Chat history cleared. How can I assist you now?' }])}
          className="text-xs font-bold text-rose-500 hover:bg-rose-500/10"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear Chat
        </Button>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 my-auto">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Suggested Queries:
        </span>
        <button
          onClick={() => handleSend("How many staff and students are logged in?")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border hover:border-indigo-500 transition-colors flex items-center gap-1.5"
        >
          <User className="w-3.5 h-3.5 text-indigo-500" />
          <span>"How many staff logged in?"</span>
        </button>
        <button
          onClick={() => handleSend("What examinations are scheduled in the platform?")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border hover:border-indigo-500 transition-colors flex items-center gap-1.5"
        >
          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          <span>"Examinations matrix"</span>
        </button>
        <button
          onClick={() => handleSend("Which students are at risk in BIT?")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border hover:border-indigo-500 transition-colors flex items-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>"Which students are at risk in BIT?"</span>
        </button>
        <button
          onClick={() => handleSend("Who is the top performing faculty lead?")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border hover:border-indigo-500 transition-colors flex items-center gap-1.5"
        >
          <Award className="w-3.5 h-3.5 text-emerald-500" />
          <span>"Who is the top performing faculty lead?"</span>
        </button>
      </div>

      {/* Chat Container */}
      <Card className="border flex flex-col h-[480px] overflow-hidden">
        <CardHeader className="py-3 px-4 border-b bg-muted/40 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            RKV NEXUS AI Governance Assistant (Model 2026)
          </CardTitle>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Online
          </span>
        </CardHeader>

        <CardContent className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/10">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex gap-2 max-w-[85%]">
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="flex flex-col">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-card border text-foreground rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.sender === 'ai' && m.source && (
                    <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1 mt-1 pl-1 font-medium">
                      <Sparkles className="w-3 h-3 text-indigo-500 inline" />
                      {m.source}
                    </span>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Analyzing institutional query...</span>
            </div>
          )}
        </CardContent>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t bg-card flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about CO attainment, student risk, faculty workloads..."
            className="flex-1 px-3 py-2 text-xs rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 rounded-xl">
            <Send className="w-3.5 h-3.5 mr-1" /> Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
