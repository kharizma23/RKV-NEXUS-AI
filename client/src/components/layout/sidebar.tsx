'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import {
  LayoutDashboard, User, Bell, BookOpen, FileText, Award, Map,
  HelpCircle, Shield, Building, Users, CheckSquare, History, Key, LogOut,
  GraduationCap, Brain, Briefcase, Trophy, Microscope, MessageSquare,
  Heart, Smartphone, ShieldCheck, ChevronRight, ChevronLeft, ChevronDown, CreditCard, Grid, Calendar,
  Mic, Clock, UserCheck, Sparkles, Target, Layers, TrendingUp, Eye, HardDrive,
  Compass, Radio, QrCode, Video, Bot, Settings, Activity, BarChart3
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  role: 'student' | 'faculty' | 'admin';
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  isNew?: boolean;
  action?: 'logout' | 'link';
}

interface NavigationModule {
  id: string;
  name: string;
  icon: any;
  items: NavItem[];
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // =========================================================================
  // 10-MODULE STUDENT NAVIGATION STRUCTURE
  // =========================================================================
  const studentModules: NavigationModule[] = [
    {
      id: 'student-dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      items: [
        { name: 'Overview & Forecast', href: '/student/dashboard', icon: Sparkles },
        { name: 'Adaptive Diagnostic Exam', href: '/student/dashboard?tab=adaptive', icon: Brain, badge: 'AI' },
      ]
    },
    {
      id: 'student-ai-tutor',
      name: 'AI Academic Tutor',
      icon: Brain,
      items: [
        { name: 'AI Chatbot (Main landing)', href: '/student/ai-tutor', icon: Bot, badge: 'AI', isNew: true },
        { name: 'Personalized Study Plan', href: '/student/study-plan', icon: Map },
        { name: 'Spaced Revision Scheduler', href: '/student/revision-schedule', icon: Calendar },
      ]
    },
    {
      id: 'student-examinations',
      name: 'Examinations',
      icon: FileText,
      items: [
        { name: 'Take Exam / Upcoming Exams', href: '/student/examinations', icon: FileText },
        { name: 'AI Proctoring Live', href: '/student/proctoring', icon: Shield, badge: 'Live' },
        { name: 'Flexible Time Exams', href: '/student/flexible-exams', icon: Clock },
        { name: 'Voice Answer Recorder', href: '/student/voice-exams', icon: Mic },
        { name: 'AR/VR Practical Exams', href: '/student/vr-exams', icon: Microscope, badge: 'VR' },
      ]
    },
    {
      id: 'student-results',
      name: 'Results & Feedback',
      icon: Award,
      items: [
        { name: 'Results & Transcripts', href: '/student/results', icon: Award },
        { name: 'Counterfactual AI Feedback', href: '/student/counterfactual', icon: Sparkles, badge: 'AI' },
        { name: 'Grading Confidence Score', href: '/student/confidence', icon: ShieldCheck },
        { name: 'Double-Blind Peer Review', href: '/student/peer-assessment', icon: UserCheck },
      ]
    },
    {
      id: 'student-analytics',
      name: 'AI Learning Analytics',
      icon: TrendingUp,
      items: [
        { name: 'Student 360° Profile', href: '/student/profile-360', icon: User },
        { name: 'Skill Competency Profile', href: '/student/skills-evaluation', icon: Target },
        { name: 'Growth Improvement Card', href: '/student/improvement', icon: TrendingUp },
      ]
    },
    {
      id: 'student-career',
      name: 'Career & Certifications',
      icon: Briefcase,
      items: [
        { name: 'Career Path Prediction', href: '/student/career-prediction', icon: Compass, badge: 'AI' },
        { name: 'Blockchain Certificates', href: '/student/certificates', icon: Award },
        { name: 'Industry Expert Feedback', href: '/student/industry-feedback', icon: MessageSquare },
      ]
    },
    {
      id: 'student-notifications',
      name: 'Notifications',
      icon: Bell,
      items: [
        { name: 'Notifications & Alerts', href: '/student/notifications', icon: Bell },
      ]
    },
    {
      id: 'student-settings',
      name: 'Settings & Portal',
      icon: Settings,
      items: [
        { name: 'Profile & 2FA', href: '/student/profile', icon: User },
        { name: 'Sign Out', href: '#signout', icon: LogOut, action: 'logout' },
      ]
    }
  ];

  // =========================================================================
  // 10-MODULE ADMIN NAVIGATION STRUCTURE
  // =========================================================================
  const adminModules: NavigationModule[] = [
    {
      id: 'admin-dashboard',
      name: 'Executive Command Center',
      icon: LayoutDashboard,
      items: [
        { name: 'Executive Dashboard', href: '/admin/dashboard', icon: Sparkles },
        { name: 'Global Benchmarking', href: '/admin/benchmarking', icon: Trophy, badge: 'Global' },
        { name: 'AI Governance Assistant', href: '/admin/ai-assistant', icon: Bot, badge: 'AI' },
      ]
    },
    {
      id: 'admin-people',
      name: 'People & Governance',
      icon: Users,
      items: [
        { name: 'User Directory & Roles', href: '/admin/users', icon: Users },
        { name: 'Faculty Approvals', href: '/admin/faculty-approvals', icon: CheckSquare, badge: 'Pending' },
        { name: 'Alumni Network & Outcomes', href: '/admin/alumni', icon: Award },
      ]
    },
    {
      id: 'admin-evaluation',
      name: 'Evaluation & AI Verification',
      icon: CheckSquare,
      items: [
        { name: 'Confidence Audit Queue', href: '/admin/confidence', icon: ShieldCheck },
        { name: 'Counterfactual AI Engine', href: '/admin/counterfactual', icon: Sparkles, badge: 'AI' },
      ]
    },
    {
      id: 'admin-analytics',
      name: 'Academic & Learning Analytics',
      icon: TrendingUp,
      items: [
        { name: 'Student 360° Profiles', href: '/admin/profiles-360', icon: User },
        { name: 'Revision Adherence Trends', href: '/admin/revision-analytics', icon: Calendar },
      ]
    },
    {
      id: 'admin-faculty',
      name: 'Faculty & Teaching Quality',
      icon: GraduationCap,
      items: [
        { name: 'Class Doubts & Misconceptions', href: '/admin/doubts', icon: HelpCircle, badge: 'AI' },
        { name: 'Programmes & Curricula', href: '/admin/academics', icon: BookOpen },
      ]
    },
    {
      id: 'admin-career',
      name: 'Placements & Career Hub',
      icon: Briefcase,
      items: [
        { name: 'Career & Placement Prediction', href: '/admin/career-overview', icon: Compass, badge: 'AI' },
        { name: 'Blockchain Credentials', href: '/admin/certificates', icon: Award },
        { name: 'Corporate Industry Partnerships', href: '/admin/partnerships', icon: Building },
      ]
    },
    {
      id: 'admin-gamification',
      name: 'Campus Life & Gamification',
      icon: Trophy,
      items: [
        { name: 'Inter-College Competitions', href: '/admin/competitions', icon: Radio, badge: 'Live' },
        { name: 'Student Quests & Points', href: '/admin/gamification', icon: Sparkles },
      ]
    },
    {
      id: 'admin-campus',
      name: 'Operations & Campus Services',
      icon: Building,
      items: [
        { name: 'Institutions Governance', href: '/admin/institutions', icon: Building },
        { name: 'AI Fee Ledger & Radar', href: '/admin/fees', icon: CreditCard },
      ]
    },
    {
      id: 'admin-security',
      name: 'Wellbeing, Audit & Security',
      icon: Heart,
      items: [
        { name: 'Campus Wellness Sentinel', href: '/admin/wellness-overview', icon: Heart },
        { name: 'Emotion & Stress Telemetry', href: '/admin/emotion', icon: Activity, badge: 'AI' },
        { name: 'Institutional Broadcasts', href: '/admin/notifications', icon: Bell },
        { name: 'System Audit Logs', href: '/admin/audit-logs', icon: Shield },
        { name: 'Sign Out', href: '#signout', icon: LogOut, action: 'logout' },
      ]
    }
  ];

  // Active module selection based on role
  const activeModules = role === 'student' ? studentModules : role === 'admin' ? adminModules : null;

  // Helper to determine which module is active based on current pathname
  const getActiveModuleId = () => {
    if (!activeModules) return null;
    for (const mod of activeModules) {
      if (mod.items.some(item => {
        if (item.action === 'logout') return false;
        if (item.href === '/student/dashboard' || item.href === '/admin/dashboard') {
          return pathname === item.href;
        }
        const cleanHref = item.href.split('?')[0];
        return pathname === cleanHref || (pathname.startsWith(cleanHref) && cleanHref !== '/student' && cleanHref !== '/admin');
      })) {
        return mod.id;
      }
    }
    return activeModules[0]?.id || null;
  };

  // Only the active module is expanded by default
  const [expandedModule, setExpandedModule] = useState<string | null>(() => getActiveModuleId());

  // Automatically update expanded module when route changes
  useEffect(() => {
    const activeId = getActiveModuleId();
    if (activeId) {
      setExpandedModule(activeId);
    }
  }, [pathname, role]);

  const toggleModule = (id: string) => {
    setExpandedModule(prev => (prev === id ? null : id));
  };

  // Faculty navigation list
  const facultyNav = [
    { name: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'Class Conceptual Doubts', href: '/faculty/class-doubts', icon: HelpCircle },
    { name: 'Student 360° Inspector', href: '/faculty/student-360', icon: User },
    { name: 'Class Revision Adherence', href: '/faculty/revision-trends', icon: Calendar },
    { name: 'Proctoring Review Queue', href: '/faculty/proctoring', icon: Shield },
    { name: 'Emotion & Stress Analytics', href: '/faculty/emotion', icon: Heart },
    { name: 'Voice Answer Review', href: '/faculty/voice-review', icon: Mic },
    { name: 'Counterfactual Review', href: '/faculty/counterfactual', icon: Sparkles },
    { name: 'CO-to-Skill Mapping', href: '/faculty/skills-mapping', icon: Target },
    { name: 'Confidence Audit Queue', href: '/faculty/confidence-audit', icon: ShieldCheck },
    { name: 'Examinations', href: '/faculty/examinations', icon: FileText },
    { name: 'Evaluation', href: '/faculty/evaluation', icon: CheckSquare },
    { name: 'Question Bank', href: '/faculty/question-bank', icon: HelpCircle },
    { name: 'AI Question Calibration', href: '/faculty/calibration', icon: Brain },
    { name: 'Plagiarism & Semantic Review', href: '/faculty/plagiarism', icon: ShieldCheck },
    { name: 'Analytics & OBE Hub', href: '/faculty/analytics', icon: History },
  ];

  return (
    <aside
      className={clsx(
        'bg-card border-r flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 select-none',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Sidebar Header with Brand + Collapse Toggle */}
      <div className="p-3.5 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="font-black text-sm leading-tight text-foreground tracking-tight">
                RKV NEXUS AI
              </h1>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                {role} Portal 2026
              </span>
            </div>
          )}
        </div>

        {/* Collapsible button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Body */}
      <nav className="flex-1 p-2.5 space-y-1.5 overflow-y-auto sidebar-scrollbar">
        {activeModules ? (
          /* 10 CLEAN MODULES WITH COLLAPSIBLE ACCORDIONS (STUDENT & ADMIN) */
          activeModules.map((mod, index) => {
            const ModuleIcon = mod.icon;
            const isExpanded = expandedModule === mod.id;
            const hasActiveChild = mod.items.some(item => {
              if (item.action === 'logout') return false;
              if (item.href === '/student/dashboard' || item.href === '/admin/dashboard') {
                return pathname === item.href;
              }
              const cleanHref = item.href.split('?')[0];
              return pathname === cleanHref || (pathname.startsWith(cleanHref) && cleanHref !== '/student' && cleanHref !== '/admin');
            });

            if (isCollapsed) {
              return (
                <div key={mod.id} className="relative group">
                  <button
                    onClick={() => {
                      setIsCollapsed(false);
                      setExpandedModule(mod.id);
                    }}
                    title={mod.name}
                    className={clsx(
                      'w-full flex items-center justify-center p-2.5 rounded-xl transition-all relative',
                      hasActiveChild
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <ModuleIcon className="w-4 h-4" />
                    {hasActiveChild && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                </div>
              );
            }

            return (
              <div key={mod.id} className="rounded-xl transition-all">
                {/* Module Group Header */}
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className={clsx(
                    'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all duration-200 group',
                    hasActiveChild
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                      : isExpanded
                      ? 'bg-muted/60 text-foreground'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={clsx(
                        'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        hasActiveChild
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isExpanded
                          ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                          : 'bg-muted text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      <ModuleIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                      {index + 1}. {mod.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <span
                      className={clsx(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                        hasActiveChild
                          ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {mod.items.length}
                    </span>
                    <ChevronDown
                      className={clsx(
                        'w-3.5 h-3.5 transition-transform duration-200',
                        isExpanded ? 'rotate-0 text-indigo-500' : '-rotate-90 text-muted-foreground/60'
                      )}
                    />
                  </div>
                </button>

                {/* Sub-items accordion body */}
                {isExpanded && (
                  <div className="mt-1 pl-2.5 space-y-0.5 border-l-2 border-indigo-500/20 ml-3.5 my-1">
                    {mod.items.map((item) => {
                      const Icon = item.icon;
                      const cleanHref = item.href.split('?')[0];
                      const isItemActive = (item.href === '/student/dashboard' || item.href === '/admin/dashboard')
                        ? pathname === item.href
                        : pathname === cleanHref || (pathname.startsWith(cleanHref) && cleanHref !== '/student' && cleanHref !== '/admin');

                      if (item.action === 'logout') {
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      }

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={clsx(
                            'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all relative group',
                            isItemActive
                              ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-bold border-l-2 border-indigo-600 dark:border-indigo-400 pl-2 shadow-sm shadow-indigo-500/10'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium pl-2.5'
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Icon
                              className={clsx(
                                'w-3.5 h-3.5 shrink-0 transition-colors',
                                isItemActive
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-muted-foreground/70 group-hover:text-foreground'
                              )}
                            />
                            <span className="truncate text-[11.5px]">{item.name}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {item.badge && (
                              <span
                                className={clsx(
                                  'text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none tracking-tight',
                                  isItemActive
                                    ? 'bg-indigo-600 text-white'
                                    : item.badge === 'AI'
                                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                                    : item.badge === 'Live' || item.badge === 'LIVE'
                                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                                    : item.badge === 'Pending'
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                            {item.isNew && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* FACULTY NAV */
          <div className="space-y-1">
            {facultyNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center rounded-xl text-xs font-semibold transition-colors',
                    isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2',
                    isActive
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-3 border-t shrink-0 bg-card/60 backdrop-blur-sm">
        <button
          onClick={logout}
          className={clsx(
            'w-full flex items-center rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors',
            isCollapsed ? 'justify-center p-2.5' : 'space-x-2.5 px-3 py-2'
          )}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
