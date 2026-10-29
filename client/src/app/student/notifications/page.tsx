'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import {
  Bell, Check, Archive, Trash2, Calendar, FileText, Download, Filter, Search, Sparkles, Sliders, CheckSquare, RefreshCw,
  Book, Clipboard, Award, User as UserIcon, Brain, Megaphone, Briefcase, Notebook, TriangleAlert, Eye, Settings, Clock, ListFilter,
  Star, Pin, CalendarDays, ArrowRight, ArrowUpRight, X, ChevronRight, Bookmark, Share2, MapPin, GraduationCap, Building2, CheckCircle2
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  sender_type: string;
  created_at: string;
  is_read: boolean;
  is_archived: boolean;
  is_starred: boolean;
  is_pinned: boolean;
  sender?: { full_name: string };
  attachments: Array<{ id: string; file_name: string; file_url: string }>;
}

interface NotificationSettings {
  id: string;
  exam_notifications: boolean;
  result_notifications: boolean;
  assignment_notifications: boolean;
  faculty_notifications: boolean;
  learning_notifications: boolean;
  placement_notifications: boolean;
  announcement_notifications: boolean;
  email_notifications: boolean;
  browser_notifications: boolean;
}

interface DailyAISummary {
  assignments_completed: number;
  hours_studied: number;
  exam_readiness: number;
  weak_topics: string[];
  recommended_practice: string[];
  upcoming_deadlines: Array<{ title: string; due_at: string; days_left: number }>;
}

interface PlacementDetails {
  company_name: string;
  company_logo: string;
  role: string;
  package: string;
  location: string;
  eligible_departments: string[];
  min_cgpa: number;
  deadline: string;
  drive_date: string;
  type: string;
  campus_type: string;
  status: string;
  jd: string;
  responsibilities: string;
  skills: string[];
  selection_process: string;
  recruiter_contact: string;
}

const CATEGORIES = [
  { value: 'ALL', label: 'All Categories', icon: Bell },
  { value: 'ACADEMIC', label: 'Academic', icon: Book },
  { value: 'EXAMINATION', label: 'Examination', icon: Clipboard },
  { value: 'RESULTS', label: 'Results', icon: Award },
  { value: 'FACULTY', label: 'Faculty Messages', icon: UserIcon },
  { value: 'LEARNING_PLAN', label: 'Learning Plan', icon: Brain },
  { value: 'ASSIGNMENT', label: 'Assignment', icon: Notebook },
  { value: 'ANNOUNCEMENT', label: 'Announcements', icon: Megaphone },
  { value: 'PLACEMENT', label: 'Placement', icon: Briefcase },
];

