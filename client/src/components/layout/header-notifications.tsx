'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, X, ShieldAlert, Book, Clipboard, Award, User as UserIcon, Brain, Megaphone, Briefcase, Notebook, TriangleAlert } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/providers/auth-provider';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  created_at: string;
  is_read: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
  ACADEMIC: Book,
  EXAMINATION: Clipboard,
  RESULTS: Award,
  FACULTY: UserIcon,
  LEARNING_PLAN: Brain,
  ANNOUNCEMENT: Megaphone,
  PLACEMENT: Briefcase,
  ASSIGNMENT: Notebook,
  WARNING: TriangleAlert,
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-500 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-amber-500 text-white',
  LOW: 'bg-green-500 text-white',
};

export function HeaderNotifications() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      // Students fetch their list. Admins/Faculty see their sent list.
      // So only students show the bell unread list.
      const isStudent = user?.roles.includes('STUDENT');
      if (!isStudent) return;

      const data = await apiClient<NotificationItem[]>('/notifications?read=unread');
      setNotifications(data.slice(0, 5));
      setUnreadCount(data.length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Setup SSE real-time stream
    const isStudent = user?.roles.includes('STUDENT');
    if (!isStudent) return;

    // Use absolute URL or relative URL for EventSource (cookies are passed implicitly)
    const eventSource = new EventSource('/api/v1/notifications/stream', {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ping') return;

        // New notification received
        setNotifications((prev) => [
          {
            id: data.id,
            title: data.title,
            message: data.message,
            category: data.category,
            priority: data.priority,
            created_at: data.created_at,
            is_read: false,
          },
          ...prev.slice(0, 4),
        ]);
        setUnreadCount((c) => c + 1);
      } catch (err) {
        console.error('Failed to parse SSE notification', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE disconnected, connection will retry automatically.', err);
    };

    // Also fallback to polling
    const interval = setInterval(fetchNotifications, 20000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [user]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await apiClient('/notifications/read-all', { method: 'PATCH' });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const markSingleRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await apiClient(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  // Only show the Notification Bell for Student Role
  if (!user?.roles.includes('STUDENT')) {
    return null;
  }

  const viewAllHref = '/student/notifications';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 flex items-center justify-center bg-destructive text-[10px] font-bold text-destructive-foreground rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b flex items-center justify-between bg-muted/40">
            <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
                <Bell className="w-8 h-8 text-muted/50" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs">No unread notifications.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = CATEGORY_ICONS[notif.category] || Megaphone;
                return (
                  <div
                    key={notif.id}
                    className="p-4 hover:bg-muted/50 transition-colors flex gap-3 relative group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                          {notif.title}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${PRIORITY_COLORS[notif.priority] || 'bg-muted text-muted-foreground'}`}>
                          {notif.priority}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground block mt-1">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <button
                      onClick={(e) => markSingleRead(notif.id, e)}
                      className="absolute right-3 top-4 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-full"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t bg-muted/20 text-center">
            <Link
              href={viewAllHref}
              onClick={() => setIsOpen(false)}
              className="text-xs text-primary hover:underline font-semibold"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
