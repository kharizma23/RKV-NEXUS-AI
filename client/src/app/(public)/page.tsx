'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────
   ANIMATED COUNTER HOOK
───────────────────────────────────────────── */
function useAnimatedCounter(target: number, duration = 2000, startOnMount = false) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(startOnMount);

  const start = useCallback(() => setStarted(true), []);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, start };
}

/* ─────────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────────── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ─────────────────────────────────────────────
   IMPACT CARD with animated counter
───────────────────────────────────────────── */
function ImpactCard({ value, suffix, label, sublabel, delay = 0 }: {
  value: number; suffix: string; label: string; sublabel: string; delay?: number;
}) {
  const { ref, visible } = useScrollReveal(0.2);
  const { count, start } = useAnimatedCounter(value, 1800);

  useEffect(() => {
    if (visible) { setTimeout(start, delay); }
  }, [visible, start, delay]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group relative bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-500 overflow-hidden ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-indigo-50 group-hover:bg-indigo-100/60 transition-colors duration-500" />
      <span className="relative text-4xl lg:text-5xl font-black tracking-tight text-slate-900 block mb-2">
        {visible ? count : 0}{suffix}
      </span>
      <h3 className="relative font-bold text-sm text-slate-800 mb-1">{label}</h3>
      <p className="relative text-xs text-slate-400 leading-relaxed">{sublabel}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REVEAL WRAPPER
───────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'traditional' | 'digital' | 'ai' | 'predictive'>('ai');
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [studentCount, setStudentCount] = useState(25840);
  const [evaluationProgress, setEvaluationProgress] = useState(68);
  const [notificationCount, setNotificationCount] = useState(142);
  const [liveLogs, setLiveLogs] = useState<{ text: string; type: 'sync' | 'alert' | 'ok' }[]>([
    { text: 'ECE dept — outcome mapping verified', type: 'ok' },
    { text: 'Board exam blueprint compiled', type: 'sync' },
    { text: 'Platform availability: 99.9% confirmed', type: 'ok' },
  ]);
  const [aiAlerts, setAiAlerts] = useState([
    { student: 'S-2241', risk: 'High', subject: 'Advanced Maths' },
    { student: 'S-1098', risk: 'Medium', subject: 'Organic Chemistry' },
  ]);

  useEffect(() => {
    const t1 = setInterval(() => setStudentCount(p => p + (Math.random() > 0.6 ? 1 : 0)), 4000);
    const t2 = setInterval(() => setEvaluationProgress(p => (p >= 98 ? 52 : p + 1)), 4500);
    const t3 = setInterval(() => setNotificationCount(p => p + (Math.random() > 0.5 ? 1 : 0)), 3200);

    const logPool = [
      { text: 'SSO sync — 1,524 faculty verified', type: 'sync' as const },
      { text: 'NBA compliance checklist activated', type: 'ok' as const },
      { text: 'AI risk flag: 3 students detected', type: 'alert' as const },
      { text: 'Placement drive: Zoho opening posted', type: 'ok' as const },
      { text: 'Study dispatch — 480 students notified', type: 'sync' as const },
      { text: 'Semester transcript auto-compiled', type: 'ok' as const },
    ];
    const t4 = setInterval(() => {
      setLiveLogs(prev => [logPool[Math.floor(Math.random() * logPool.length)], prev[0], prev[1]]);
    }, 5000);

    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); clearInterval(t4); };
  }, []);

  const toggleFaq = (idx: number) => setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));

  const tabData = {
    traditional: {
      headline: 'Paper-Based & Manual',
      desc: 'Manual answer book checking, physical exam schedules, siloed paper files, and 3-week result cycles. Compliance challenges are endemic.',
      pain: ['3–4 week result delays', 'Accreditation data gaps', 'Zero analytics visibility'],
    },
    digital: {
      headline: 'Digitized but Disconnected',
      desc: 'PDF uploads, email notifications, online forms — streamlined operations but no outcome alignment or predictive intelligence.',
      pain: ['Siloed tools across departments', 'No unified audit trail', 'Manual accreditation reports'],
    },
    ai: {
      headline: 'AI-Assisted Intelligence',
      desc: 'Smart blueprints, evidence-linked marking, predictive outcome mapping, and personalized study roadmaps — deployed in days.',
      gain: ['Automated evaluation cycles', 'Real-time NAAC/NBA reports', 'AI-powered risk detection'],
    },
    predictive: {
      headline: 'Predictive Institution',
      desc: 'Early risk warnings, automated curriculum adjustments, and real-time outcome attainment analytics — fully autonomous academic governance.',
      gain: ['Zero manual interventions', 'Continuous accreditation readiness', 'Institution-wide intelligence'],
    },
  };

  const faqs = [
    { q: 'How long does implementation take?', a: 'Standard cloud deployments complete in 7–10 business days, including department configuration, faculty SSO setup, and data migration support.' },
    { q: 'Can multiple campuses use one platform?', a: 'Yes. Our multi-campus architecture supports isolated department databases under a single parent license, with unified administrative oversight.' },
    { q: 'Does it support autonomous institutions?', a: 'Yes. Autonomous colleges can independently configure grading schemas, syllabus blueprints, and transcripts without affecting affiliated institutions.' },
    { q: 'How secure is student data?', a: 'Data is protected through database-layer isolation, AES-256 encryption at rest, TLS in transit, and fully compliant with SOC2 Type II and GDPR standards.' },
    { q: 'Can existing ERP systems integrate?', a: 'Yes. Pre-built REST API adapters sync student rosters, course registries, and attendance data with standard ERP and SIS platforms.' },
    { q: 'Can notifications be customized per department?', a: 'Yes. Administrators configure notification rules per department for exam timetables, deadlines, AI alerts, and placement drives.' },
    { q: 'Does AI replace faculty decision-making?', a: 'No. AI assists faculty by flagging grading anomalies, identifying at-risk students, and recommending study materials — final decisions remain with faculty.' },
    { q: 'Can the platform scale to 100,000 students?', a: 'Yes. Built on PostgreSQL with query indexing and horizontal scaling, validated for high-volume concurrent operations across large campuses.' },
  ];

  return (
    <div suppressHydrationWarning className="min-h-screen bg-white text-slate-900 overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>


      {/* ══════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">🎓</span>
            <span className="font-bold text-sm tracking-tight text-slate-900">KVR Nexus AI<span className="text-indigo-600">.</span></span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-slate-500">
            <a href="#impact" className="hover:text-slate-900 transition-colors">Impact</a>
            <a href="#why-choose-us" className="hover:text-slate-900 transition-colors">Solutions</a>
            <a href="#testimonials" className="hover:text-slate-900 transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <button className="hidden sm:block text-[13px] font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors">
                Sign in
              </button>
            </Link>
            <Link href="/login">
              <button className="text-[13px] font-semibold text-white px-5 py-2 rounded-lg transition-all hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/25" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                Access Portal
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" />

        {/* Ambient orbs */}
        <div className="absolute top-24 right-[10%] w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute bottom-24 left-[5%] w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">

          {/* LEFT — Copy */}
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                SOC2 Type II · GDPR Ready · AI Powered
              </span>
              <h1 className="text-5xl lg:text-[62px] font-black tracking-tight leading-[1.08] text-slate-900">
                One Unified Platform<br />
                for Modern{' '}
                <span className="shimmer-text">Academic Assessment.</span>
              </h1>
            </div>

            <p className="text-lg text-slate-500 leading-relaxed max-w-lg font-normal">
              AI-powered assessment, evaluation, notifications, learning intelligence, and institutional analytics — built for higher education at scale.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/login">
                <button className="inline-flex items-center gap-2 text-[14px] font-semibold text-white px-7 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  Access Portal
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </Link>
              <a href="#contact">
                <button className="text-[14px] font-semibold text-slate-700 border border-slate-200 px-7 py-3.5 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all">
                  Request Demo
                </button>
              </a>
              <a href="#contact">
                <button className="text-[14px] font-medium text-slate-500 px-4 py-3.5 rounded-xl hover:text-slate-700 transition-colors flex items-center gap-1.5">
                  Book Consultation
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </a>
            </div>

            {/* Trust micro-signals */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              {[
                { n: '25,000+', l: 'Students' },
                { n: '1,500+', l: 'Faculty' },
                { n: '150+', l: 'Departments' },
                { n: '99.9%', l: 'Uptime SLA' },
              ].map((s, i) => (
                <div key={i} className={`text-center ${i > 0 ? 'pl-6 border-l border-slate-200' : ''}`}>
                  <span className="block text-base font-black text-slate-900">{s.n}</span>
                  <span className="block text-[11px] text-slate-400 font-medium">{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Live Dashboard */}
          <div className="relative">
            <div className="float-a">
              {/* Main dashboard card */}
              <div className="glass-card rounded-2xl p-5 shadow-2xl shadow-slate-900/10 border border-slate-200/60">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 absolute inset-0 animate-ping opacity-60" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700">Institutional Monitor</span>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">Live Operations</span>
                </div>

                {/* Metric Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Students', val: studentCount.toLocaleString(), trend: '+12 today', color: 'text-indigo-600' },
                    { label: 'Faculty', val: '1,524', trend: 'Verified', color: 'text-violet-600' },
                    { label: 'Departments', val: '150+', trend: 'Active', color: 'text-cyan-600' },
                  ].map((m, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide block mb-1">{m.label}</span>
                      <span className={`text-sm font-black ${m.color} block`}>{m.val}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{m.trend}</span>
                    </div>
                  ))}
                </div>

                {/* Evaluation Progress */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Evaluation Progress</span>
                    <span className="text-[10px] font-black text-indigo-600">{evaluationProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${evaluationProgress}%`, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
                    />
                  </div>
                </div>

                {/* Notifications + AI Alerts */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide block mb-1">Notifications</span>
                    <span className="text-sm font-black text-orange-500">{notificationCount}</span>
                    <span className="text-[9px] text-slate-400 block">Dispatched today</span>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                    <span className="text-[9px] text-red-500 font-semibold uppercase tracking-wide block mb-1">AI Alerts</span>
                    <span className="text-sm font-black text-red-600">2 Risks</span>
                    <span className="text-[9px] text-red-400 block">Early detection</span>
                  </div>
                </div>

                {/* AI Risk Cards */}
                <div className="space-y-2 mb-4">
                  {aiAlerts.map((a, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-6 rounded-full ${a.risk === 'High' ? 'bg-red-500' : 'bg-amber-400'}`} />
                        <div>
                          <span className="text-[10px] font-bold text-slate-800 block">{a.student}</span>
                          <span className="text-[9px] text-slate-400">{a.subject}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${a.risk === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{a.risk}</span>
                    </div>
                  ))}
                </div>

                {/* Live Log Terminal */}
                <div className="rounded-xl overflow-hidden" style={{ background: '#0d1117' }}>
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
                    <div className="w-2 h-2 rounded-full bg-red-500/70" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
                    <div className="w-2 h-2 rounded-full bg-green-500/70" />
                    <span className="ml-2 text-[9px] font-mono text-slate-500">operations.log</span>
                  </div>
                  <div className="p-3 space-y-1.5 font-mono text-[10px]">
                    {liveLogs.map((log, i) => (
                      <div key={i} className={`flex items-start gap-2 log-entry ${i === 0 ? '' : 'opacity-50'}`}>
                        <span className={`font-bold flex-shrink-0 ${log.type === 'alert' ? 'text-red-400' : log.type === 'sync' ? 'text-indigo-400' : 'text-green-400'}`}>
                          {log.type === 'alert' ? '⚠' : log.type === 'sync' ? '↻' : '✓'}
                        </span>
                        <span className="text-slate-400">{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating secondary card */}
            <div className="float-b absolute -left-10 bottom-12 glass-card rounded-xl p-4 shadow-xl border border-slate-200/50 hidden lg:block" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}>✓</div>
                <div>
                  <span className="text-[10px] font-bold text-slate-800 block">NAAC Report Generated</span>
                  <span className="text-[9px] text-slate-400">Outcome attainment: 94.2%</span>
                </div>
              </div>
            </div>

            {/* Floating security badge */}
            <div className="float-b absolute -right-6 top-8 glass-card rounded-xl p-3 shadow-xl border border-slate-200/50 hidden xl:flex items-center gap-2" style={{ animationDelay: '2s' }}>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-800 block">SOC2 Verified</span>
                <span className="text-[9px] text-slate-400">Type II Certified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — TRUSTED BY
      ══════════════════════════════════════════════ */}
      <section className="py-16 border-y border-slate-100" style={{ background: '#fafafa' }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-10">
            Trusted by Administrators & Faculty across Higher Education
          </p>

          {/* Institution Type Logos */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { label: 'State Universities', icon: '🏛' },
              { label: 'Autonomous Colleges', icon: '🎓' },
              { label: 'Engineering Institutions', icon: '⚙️' },
              { label: 'Medical Colleges', icon: '🏥' },
              { label: 'Government Bodies', icon: '🏢' },
            ].map((inst, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
                <span className="text-lg">{inst.icon}</span>
                <span className="text-[12px] font-semibold text-slate-600">{inst.label}</span>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-center">
            {[
              { val: '25,000+', label: 'Students Managed', highlight: false },
              { val: '1,500+', label: 'Faculty Members', highlight: false },
              { val: '150+', label: 'Departments', highlight: false },
              { val: '99.9%', label: 'Platform Availability', highlight: false },
            ].map((s, i) => (
              <div key={i} className="text-center col-span-1">
                <span className="block text-2xl font-black text-slate-900">{s.val}</span>
                <span className="block text-[11px] text-slate-400 font-medium mt-0.5">{s.label}</span>
              </div>
            ))}
            <div className="col-span-2 md:col-span-4 lg:col-span-3 flex flex-wrap justify-center gap-2">
              {[
                { label: 'SOC2 Ready', color: 'indigo' },
                { label: 'GDPR Ready', color: 'violet' },
                { label: 'AI Powered', color: 'cyan' },
                { label: 'ISO 27001', color: 'slate' },
              ].map((b, i) => (
                <span key={i} className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${
                  b.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                  b.color === 'violet' ? 'bg-violet-50 text-violet-600 border-violet-200' :
                  b.color === 'cyan' ? 'bg-cyan-50 text-cyan-600 border-cyan-200' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>{b.label}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — INSTITUTIONAL IMPACT
      ══════════════════════════════════════════════ */}
      <section id="impact" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full mb-5">Proven Outcomes</span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4">
                Measurable Institutional Impact
              </h2>
              <p className="text-base text-slate-400 max-w-xl mx-auto">
                Real performance gains validated across universities, autonomous colleges, and government institutions.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ImpactCard value={70} suffix="%" label="Reduction in Evaluation Time" sublabel="Standardized grading, digital moderation, and auto-compilation eliminate manual marking bottlenecks." delay={0} />
            <ImpactCard value={90} suffix="%" label="Faster Result Processing" sublabel="Auto-compiled transcripts and outcome checks published within hours, not weeks." delay={80} />
            <ImpactCard value={95} suffix="%" label="Improved Student Engagement" sublabel="Placement alerts, study roadmaps, and real-time notifications drive measurable participation." delay={160} />
            <ImpactCard value={40} suffix="%" label="Reduced Administrative Work" sublabel="Credit checks, outcome logs, and compliance reports automated through smart configurations." delay={240} />
            <ImpactCard value={100} suffix="%" label="Transparent Evaluation Workflow" sublabel="Every grading action, moderation, and blueprint change logged with immutable audit trails." delay={320} />
            <div className="group relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 shadow-xl shadow-indigo-500/20 overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute right-4 top-4 w-20 h-20 rounded-full bg-white/5" />
              <span className="relative text-white/60 text-xs font-bold uppercase tracking-widest block mb-3">AI Intelligence</span>
              <h3 className="relative text-white text-xl font-black mb-3 leading-tight">Early Academic Risk Detection</h3>
              <p className="relative text-indigo-200 text-sm leading-relaxed">AI pinpoints knowledge gaps and at-risk students before grades drop — enabling proactive intervention.</p>
              <div className="relative mt-5 flex items-center gap-2 text-indigo-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Continuous monitoring active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4 — WHY UNIVERSITIES CHOOSE US
      ══════════════════════════════════════════════ */}
      <section id="why-choose-us" className="py-28" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full mb-5">Evolutionary Roadmap</span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4">
                Why Universities Choose Us
              </h2>
              <p className="text-base text-slate-400 max-w-xl mx-auto">
                Transform your institution from disjointed paper workflows into a predictive digital ecosystem.
              </p>
            </div>
          </Reveal>

          {/* Timeline Tabs */}
          <Reveal delay={100}>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {(['traditional', 'digital', 'ai', 'predictive'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                    activeTab === tab
                      ? 'text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-500 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-700'
                  }`}
                  style={activeTab === tab ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' } : {}}
                >
                  {tab === 'traditional' ? 'Traditional' : tab === 'digital' ? 'Digital' : tab === 'ai' ? 'AI Assisted' : 'Predictive'}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Tab Panel */}
          <Reveal delay={150}>
            <div className="max-w-3xl mx-auto mb-16">
              {(activeTab === 'traditional' || activeTab === 'digital') ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-black text-sm">✗</div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{(tabData[activeTab] as any).headline}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4">{(tabData[activeTab] as any).desc}</p>
                      <div className="space-y-2">
                        {(tabData[activeTab] as any).pain.map((p: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            <span className="font-bold">—</span> {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-8 border border-indigo-200/50 shadow-xl shadow-indigo-500/10" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.04), rgba(124,58,237,0.04))' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>✓</div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{(tabData[activeTab] as any).headline}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4">{(tabData[activeTab] as any).desc}</p>
                      <div className="space-y-2">
                        {(tabData[activeTab] as any).gain.map((g: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[13px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                            <span className="font-bold text-indigo-400">✓</span> {g}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 7 — TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section id="testimonials" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full mb-5">Institutional Testimonials</span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                Proven Trust. Real Results.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Dr. Arthur Pendleton', role: 'Vice Chancellor', inst: 'State University of Technology',
                quote: 'KVR Nexus AI has standardized our entire examination pipeline. Moderation timelines dropped by 40% and our NAAC documentation is now fully automated.',
                avatar: 'AP', color: 'from-indigo-500 to-violet-600',
              },
              {
                name: 'Dr. Sarah Jenkins', role: 'Dean, ECE Department', inst: 'Premier Autonomous College',
                quote: 'Having outcome targets mapped directly to internal assessments makes regional compliance reporting effortless. I cannot imagine going back.',
                avatar: 'SJ', color: 'from-violet-500 to-purple-600',
              },
              {
                name: 'Prof. Marcus Brody', role: 'Head of Department, CS', inst: 'National Engineering Institute',
                quote: 'The marks moderation console and automated blueprint tools are exceptional. Our faculty spends 60% less time on administrative overhead.',
                avatar: 'MB', color: 'from-cyan-500 to-blue-600',
              },
              {
                name: 'Dr. Evelyn Carter', role: 'Controller of Examinations', inst: 'Apex University',
                quote: 'Audit-ready exam records and real-time result workflows reduced our processing time from 3 weeks to under 48 hours. Truly transformative.',
                avatar: 'EC', color: 'from-emerald-500 to-teal-600',
              },
              {
                name: 'Mr. David Vance', role: 'Placement Coordinator', inst: 'Institute of Applied Sciences',
                quote: 'Placement drive automation and direct student JD alerts have simplified campus hiring enormously. Company registrations up 35% this year.',
                avatar: 'DV', color: 'from-orange-500 to-red-600',
              },
              {
                name: 'Dr. Priya Mehta', role: 'Academic Director', inst: 'Government Medical College',
                quote: 'The AI early-risk detection system flagged 23 at-risk students before their mid-semester. Three of them recovered to distinction grades.',
                avatar: 'PM', color: 'from-pink-500 to-rose-600',
              },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {Array(5).fill(0).map((_, s) => (
                      <svg key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed flex-1 mb-5 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black bg-gradient-to-br ${t.color} flex-shrink-0`}>{t.avatar}</div>
                    <div>
                      <p className="font-bold text-[13px] text-slate-900">{t.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{t.role}</p>
                      <p className="text-[11px] text-indigo-600 font-semibold">{t.inst}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 8 — FAQ
      ══════════════════════════════════════════════ */}
      <section id="faq" className="py-28" style={{ background: '#f8fafc' }}>
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full mb-5">FAQ</span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                Frequently Asked Questions
              </h2>
            </div>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 30}>
                <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${faqOpen[i] ? 'border-indigo-200 shadow-md' : 'border-slate-200 shadow-sm'}`}>
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full text-left p-5 flex justify-between items-center gap-4"
                  >
                    <span className="font-semibold text-[14px] text-slate-900">{faq.q}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${faqOpen[i] ? 'rotate-180 bg-indigo-600' : 'bg-slate-100'}`}>
                      <svg className={`w-3.5 h-3.5 ${faqOpen[i] ? 'text-white' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>
                  {faqOpen[i] && (
                    <div className="px-5 pb-5 border-t border-slate-100">
                      <p className="text-[13px] text-slate-500 leading-relaxed pt-4">{faq.a}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 9 — FINAL CTA
      ══════════════════════════════════════════════ */}
      <section id="contact" className="py-32 relative overflow-hidden cta-gradient">
        {/* Ambient orbs */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Reveal>
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-8">
              Enterprise Partnership
            </span>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.08]">
              Ready to Transform<br />
              <span className="shimmer-text">Academic Assessment?</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Partner with our implementation team to deploy secure evaluation workflows, accreditation tools, and AI intelligence across your institution.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <a href="#contact-form">
                <button className="inline-flex items-center gap-2 text-[15px] font-semibold text-white px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  Request Enterprise Demo
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </a>
              <a href="mailto:enterprise@KVR Nexus AI.edu">
                <button className="text-[15px] font-semibold text-white border border-white/20 bg-white/10 hover:bg-white/15 px-8 py-4 rounded-xl transition-all backdrop-blur-sm">
                  Contact Sales
                </button>
              </a>
              <a href="#contact-form">
                <button className="text-[15px] font-medium text-slate-400 hover:text-white px-6 py-4 rounded-xl transition-colors flex items-center gap-1.5">
                  Schedule Consultation
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </a>
            </div>
          </Reveal>

          {/* Contact Form */}
          <Reveal delay={200}>
            <div id="contact-form" className="glass-card rounded-2xl p-8 border border-white/10 text-left shadow-2xl" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>
              <h3 className="font-bold text-white text-lg mb-6">Start Your Implementation</h3>
              <form
                onSubmit={(e) => { e.preventDefault(); alert('Request submitted successfully! Our team will contact you within 24 hours.'); }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">Full Name</label>
                    <input required placeholder="Dr. Alan Turing" className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-[13px] rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">Institutional Email</label>
                    <input type="email" required placeholder="turing@university.edu" className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-[13px] rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">Institution Name</label>
                    <input required placeholder="National Institute of Technology" className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-[13px] rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">Your Role</label>
                    <select className="w-full bg-white/5 border border-white/10 text-slate-300 text-[13px] rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
                      <option className="bg-slate-800">Vice Chancellor / Dean</option>
                      <option className="bg-slate-800">Head of Department</option>
                      <option className="bg-slate-800">Controller of Examinations</option>
                      <option className="bg-slate-800">IT Administrator</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">Requirements</label>
                  <textarea rows={3} placeholder="Describe your institution size, key challenges, and integration requirements..." className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-[13px] rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                </div>
                <button type="submit" className="w-full text-[14px] font-semibold text-white py-3.5 rounded-xl transition-all hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/30" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  Submit Enterprise Consultation Request
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-white/5">
            {/* Brand */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none">🎓</span>
                <span className="font-bold text-white text-sm">KVR Nexus AI<span className="text-indigo-400">.</span></span>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-xs">
                Enterprise-grade academic assessment platform for higher education institutions.
              </p>
              <div className="flex gap-3">
                {['LinkedIn', 'GitHub'].map((s, i) => (
                  <a key={i} href="#" className="text-[12px] font-medium text-slate-500 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20">
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h5 className="text-white font-semibold text-[12px] uppercase tracking-widest mb-4">Solutions</h5>
              <ul className="space-y-3">
                {['Universities', 'Autonomous Colleges', 'Engineering', 'Medical', 'Government'].map((l, i) => (
                  <li key={i}><a href="#" className="text-[13px] text-slate-500 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h5 className="text-white font-semibold text-[12px] uppercase tracking-widest mb-4">Resources</h5>
              <ul className="space-y-3">
                {[['Documentation', '/help'], ['API Reference', '#'], ['Case Studies', '#'], ['Changelog', '#']].map(([l, h], i) => (
                  <li key={i}><Link href={h} className="text-[13px] text-slate-500 hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="text-white font-semibold text-[12px] uppercase tracking-widest mb-4">Company</h5>
              <ul className="space-y-3">
                {[['About', '/about'], ['Careers', '#'], ['Contact', '#contact']].map(([l, h], i) => (
                  <li key={i}><a href={h} className="text-[13px] text-slate-500 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="text-white font-semibold text-[12px] uppercase tracking-widest mb-4">Legal</h5>
              <ul className="space-y-3">
                {[['Privacy Policy', '/privacy'], ['Terms of Service', '#'], ['Support', '#contact']].map(([l, h], i) => (
                  <li key={i}><Link href={h} className="text-[13px] text-slate-500 hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-600">
            <p>© {new Date().getFullYear()} KVR Nexus AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                All systems operational
              </span>
              <span className="text-slate-700">·</span>
              <span>v2.0 Stable</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
