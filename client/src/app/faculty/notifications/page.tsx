'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import {
  Send, Trash2, FileText, Plus, Eye, BarChart3, Users, Clock, AlertTriangle, X, CheckCircle, Percent
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface SentNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  recipient_type: string;
  created_at: string;
  attachments: Array<{ id: string; file_name: string; file_url: string }>;
}

interface ReadReceipts {
  delivered_count: number;
  read_count: number;
  unread_count: number;
  read_percentage: number;
  unread_students: Array<{ id: string; full_name: string; email: string }>;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

export default function FacultyNotificationsPage() {
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New notification composer state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('ACADEMIC');
  const [priority, setPriority] = useState('MEDIUM');
  const [recipientType, setRecipientType] = useState('ALL');
  
  // Target segment details
  const [subjectId, setSubjectId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [recipientId, setRecipientId] = useState('');

  // Attachments
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [attachments, setAttachments] = useState<Array<{ file_name: string; file_url: string }>>([]);

  // Preview / Receipt states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [receipts, setReceipts] = useState<ReadReceipts | null>(null);
  const [selectedNotifForReceipts, setSelectedNotifForReceipts] = useState<SentNotification | null>(null);

  // Lists for targeting (mock lists or fetch from DB where possible)
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);

  // Chart Data states
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [readUnreadData, setReadUnreadData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);

  const loadSentNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<SentNotification[]>('/notifications');
      setSentNotifications(data);

      // Compute statistics and chart data
      const catsMap: Record<string, number> = {};
      data.forEach(n => {
        catsMap[n.category] = (catsMap[n.category] || 0) + 1;
      });
      setCategoryData(Object.entries(catsMap).map(([name, value]) => ({ name, value })));

      // Compute weekly broadcast activity from REAL notification timestamps
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayCounts: Record<string, number> = {};
      dayNames.forEach(d => { dayCounts[d] = 0; });
      data.forEach(n => {
        const day = dayNames[new Date(n.created_at).getDay()];
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });
      // Order Mon-Sun for display
      const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      setActivityData(orderedDays.map(d => ({ day: d, broadcasts: dayCounts[d] || 0 })));
    } catch (err) {
      console.error('Failed to load sent notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await apiClient<any[]>('/syllabus/units/00000000-0000-0000-0000-000000000000').catch(() => []);
      if (data && data.length > 0) {
        setSubjects(data.map(u => ({ id: u.subject_id, name: u.subject_title || 'Subject' })));
      } else {
        setSubjects([
          { id: '1e5e62bc-cf39-4458-9a3d-4c3e8006e8b1', name: 'DBMS (Database Management Systems)' },
          { id: '2f6e72bc-df40-4569-ba4e-5c4e9007e9b2', name: 'Digital Communication (ECE)' },
          { id: '3a7e82bc-ef41-4670-ca5f-6c5e0008e0b3', name: 'Operating Systems' },
          { id: '4b8e92bc-ff42-4781-da6g-7c6f1009f1b4', name: 'Machine Learning' }
        ]);
      }
    } catch (err) {
      console.error('Failed to load targeting lists', err);
    }
  };

  useEffect(() => {
    loadSentNotifications();
    fetchSubjects();
  }, []);

