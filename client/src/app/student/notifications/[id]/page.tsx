'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import {
  Bell, ArrowLeft, Download, Calendar, ArrowUpRight, Clock, User as UserIcon, BookOpen, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

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

export default function StudentNotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const notifId = params.id as string;
  
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotification = async () => {
      setIsLoading(true);
      try {
        const data = await apiClient<NotificationItem>(`/notifications/${notifId}`);
        setNotification(data);
        
        // Auto mark read when opening detail page
        if (data && !data.is_read) {
          await apiClient(`/notifications/${notifId}/read`, { method: 'PATCH' });
        }
      } catch (err) {
        console.error('Failed to load notification details', err);
        setError('Notification not found or access denied.');
      } finally {
        setIsLoading(false);
      }
    };

    if (notifId) {
      fetchNotification();
    }
  }, [notifId]);

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="student">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 animate-bounce" />
            <p className="text-xs text-muted-foreground">Loading Alert Details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !notification) {
    return (
      <DashboardLayout requiredRole="student">
        <div className="max-w-md mx-auto text-center space-y-4 py-12">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Alert Unavailable</h2>
          <p className="text-sm text-muted-foreground">{error || 'Unable to retrieve notification.'}</p>
          <Button variant="outline" onClick={() => router.push('/student/notifications')}>
            Back to Inbox
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="student">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => router.push('/student/notifications')}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Notification Center
        </button>

        <Card className="overflow-hidden border">
          {/* Header */}
          <div className="p-6 border-b bg-muted/20">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                notification.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                notification.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                'bg-muted text-muted-foreground'
              }`}>
                {notification.priority}
              </span>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">
                {notification.category.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-black text-foreground">{notification.title}</h1>
            
            <div className="flex gap-4 text-xs text-muted-foreground mt-4 flex-wrap border-t pt-4">
              <span className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /> Sender: {notification.sender?.full_name || 'System / AI'}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Sent: {new Date(notification.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Body */}
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Details</h3>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{notification.message}</p>
            </div>

            {/* Attachments */}
            {notification.attachments && notification.attachments.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attachments</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {notification.attachments.map((file) => (
                    <a
                      key={file.id}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/40 hover:bg-muted/70 transition-all text-xs"
                    >
                      <span className="truncate max-w-[200px] font-semibold text-foreground">{file.file_name}</span>
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          {/* Actions Footer */}
          <div className="p-4 border-t bg-muted/20 flex flex-wrap justify-between items-center gap-3">
            <div className="flex gap-2">
              {notification.category === 'EXAMINATION' && (
                <Link href="/student/examinations" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs transition-colors">
                  Open Examinations Portal <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
              {notification.category === 'ASSIGNMENT' && (
                <Link href="/student/learning-plan" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary hover:bg-primary/95 text-white font-semibold text-xs transition-colors">
                  Open Learning Plan <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={() => router.push('/student/notifications')}>
              Return to Inbox
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