const PRIORITIES = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const DATE_FILTERS = [
  { value: 'ALL', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
];

const CATEGORY_ICONS: Record<string, any> = {
  ACADEMIC: Book,
  EXAMINATION: Clipboard,
  RESULTS: Award,
  FACULTY: UserIcon,
  LEARNING_PLAN: Brain,
  ASSIGNMENT: Notebook,
  ANNOUNCEMENT: Megaphone,
  PLACEMENT: Briefcase,
};

const PRIORITY_BADGES: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
  HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  LOW: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  'Registration Open': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Upcoming': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Deadline Soon': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Registration Closed': 'bg-red-500/10 text-red-500 border-red-500/20',
  'Interview Scheduled': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Completed': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function StudentNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived' | 'important' | 'settings'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  // Placement Filters
  const [placementCompany, setPlacementCompany] = useState('ALL');
  const [placementPackage, setPlacementPackage] = useState('ALL');
  const [placementCgpa, setPlacementCgpa] = useState('ALL');
  const [placementType, setPlacementType] = useState('ALL');

  // Local placement registrations & bookmarks
  const [registeredJobs, setRegisteredJobs] = useState<Record<string, boolean>>({});
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Record<string, boolean>>({});
  const [registeringJobId, setRegisteringJobId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    critical: 0,
    upcomingDeadlines: 0,
  });

  // Settings
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  // AI Summary
  const [aiSummary, setAiSummary] = useState<DailyAISummary | null>(null);

  // Modal detail view
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let url = '/notifications?';
      if (activeTab === 'unread') url += 'read=unread&';
      else if (activeTab === 'important') url += 'read=important&';
      else if (activeTab === 'archived') url += 'archive=archived&';

      if (selectedCategory !== 'ALL') url += `category=${selectedCategory}&`;
      if (selectedPriority !== 'ALL') url += `priority=${selectedPriority}&`;
      if (dateFilter !== 'ALL') url += `date_filter=${dateFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const notifsData = await apiClient<NotificationItem[]>(url);
      setNotifications(notifsData);

      // Fetch stats
      const allNotifs = await apiClient<NotificationItem[]>('/notifications');
      const unreadCount = allNotifs.filter(n => !n.is_read).length;
      const criticalCount = allNotifs.filter(n => n.priority === 'CRITICAL' && !n.is_read).length;
      const deadlineCount = allNotifs.filter(n => ['ASSIGNMENT', 'EXAMINATION'].includes(n.category)).length;

      setStats({
        total: allNotifs.length,
        unread: unreadCount,
        read: allNotifs.length - unreadCount,
        critical: criticalCount,
        upcomingDeadlines: deadlineCount,
      });

      // Fetch Settings
      const settingsData = await apiClient<NotificationSettings>('/notifications/settings');
      setSettings(settingsData);

      // Fetch AI summary
      const aiData = await apiClient<DailyAISummary>('/notifications/ai-summary');
      setAiSummary(aiData);
    } catch (err) {
      console.error('Error loading notification data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'settings') {
      loadData();
    }
  }, [activeTab, selectedCategory, selectedPriority, dateFilter, search]);

  const handleAction = async (id: string, action: 'read' | 'archive' | 'delete' | 'star' | 'pin') => {
    try {
      if (action === 'read') {
        await apiClient(`/notifications/${id}/read`, { method: 'PATCH' });
      } else if (action === 'archive') {
        await apiClient(`/notifications/${id}/archive`, { method: 'PATCH' });
      } else if (action === 'delete') {
        await apiClient(`/notifications/${id}`, { method: 'DELETE' });
      } else if (action === 'star') {
        await apiClient(`/notifications/${id}/star`, { method: 'PATCH' });
      } else if (action === 'pin') {
        await apiClient(`/notifications/${id}/pin`, { method: 'PATCH' });
      }
      loadData();
    } catch (err) {
      console.error(`Failed to perform action: ${action}`, err);
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient('/notifications/read-all', { method: 'PATCH' });
      loadData();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleAnalyzeStats = async () => {
    setIsAiLoading(true);
    try {
      await apiClient('/notifications/ai-trigger', { method: 'POST' });
      await loadData();
    } catch (err) {
      console.error('Failed to trigger AI review', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpdateSetting = async (key: keyof NotificationSettings, val: boolean) => {
    if (!settings) return;
    try {
      const updated = await apiClient<NotificationSettings>('/notifications/settings', {
        method: 'PUT',
        body: JSON.stringify({ [key]: val }),
      });
      setSettings(updated);
    } catch (err) {
      console.error('Failed to update notification settings', err);
    }
  };

  const addToCalendar = (notif: NotificationItem) => {
    const calendarEvent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${notif.title}`,
      `DESCRIPTION:${notif.message}`,
      `DTSTART:${new Date(notif.created_at).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${new Date(new Date(notif.created_at).getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([calendarEvent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${notif.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Card click triggers (autofiltering)
  const clickTotal = () => {
    setActiveTab('all');
    setSelectedCategory('ALL');
    setSelectedPriority('ALL');
    setDateFilter('ALL');
  };

  const clickUnread = () => {
    setActiveTab('unread');
    setSelectedCategory('ALL');
    setSelectedPriority('ALL');
    setDateFilter('ALL');
  };

  const clickRead = () => {
    setActiveTab('all');
  };

  const clickCritical = () => {
    setActiveTab('all');
    setSelectedPriority('CRITICAL');
  };

  const clickDeadlines = () => {
    setActiveTab('all');
    setSelectedCategory('EXAMINATION');
  };

  const parsePlacement = (msg: string): PlacementDetails => {
    try {
      return JSON.parse(msg);
    } catch (e) {
      return {
        company_name: "Apex Placements",
        company_logo: "Apex",
        role: "Associate Software Engineer",
        package: "6.5 LPA",
        location: "On-Campus",
        eligible_departments: ["CSE", "IT", "ECE"],
        min_cgpa: 7.0,
        deadline: "2026-08-20",
        drive_date: "2026-08-25",
        type: "Full Time",
        campus_type: "On Campus",
        status: "Registration Open",
        jd: msg,
        responsibilities: "Collaborate with technology teams to design, evaluate and build scalable microservices.",
        skills: ["Algorithms", "Problem Solving", "Java/Python"],
        selection_process: "1. Online Test, 2. Technical Interview, 3. HR Assessment",
        recruiter_contact: "placements@apex.edu"
      };
    }
  };

  const handleRegisterJob = (id: string) => {
    setRegisteredJobs({ ...registeredJobs, [id]: true });
    setRegisteringJobId(null);
  };

  const toggleBookmarkJob = (id: string) => {
    setBookmarkedJobs({ ...bookmarkedJobs, [id]: !bookmarkedJobs[id] });
  };

  // Filtered Notifications based on standard filters + Placement Specific Filters
  const filteredNotifications = notifications.filter((notif) => {
    if (selectedCategory === 'PLACEMENT') {
      const details = parsePlacement(notif.message);
      
      // Company name check
      if (placementCompany !== 'ALL' && !details.company_name.toLowerCase().includes(placementCompany.toLowerCase())) {
        return false;
      }
      // Package check
      if (placementPackage !== 'ALL') {
        const pkgVal = parseFloat(details.package);
        if (placementPackage === 'high' && pkgVal < 7.0) return false;
        if (placementPackage === 'medium' && (pkgVal >= 7.0 || pkgVal < 5.0)) return false;
        if (placementPackage === 'low' && pkgVal >= 5.0) return false;
      }
      // CGPA Check
      if (placementCgpa !== 'ALL') {
        const cgpaVal = details.min_cgpa;
        if (placementCgpa === '8' && cgpaVal < 8.0) return false;
        if (placementCgpa === '7' && cgpaVal < 7.0) return false;
      }
      // Internship vs Full Time
      if (placementType !== 'ALL' && details.type.toUpperCase() !== placementType.toUpperCase()) {
        return false;
      }
    }
    return true;
  });

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-8">
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bell className="w-8 h-8 text-primary animate-pulse" /> Academic Communication Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time updates, AI smart learning prompts, assessment alerts, and grade reviews.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAnalyzeStats}
              disabled={isAiLoading}
              variant="outline"
              className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-semibold flex items-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
              {isAiLoading ? 'Analyzing Performance...' : 'Analyze Academic Risk'}
            </Button>
            <Button
              variant="outline"
              onClick={markAllRead}
              className="flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" /> Mark All Read
            </Button>
          </div>
        </div>

        {/* Dashboard Stats summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card onClick={clickTotal} className="bg-card hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer transform hover:-translate-y-0.5 duration-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Alerts</p>
                <p className="text-xl font-black text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card onClick={clickUnread} className="bg-card border-red-500/10 hover:bg-muted/30 hover:border-red-500/30 transition-all cursor-pointer transform hover:-translate-y-0.5 duration-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Unread</p>
                <p className="text-xl font-black text-red-500">{stats.unread}</p>
              </div>
            </CardContent>
          </Card>
          <Card onClick={clickRead} className="bg-card border-green-500/10 hover:bg-muted/30 hover:border-green-500/30 transition-all cursor-pointer transform hover:-translate-y-0.5 duration-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Read</p>
                <p className="text-xl font-black text-green-500">{stats.read}</p>
              </div>
            </CardContent>
          </Card>
          <Card onClick={clickCritical} className="bg-card border-red-500/20 hover:bg-muted/30 hover:border-red-500/50 transition-all cursor-pointer transform hover:-translate-y-0.5 duration-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center">
                <TriangleAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Critical Alerts</p>
                <p className="text-xl font-black text-red-600 dark:text-red-400">{stats.critical}</p>
              </div>
            </CardContent>
          </Card>
          <Card onClick={clickDeadlines} className="bg-card border-cyan-500/15 hover:bg-muted/30 hover:border-cyan-500/30 transition-all cursor-pointer transform hover:-translate-y-0.5 duration-200 col-span-2 lg:col-span-1">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deadlines</p>
                <p className="text-xl font-black text-cyan-500">{stats.upcomingDeadlines}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left panel: Filters & AI summary */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-primary" /> Advanced Filters
                </h3>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={selectedCategory === 'PLACEMENT' ? "Search company, role, package..." : "Search title, subject, faculty..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                {/* Placement Specific Filters */}
                {selectedCategory === 'PLACEMENT' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Package Range</label>
                      <select
                        value={placementPackage}
                        onChange={(e) => setPlacementPackage(e.target.value)}
                        className="w-full text-xs bg-background border rounded-md px-2 py-2"
                      >
                        <option value="ALL">All Packages</option>
                        <option value="high">Above 7 LPA</option>
                        <option value="medium">5.0 LPA - 7.0 LPA</option>
                        <option value="low">Below 5.0 LPA</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CGPA Criteria</label>
                      <select
                        value={placementCgpa}
                        onChange={(e) => setPlacementCgpa(e.target.value)}
                        className="w-full text-xs bg-background border rounded-md px-2 py-2"
                      >
                        <option value="ALL">All CGPA</option>
                        <option value="8">8.0+ CGPA</option>
                        <option value="7">7.0+ CGPA</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Drive Type</label>
                      <select
                        value={placementType}
                        onChange={(e) => setPlacementType(e.target.value)}
                        className="w-full text-xs bg-background border rounded-md px-2 py-2"
                      >
                        <option value="ALL">All Types</option>
                        <option value="full time">Full Time</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Standard Priority Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</label>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="w-full text-xs bg-background border rounded-md px-2 py-2"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date filter */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date Created</label>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full text-xs bg-background border rounded-md px-2 py-2"
                      >
                        {DATE_FILTERS.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* View Mode Toggle */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">View Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="w-full text-xs"
                    >
                      Card List
                    </Button>
                    <Button
                      variant={viewMode === 'timeline' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('timeline')}
                      className="w-full text-xs"
                    >
                      Timeline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories filter */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Categories</h3>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = selectedCategory === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${isSelected ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        <span className="flex items-center gap-2">
                          <CatIcon className="w-3.5 h-3.5" />
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right panel: Tab views & Lists */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* View Tab selectors */}
            <div className="border-b flex items-center justify-between pb-1">
              <div className="flex items-center gap-6">
                {[
                  { id: 'all', label: 'All Alerts' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'important', label: 'Important' },
                  { id: 'archived', label: 'Archived' },
                  { id: 'settings', label: 'Alert Preferences' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 text-sm font-semibold relative transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content view */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-28 bg-card border rounded-lg animate-pulse p-4 space-y-3" />
                ))}
              </div>
            ) : activeTab === 'settings' ? (
              // Settings Tab
              <Card>
                <div className="p-6 border-b">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" /> Notification Preferences
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Configure channels and categories of academic notifications.</p>
                </div>
                <CardContent className="p-6 space-y-8">
                  {settings ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'exam_notifications', label: 'Exam Alerts & Schedules' },
                        { key: 'result_notifications', label: 'Results Releases' },
                        { key: 'assignment_notifications', label: 'Assignments & Deadlines' },
                        { key: 'faculty_notifications', label: 'Faculty Direct Messages' },
                        { key: 'learning_notifications', label: 'AI Study Reminders' },
                        { key: 'placement_notifications', label: 'Placement Drives' },
                        { key: 'announcement_notifications', label: 'Announcements' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                          <input
                            type="checkbox"
                            checked={(settings as any)[item.key]}
                            onChange={(e) => handleUpdateSetting(item.key as any, e.target.checked)}
                            className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary border-muted-foreground/30"
                          />
                          <label className="text-xs font-semibold text-foreground block cursor-pointer">{item.label}</label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">Failed to load settings.</div>
                  )}
                </CardContent>
              </Card>
            ) : filteredNotifications.length === 0 ? (
              // Empty State - Customized for Placement
              <div className="bg-card border rounded-xl p-16 text-center space-y-4 max-w-lg mx-auto mt-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <Briefcase className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="font-bold text-lg text-foreground">No placement notifications available</h3>
                <p className="text-sm text-muted-foreground">Check back later for upcoming campus drives and internship listings.</p>
                <Button variant="outline" onClick={loadData}>Refresh Placement Board</Button>
              </div>
            ) : (
              // List View Mode
              <div className="space-y-4">
                {filteredNotifications.map((notif) => {
                  const Icon = CATEGORY_ICONS[notif.category] || Megaphone;
                  
                  // specialized placement layout
                  if (notif.category === 'PLACEMENT') {
                    const details = parsePlacement(notif.message);
                    const isRegistered = registeredJobs[notif.id];
                    const isBookmarked = bookmarkedJobs[notif.id];
                    
                    return (
                      <Card
                        key={notif.id}
                        className={`hover:shadow-md transition-shadow relative border-l-4 ${
                          details.status === 'Registration Open' ? 'border-l-green-500' :
                          details.status === 'Upcoming' ? 'border-l-blue-500' :
                          details.status === 'Deadline Soon' ? 'border-l-orange-500' :
                          details.status === 'Interview Scheduled' ? 'border-l-purple-500' :
                          'border-l-gray-400'
                        }`}
                      >
                        <CardContent className="p-5 flex gap-4">
                          {/* Left Avatar for Logo */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-primary/5 text-primary border flex items-center justify-center font-bold text-sm">
                              {details.company_logo}
                            </div>
                          </div>

                          {/* Center Metadata Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                                  {details.company_name} <ChevronRight className="w-4 h-4 text-muted-foreground" /> <span className="font-semibold text-sm text-muted-foreground">{details.role}</span>
                                </h3>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${STATUS_COLORS[details.status] || 'bg-muted text-muted-foreground'}`}>
                                  {details.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                Deadline: {new Date(details.deadline).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Custom metadata grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 p-2.5 rounded-lg border text-xs">
                              <div>
                                <span className="text-muted-foreground block text-[9px] uppercase tracking-wide">Stipend / Package</span>
                                <span className="font-bold text-foreground">{details.package}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[9px] uppercase tracking-wide">Location</span>
                                <span className="font-semibold text-foreground flex items-center gap-0.5"><MapPin className="w-3 h-3 text-red-500" /> {details.location}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[9px] uppercase tracking-wide">Eligibility CGPA</span>
                                <span className="font-bold text-foreground flex items-center gap-0.5"><GraduationCap className="w-3.5 h-3.5 text-primary" /> {details.min_cgpa}+</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[9px] uppercase tracking-wide">Departments</span>
                                <span className="font-bold text-primary truncate block">{details.eligible_departments.join(', ')}</span>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground">{details.jd}</p>

                            {/* Placement Actions */}
                            <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-3">
                              <div className="flex items-center gap-4 text-xs font-bold text-primary">
                                <button onClick={() => setSelectedNotif(notif)} className="hover:underline flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5" /> View Details
                                </button>
                                
                                <button onClick={() => toggleBookmarkJob(notif.id)} className="hover:underline text-yellow-600 flex items-center gap-1">
                                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                                </button>

                                <button onClick={() => alert(`Job listing details copied! Share link: http://localhost:3000/student/notifications/${notif.id}`)} className="hover:underline text-cyan-600 flex items-center gap-1">
                                  <Share2 className="w-3.5 h-3.5" /> Share
                                </button>
                              </div>

                              <div className="flex gap-2">
                                {isRegistered ? (
                                  <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded border border-green-500/20 font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Registered Successfully
                                  </span>
                                ) : (
                                  <Button
                                    onClick={() => setRegisteringJobId(notif.id)}
                                    size="sm"
                                    disabled={details.status === 'Registration Closed'}
                                    className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 h-auto"
                                  >
                                    Register Now
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  // Fallback standard render for other categories
                  return (
                    <Card
                      key={notif.id}
                      className={`hover:shadow-md transition-shadow relative overflow-hidden ${!notif.is_read ? 'border-l-4 border-l-primary' : ''} ${notif.is_pinned ? 'border-t border-t-amber-500/50 bg-amber-500/[0.01]' : ''}`}
                    >
                      <CardContent className="p-5 flex gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${notif.is_pinned ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 flex-wrap mb-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              {notif.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                              <h3 className="font-bold text-sm text-foreground truncate max-w-[250px] sm:max-w-md">
                                {notif.title}
                              </h3>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border uppercase tracking-wider font-bold ${PRIORITY_BADGES[notif.priority] || 'bg-muted text-muted-foreground'}`}>
                                {notif.priority}
                              </span>
                              <span className="text-[9px] bg-muted/65 text-muted-foreground px-2 py-0.5 rounded font-semibold capitalize">
                                {notif.category.toLowerCase().replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {notif.message}
                          </p>

                          {/* Attachments */}
                          {notif.attachments && notif.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {notif.attachments.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[10px] font-medium text-foreground border border-muted-foreground/10 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 text-primary" />
                                  <span className="truncate max-w-[120px]">{file.file_name}</span>
                                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Action links */}
                          <div className="flex items-center gap-4 text-xs font-semibold text-primary">
                            <button
                              onClick={() => setSelectedNotif(notif)}
                              className="hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>

                            <button
                              onClick={() => handleAction(notif.id, 'pin')}
                              className="hover:underline text-amber-600 flex items-center gap-1"
                            >
                              <Pin className={`w-3.5 h-3.5 ${notif.is_pinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                              {notif.is_pinned ? 'Unpin' : 'Pin'}
                            </button>

                            <button
                              onClick={() => handleAction(notif.id, 'star')}
                              className="hover:underline text-yellow-600 flex items-center gap-1"
                            >
                              <Star className={`w-3.5 h-3.5 ${notif.is_starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                              {notif.is_starred ? 'Important' : 'Star'}
                            </button>

                            {['EXAMINATION', 'ASSIGNMENT'].includes(notif.category) && (
                              <button
                                onClick={() => addToCalendar(notif)}
                                className="hover:underline text-cyan-600 dark:text-cyan-400 flex items-center gap-1"
                              >
                                <Calendar className="w-3.5 h-3.5" /> Add to Calendar
                              </button>
                            )}

                            {!notif.is_read && (
                              <button
                                onClick={() => handleAction(notif.id, 'read')}
                                className="hover:underline text-green-600 dark:text-green-400 flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Mark Read
                              </button>
                            )}
                            
                            {!notif.is_archived && (
                              <button
                                onClick={() => handleAction(notif.id, 'archive')}
                                className="hover:underline text-amber-600 dark:text-amber-400 flex items-center gap-1"
                              >
                                <Archive className="w-3.5 h-3.5" /> Archive
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleAction(notif.id, 'delete')}
                              className="hover:underline text-destructive flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Registration Dialog */}
      {registeringJobId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm shadow-2xl border bg-card animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-primary" /> Confirm Campus Drive Registration</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                By registering, your academic credentials (CGPA, Department) will be verified and submitted to the selection committee. Are you sure you wish to register?
              </p>
              <div className="flex gap-3 justify-end border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => setRegisteringJobId(null)}>Cancel</Button>
                <Button variant="default" size="sm" onClick={() => handleRegisterJob(registeringJobId)}>Confirm Registration</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Viewer Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl shadow-2xl border bg-card animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {React.createElement(CATEGORY_ICONS[selectedNotif.category] || Megaphone, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-base truncate max-w-[280px] sm:max-w-md">{selectedNotif.title}</h2>
                  <span className="text-[10px] text-muted-foreground">Category: {selectedNotif.category.toLowerCase().replace('_', ' ')}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedNotif.category === 'PLACEMENT' ? (
              // Rich details for placement category
              (() => {
                const details = parsePlacement(selectedNotif.message);
                return (
                  <CardContent className="p-6 space-y-4 max-h-[450px] overflow-y-auto pr-2">
                    <div className="flex gap-3 bg-muted/40 p-3 rounded-lg border text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Package</span>
                        <span className="font-bold text-foreground">{details.package}</span>
                      </div>
                      <div className="border-l pl-3">
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Location</span>
                        <span className="font-bold text-foreground">{details.location}</span>
                      </div>
                      <div className="border-l pl-3">
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Min CGPA</span>
                        <span className="font-bold text-primary">{details.min_cgpa}+</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Job Description</label>
                      <p className="text-xs text-foreground leading-relaxed">{details.jd}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Roles & Responsibilities</label>
                      <p className="text-xs text-muted-foreground leading-relaxed">{details.responsibilities}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Key Skills</label>
                      <div className="flex flex-wrap gap-1">
                        {details.skills.map((skill, idx) => (
                          <span key={idx} className="text-[9px] bg-primary/10 text-primary border px-2 py-0.5 rounded font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Selection Process</label>
                      <p className="text-xs text-muted-foreground leading-relaxed">{details.selection_process}</p>
                    </div>

                    <div className="space-y-1 border-t pt-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recruiter Desk</label>
                      <p className="text-xs text-foreground">Contact: <span className="font-semibold text-primary">{details.recruiter_contact}</span></p>
                    </div>
                  </CardContent>
                );
              })()
            ) : (
              // Standard layout
              <CardContent className="p-6 space-y-6">
                <div className="flex gap-4 text-[10px] font-bold text-muted-foreground uppercase border-b pb-3">
                  <div>
                    Priority: <span className={`px-1.5 py-0.5 rounded border ml-1 ${PRIORITY_BADGES[selectedNotif.priority]}`}>{selectedNotif.priority}</span>
                  </div>
                  <div>
                    Date: <span className="text-foreground ml-1">{new Date(selectedNotif.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    Sender: <span className="text-foreground ml-1">{selectedNotif.sender?.full_name || 'System / AI'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Message</label>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedNotif.message}
                  </p>
                </div>

                {selectedNotif.attachments && selectedNotif.attachments.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">Attachments</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedNotif.attachments.map((file) => (
                        <a
                          key={file.id}
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 rounded border bg-muted/30 hover:bg-muted/60 transition-colors text-xs"
                        >
                          <span className="truncate max-w-[150px] font-medium text-foreground">{file.file_name}</span>
                          <Download className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
            
            <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
              {selectedNotif.category === 'EXAMINATION' && (
                <Link href="/student/examinations" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs transition-colors">
                  Open Related Exam <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
              {selectedNotif.category === 'ASSIGNMENT' && (
                <Link href="/student/learning-plan" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary hover:bg-primary/95 text-white font-semibold text-xs transition-colors">
                  Open Assignment <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
              {['EXAMINATION', 'ASSIGNMENT'].includes(selectedNotif.category) && (
                <Button variant="outline" size="sm" onClick={() => addToCalendar(selectedNotif)} className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                  <CalendarDays className="w-4 h-4" /> Add to Calendar
                </Button>
              )}
              <Button variant="default" size="sm" onClick={() => { handleAction(selectedNotif.id, 'read'); setSelectedNotif(null); }}>
                Dismiss & Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
