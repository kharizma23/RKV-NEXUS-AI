'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Clock, ArrowRight, CheckCircle2, AlertCircle, Info, Sparkles, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  created_at: string;
  is_read: boolean;
}

interface StudentNotificationsTimelineProps {
  notifications: NotificationItem[];
}

export function StudentNotificationsTimeline({ notifications = [] }: StudentNotificationsTimelineProps) {
  // Determine dot color based on category and priority
  const getDotStyle = (item: NotificationItem) => {
    const p = (item.priority || '').toUpperCase();
    const c = (item.category || '').toUpperCase();

    if (p === 'HIGH' || p === 'URGENT' || c === 'EXAMINATION') {
      return {
        dot: 'bg-rose-500 shadow-rose-500/50',
        ring: 'border-rose-500/30 bg-rose-500/10 text-rose-500',
        badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
        label: 'Urgent',
      };
    }
    if (c === 'RESULT' || c === 'ACHIEVEMENT' || c === 'BADGE') {
      return {
        dot: 'bg-emerald-500 shadow-emerald-500/50',
        ring: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
        badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
        label: 'Academic Success',
      };
    }
    return {
      dot: 'bg-blue-500 shadow-blue-500/50',
      ring: 'border-blue-500/30 bg-blue-500/10 text-blue-500',
      badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
      label: 'Campus Broadcast',
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-foreground">
                Broadcasts & Live Alerts
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium">
                Official notifications & academic circulars
              </p>
            </div>
          </div>

          <Link
            href="/student/notifications"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Content list or Empty State */}
        <div className="pt-4">
          {notifications.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-500 flex items-center justify-center mb-3 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-foreground">You&apos;re all caught up!</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                No pending broadcasts or unread alerts for your semester cohort.
              </p>
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
              {notifications.slice(0, 4).map((n) => {
                const style = getDotStyle(n);
                return (
                  <div
                    key={n.id}
                    className="relative pl-7 group transition-all duration-200"
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-[7px] top-3.5 w-3 h-3 -translate-x-1/2 rounded-full border-2 border-background ${style.dot} ring-2 ring-background transition-transform group-hover:scale-125`}
                    />

                    {/* Timeline Card */}
                    <div className="p-3 rounded-2xl border border-white/30 dark:border-white/5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-md group-hover:bg-white/80 dark:group-hover:bg-slate-800/80 transition-all duration-200 shadow-sm hover:shadow">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {n.title}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${style.badge}`}>
                          {style.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1 leading-snug">
                        {n.message}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-muted-foreground/80">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Shortcuts */}
      <div className="mt-5 pt-3.5 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <Link
          href="/student/examinations"
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Upcoming Examinations</span>
        </Link>
        <Link
          href="/student/study-plan"
          className="font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <span>Personalized Study Plan</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}