  const addAttachment = () => {
    if (fileName && fileUrl) {
      setAttachments([...attachments, { file_name: fileName, file_url: fileUrl }]);
      setFileName('');
      setFileUrl('');
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    if (!title || !message) return;

    try {
      const payload = {
        title,
        message,
        category,
        priority,
        recipient_type: recipientType,
        recipient_id: recipientId || null,
        programme_id: programmeId || null,
        semester_id: semesterId || null,
        subject_id: subjectId || null,
        attachments
      };

      await apiClient('/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // Reset form
      setTitle('');
      setMessage('');
      setCategory('ACADEMIC');
      setPriority('MEDIUM');
      setRecipientType('ALL');
      setSubjectId('');
      setSemesterId('');
      setProgrammeId('');
      setRecipientId('');
      setAttachments([]);

      setIsPreviewOpen(false);
      loadSentNotifications();
    } catch (err) {
      console.error('Failed to send broadcast', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this broadcast notification?')) return;
    try {
      await apiClient(`/notifications/${id}`, { method: 'DELETE' });
      loadSentNotifications();
      if (selectedNotifForReceipts?.id === id) {
        setSelectedNotifForReceipts(null);
        setReceipts(null);
      }
    } catch (err) {
      console.error('Failed to delete broadcast', err);
    }
  };

  const viewReadReceipts = async (notif: SentNotification) => {
    setSelectedNotifForReceipts(notif);
    setReceipts(null);
    try {
      const data = await apiClient<ReadReceipts>(`/notifications/analytics/${notif.id}`);
      setReceipts(data);

      setReadUnreadData([
        { name: 'Read', value: data.read_count },
        { name: 'Unread', value: data.unread_count }
      ]);
    } catch (err) {
      console.error('Failed to load read receipts analytics', err);
    }
  };

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Send className="w-8 h-8 text-primary" /> Faculty Broadcast Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Dispatch announcements, deadlines, reschedule requests, and view read receipts analytics.
          </p>
        </div>

        {/* Analytics Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-4 border-b font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Categories Distribution
            </div>
            <CardContent className="p-4 h-64">
              {categoryData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Send broadcasts to view charts
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="p-4 border-b font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Weekly Broadcast Activity
            </div>
            <CardContent className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="reads" stroke="#10b981" fillOpacity={1} fill="url(#colorReads)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Broadcaster Composer Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-6 border-b">
                <h2 className="font-bold text-base text-foreground">Compose Broadcast Notification</h2>
              </div>
              <CardContent className="p-6 space-y-6">
                
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notification Title</label>
                  <Input
                    placeholder="e.g. Tomorrow's class shifted to Lab 3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content Message</label>
                  <textarea
                    placeholder="Dear Students, tomorrow's theory class has been shifted to Lab 3 for hands-on DBMS queries. Regards."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full text-sm bg-background border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Category & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-sm bg-background border rounded-md p-2"
                    >
                      <option value="ACADEMIC">Academic</option>
                      <option value="EXAMINATION">Examination</option>
                      <option value="RESULTS">Results Release</option>
                      <option value="FACULTY">Faculty Message</option>
                      <option value="LEARNING_PLAN">Learning Plan Update</option>
                      <option value="ASSIGNMENT">Assignment Alert</option>
                      <option value="ANNOUNCEMENT">Announcement</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full text-sm bg-background border rounded-md p-2"
                    >
                      <option value="LOW">Low (Green)</option>
                      <option value="MEDIUM">Medium (Amber)</option>
                      <option value="HIGH">High (Orange)</option>
                      <option value="CRITICAL">Critical (Red)</option>
                    </select>
                  </div>
                </div>

                {/* Segment Selector */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Target Recipient Group</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-semibold">Recipient Segment</label>
                      <select
                        value={recipientType}
                        onChange={(e) => setRecipientType(e.target.value)}
                        className="w-full text-sm bg-background border rounded-md p-2"
                      >
                        <option value="ALL">Entire Campus (All Students)</option>
                        <option value="SUBJECT">By Handles (Subject Enrolled)</option>
                        <option value="SEMESTER">By Semester Class</option>
                        <option value="PROGRAMME">By Academic Programme</option>
                        <option value="INDIVIDUAL">Specific Single Student ID</option>
                      </select>
                    </div>

                    {recipientType === 'SUBJECT' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Select Target Subject</label>
                        <select
                          value={subjectId}
                          onChange={(e) => setSubjectId(e.target.value)}
                          className="w-full text-sm bg-background border rounded-md p-2"
                        >
                          <option value="">-- Choose Subject --</option>
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {recipientType === 'SEMESTER' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Semester ID</label>
                        <Input
                          placeholder="Paste Semester UUID"
                          value={semesterId}
                          onChange={(e) => setSemesterId(e.target.value)}
                        />
                      </div>
                    )}

                    {recipientType === 'PROGRAMME' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Programme ID</label>
                        <Input
                          placeholder="Paste Programme UUID"
                          value={programmeId}
                          onChange={(e) => setProgrammeId(e.target.value)}
                        />
                      </div>
                    )}

                    {recipientType === 'INDIVIDUAL' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Student User ID</label>
                        <Input
                          placeholder="Paste Student User UUID"
                          value={recipientId}
                          onChange={(e) => setRecipientId(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Attach Study Files / Blueprints</h3>
                  
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <Input
                      placeholder="File Name (e.g. lecture_notes.pdf)"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="File URL link"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={addAttachment}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-1 bg-muted/20 p-3 rounded-lg border">
                      {attachments.map((att, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                            <FileText className="w-3.5 h-3.5 text-primary" /> {att.file_name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 border-t pt-6 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" /> Preview Notification
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleSend}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground"
                  >
                    <Send className="w-4 h-4" /> Send Broadcast
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Sent Notifications List & Receipts tracker */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <div className="p-6 border-b">
                <h2 className="font-bold text-base text-foreground">Outbox Broadcasts</h2>
              </div>
              <CardContent className="p-4 space-y-3">
                {isLoading ? (
                  <p className="text-xs text-muted-foreground">Loading sent items...</p>
                ) : sentNotifications.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground text-xs">
                    No broadcast history found. Use the composer to send one.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {sentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 bg-muted/20 border rounded-lg hover:bg-muted/40 transition-colors flex justify-between items-start gap-2 ${selectedNotifForReceipts?.id === notif.id ? 'border-primary bg-primary/5' : ''}`}
                      >
                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => viewReadReceipts(notif)}>
                          <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{notif.message}</p>
                          <span className="text-[9px] text-muted-foreground block mt-1">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="text-muted-foreground hover:text-destructive p-1 hover:bg-muted rounded transition-colors"
                          title="Delete Broadcast"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Read Receipts Panel */}
            {selectedNotifForReceipts && (
              <Card className="border-primary/20">
                <div className="p-4 border-b bg-muted/40 flex justify-between items-center">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Read Receipts Tracker</h3>
                  <button onClick={() => setSelectedNotifForReceipts(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-foreground truncate">{selectedNotifForReceipts.title}</h4>
                    <p className="text-[10px] text-muted-foreground">Receipt analytics details:</p>
                  </div>

                  {receipts ? (
                    <>
                      {/* Pie chart representing read splits */}
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={readUnreadData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={50}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {readUnreadData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Stat summary grid */}
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-muted/30 p-2 rounded border">
                          <p className="text-[9px] text-muted-foreground font-semibold uppercase">Delivered</p>
                          <p className="text-sm font-bold text-foreground">{receipts.delivered_count}</p>
                        </div>
                        <div className="bg-muted/30 p-2 rounded border">
                          <p className="text-[9px] text-muted-foreground font-semibold uppercase">Read Rate</p>
                          <p className="text-sm font-bold text-green-500">{receipts.read_percentage}%</p>
                        </div>
                      </div>

                      {/* Yet to open list */}
                      {receipts.unread_students.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Students Yet to Open ({receipts.unread_students.length})</p>
                          <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                            {receipts.unread_students.map((stu) => (
                              <div key={stu.id} className="flex justify-between items-center p-1.5 bg-background border rounded">
                                <span className="font-medium text-foreground truncate max-w-[130px]">{stu.full_name}</span>
                                <span className="text-[9px] text-muted-foreground truncate max-w-[120px]">{stu.email}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground animate-pulse">Calculating read receipts...</p>
                  )}
                </CardContent>
              </Card>
            )}

          </div>

        </div>
      </div>

      {/* Preview Modal before broadcast dispatch */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border bg-card animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold text-foreground">Notification Live Preview</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <CardContent className="p-6">
              <div className="p-5 border-2 border-dashed border-muted rounded-xl space-y-4">
                
                {/* Header */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    🔔
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-sm text-foreground truncate">{title || 'Preview Title'}</h4>
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase">
                        {priority}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Category: {category.toLowerCase()} | Target: {recipientType}</span>
                  </div>
                </div>

                {/* Message body */}
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {message || 'Your broadcast description will be displayed here.'}
                </p>

                {/* Attachments preview */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {attachments.map((file, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-[10px] font-semibold text-foreground border">
                        📄 {file.file_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            
            <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                Go Back & Edit
              </Button>
              <Button variant="default" size="sm" onClick={handleSend} className="bg-primary text-primary-foreground">
                Confirm & Send Broadcast Now
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
