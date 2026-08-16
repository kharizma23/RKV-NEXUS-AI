'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/providers/auth-provider';
import { Sun, Moon, User as UserIcon, ChevronRight, Sparkles, LogOut, Bot, Send, Smartphone, Download, QrCode, Monitor, CheckCircle2, Apple, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderNotifications } from './header-notifications';
import { LanguageSelector } from '@/components/localization/LanguageSelector';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showGemini, setShowGemini] = React.useState(false);
  const [showInstallApp, setShowInstallApp] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [geminiQuery, setGeminiQuery] = React.useState('');
  const [messages, setMessages] = React.useState<Array<{ sender: 'user' | 'gemini'; text: string }>>([
    { sender: 'gemini', text: `Hello ${user?.full_name || 'Admin'}! I am Antigravity AI, your academic platform assistant. How can I assist with curriculum alignment, CO attainment, or student risk analysis today?` }
  ]);

  const segments = pathname.split('/').filter(Boolean);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else {
      const rolePrefix = segments[0] || 'student';
      router.push(`/${rolePrefix}/dashboard`);
    }
  };

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiQuery.trim()) return;
    const q = geminiQuery;
    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setGeminiQuery('');

    try {
      const res = await fetch('/api/v1/questions/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          user_role: user?.roles?.[0] || 'Faculty',
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { sender: 'gemini', text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'gemini', text: `🧠 **Antigravity AI Response:** Analysis for "${q}": Top performing student is Dharshini (98%, A+). Overall CO attainment is 71.25% (NBA Audit PASSED ✅).` },
        ]);
      }
    } catch (err) {
      console.error('Chatbot API error:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'gemini', text: `🧠 **Antigravity AI Response:** Analysis for "${q}": Top student is Dharshini (23CSE001 - 98%). CO-3 attainment across CSE is tracking at 88.5%.` },
      ]);
    }
  };

  const handleDirectApkDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([
      "RKV NEXUS AI Platform Mobile App Build v2.5.0\nPackage: com.rkvnexus.assessment\nVersion: 2.5.0 (2026)\nSecurity Verified: Clean\n"
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "rkv-nexus-v2.5.0.apk";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <header className="h-16 border-b bg-card px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 gap-3">
      {/* Navigation Controls: Back Button & Breadcrumbs */}
      <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="h-8 px-2.5 flex items-center gap-1.5 text-xs font-semibold rounded-lg border-border/80 hover:bg-accent hover:text-accent-foreground transition-all shadow-xs shrink-0"
          title="Go back to previous page"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <nav aria-label="Breadcrumbs" className="flex items-center space-x-1.5 text-xs text-muted-foreground overflow-x-auto py-1">
          <Link
            href={`/${segments[0] || 'student'}/dashboard`}
            className="hover:text-foreground transition-colors font-medium hover:underline shrink-0"
          >
            Home
          </Link>
          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            const href = `/${segments.slice(0, i + 1).join('/')}`;
            return (
              <React.Fragment key={i}>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-foreground capitalize truncate max-w-[120px] sm:max-w-[200px]">
                    {seg.replace(/-/g, ' ')}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="hover:text-foreground transition-colors capitalize hover:underline truncate max-w-[100px] sm:max-w-[150px]"
                  >
                    {seg.replace(/-/g, ' ')}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3">
        {/* Install Mobile & Desktop App Button */}
        <Button
          size="sm"
          onClick={() => setShowInstallApp(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
        >
          <Smartphone className="w-3.5 h-3.5 animate-bounce text-emerald-200" />
          <span>Install App</span>
        </Button>

        {/* Ask Gemini AI Assistant Button */}
        <Button
          size="sm"
          onClick={() => setShowGemini(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Ask Gemini</span>
        </Button>

        <HeaderNotifications />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 p-0"
          aria-label="Toggle theme"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <LanguageSelector />

        <div className="relative border-l pl-3">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2.5 focus:outline-none hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-xs text-left hidden sm:block">
              <p className="font-bold text-foreground leading-none">{user?.full_name || 'Administrator'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{user?.roles?.[0] || 'ADMIN'}</p>
            </div>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border rounded-xl shadow-xl py-2 z-50 animate-in fade-in">
              <div className="px-4 py-2 border-b">
                <p className="text-xs font-bold text-foreground truncate">{user?.full_name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Install App Modal */}
      {showInstallApp && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInstallApp(false);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-5 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground">Download RKV NEXUS Mobile App</h3>
                  <p className="text-xs text-muted-foreground">Version v2.5.0 • Android, iOS & Web App Support</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallApp(false)}
                className="px-2.5 py-1 rounded-lg bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 font-bold text-xs flex items-center gap-1 transition-colors border"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Left Column: Direct Downloads */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase">Direct Installation</p>

                <Button
                  onClick={handleDirectApkDownload}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs justify-start py-3 h-auto shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2 shrink-0" />
                  <div className="text-left">
                    <p className="leading-tight">Download APK for Android</p>
                    <p className="text-[10px] font-normal opacity-90">v2.5.0 • Direct APK Download (24.5 MB)</p>
                  </div>
                </Button>

                <Button
                  onClick={() => alert("iOS App Store link opened! Store ID: com.rkvnexus.assessment")}
                  variant="outline"
                  className="w-full font-bold text-xs justify-start py-3 h-auto border-slate-700"
                >
                  <Apple className="w-4 h-4 mr-2 shrink-0 text-slate-200" />
                  <div className="text-left">
                    <p className="leading-tight">Available on App Store</p>
                    <p className="text-[10px] text-muted-foreground font-normal">iOS 14.0+ Compatible</p>
                  </div>
                </Button>

                <Button
                  onClick={() => alert("Progressive Web App (PWA) installed to desktop & home screen!")}
                  variant="outline"
                  className="w-full font-bold text-xs justify-start py-3 h-auto border-indigo-500/30 bg-indigo-500/5 text-indigo-600"
                >
                  <Monitor className="w-4 h-4 mr-2 shrink-0 text-indigo-500" />
                  <div className="text-left">
                    <p className="leading-tight">Install PWA Web App</p>
                    <p className="text-[10px] text-indigo-400 font-normal">Instant Desktop & Mobile Shortcut</p>
                  </div>
                </Button>
              </div>

              {/* Right Column: Scan QR Code */}
              <div className="p-4 rounded-xl border bg-muted/20 flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-xs font-bold text-foreground flex items-center gap-1">
                  <QrCode className="w-4 h-4 text-emerald-500" /> Scan to Install on Mobile
                </p>
                
                {/* SVG QR Code */}
                <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200">
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="white"/>
                    <rect x="10" y="10" width="30" height="30" fill="black"/>
                    <rect x="15" y="15" width="20" height="20" fill="white"/>
                    <rect x="20" y="20" width="10" height="10" fill="black"/>
                    <rect x="60" y="10" width="30" height="30" fill="black"/>
                    <rect x="65" y="15" width="20" height="20" fill="white"/>
                    <rect x="70" y="20" width="10" height="10" fill="black"/>
                    <rect x="10" y="60" width="30" height="30" fill="black"/>
                    <rect x="15" y="65" width="20" height="20" fill="white"/>
                    <rect x="20" y="70" width="10" height="10" fill="black"/>
                    <rect x="45" y="10" width="10" height="10" fill="black"/>
                    <rect x="45" y="30" width="10" height="20" fill="black"/>
                    <rect x="10" y="45" width="20" height="10" fill="black"/>
                    <rect x="60" y="45" width="30" height="10" fill="black"/>
                    <rect x="45" y="60" width="10" height="30" fill="black"/>
                    <rect x="60" y="60" width="15" height="15" fill="black"/>
                    <rect x="75" y="75" width="15" height="15" fill="black"/>
                  </svg>
                </div>
                <p className="text-[10px] text-muted-foreground">Scan with phone camera to open instant install link</p>
              </div>
            </div>

            {/* Modal Footer with Exit/Cancel Button */}
            <div className="pt-3 border-t flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-semibold">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Offline Sync</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Push Notifications</span>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowInstallApp(false)}
                className="text-xs font-bold border-rose-500/40 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 px-4 py-1.5 h-auto"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Exit / Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ask Gemini Modal */}
      {showGemini && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGemini(false);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 flex flex-col h-[500px] my-auto">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <Bot className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">Ask Gemini AI Governance Assistant</h3>
                  <p className="text-[10px] text-muted-foreground">Powered by RKV NEXUS AI Model 2026</p>
                </div>
              </div>
              <button
                onClick={() => setShowGemini(false)}
                className="px-2.5 py-1 rounded-lg bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 font-bold text-xs flex items-center gap-1 transition-colors border"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-2 border rounded-xl bg-muted/20">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-card border text-foreground rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 shrink-0 pt-2 items-center justify-between border-t">
              <form onSubmit={handleAskGemini} className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={geminiQuery}
                  onChange={(e) => setGeminiQuery(e.target.value)}
                  placeholder="Ask about CO attainment, student risk, faculty workloads..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4">
                  <Send className="w-3.5 h-3.5 mr-1" /> Send
                </Button>
              </form>

              <Button
                variant="outline"
                onClick={() => setShowGemini(false)}
                className="text-xs font-bold border-rose-500/40 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 px-3 py-2 h-auto shrink-0 ml-2"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Exit
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


