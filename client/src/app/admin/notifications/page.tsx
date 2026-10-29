'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import {
  Send, Trash2, FileText, Upload, Settings, Sparkles, Clock, X, BarChart3, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

interface SentNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  recipient_type: string;
  created_at: string;
  scheduled_at?: string;
  attachments: Array<{ id: string; file_name: string; file_url: string }>;
}

const NOTIFICATION_TEMPLATES = [
  {
    title: 'Upcoming Internal Mid-Semester Exams',
    message: 'Dear Students,\n\nThe mid-semester examinations for all B.Tech programmes will commence from next Monday. The detailed schedule and seating arrangements have been uploaded to the portals.\n\nRegards,\nController of Examinations',
    category: 'EXAMINATION',
    priority: 'HIGH'
  },
  {
    title: 'Syllabus Review & Course Outcomes Integration',
    message: 'Dear Faculty,\n\nPlease verify that all course outcomes (COs) are mapped correctly in the syllabus units. Deadline for final compliance is Friday at 04:00 PM.\n\nRegards,\nDean of Academics',
    category: 'ACADEMIC',
    priority: 'MEDIUM'
  },
  {
    title: 'Placement Registration Reminder',
    message: 'Dear Students of Semester 7,\n\nRegistration for the upcoming placement drive closes in 48 hours. Please ensure your profile, CGPA, and resume are updated in the registry.\n\nRegards,\nTraining & Placement Cell',
    category: 'PLACEMENT',
    priority: 'CRITICAL'
  }
];

export default function AdminNotificationsPage() {
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New notification state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('ANNOUNCEMENT');
  const [priority, setPriority] = useState('MEDIUM');
  const [recipientType, setRecipientType] = useState('ALL');
  
  // Target segment details
  const [recipientId, setRecipientId] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Bulk Upload File
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isCsvUploading, setIsCsvUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  // Chart Data
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

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

      // Mock daily engagement trend
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      setTrendData(days.map(d => ({
        day: d,
        broadcasts: Math.floor(Math.random() * 4) + 1,
        conversions: Math.floor(Math.random() * 40) + 20
      })));
    } catch (err) {
      console.error('Failed to load sent notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSentNotifications();
  }, []);

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
        institution_id: institutionId || null,
        department_id: departmentId || null,
        programme_id: programmeId || null,
        semester_id: semesterId || null,
        subject_id: subjectId || null,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        attachments: []
      };

      await apiClient('/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // Reset form
      setTitle('');
      setMessage('');
      setCategory('ANNOUNCEMENT');
      setPriority('MEDIUM');
      setRecipientType('ALL');
      setRecipientId('');
      setInstitutionId('');
      setDepartmentId('');
      setProgrammeId('');
      setSemesterId('');
      setSubjectId('');
      setScheduledAt('');
      setExpiresAt('');

      loadSentNotifications();
    } catch (err) {
      console.error('Failed to send broadcast', err);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsCsvUploading(true);
    setUploadMessage('');
    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await apiClient<any>('/notifications/bulk-upload', {
        method: 'POST',
        body: formData
      });
      setUploadMessage(response.message || 'File uploaded and parsed successfully!');
      setCsvFile(null);
      loadSentNotifications();
    } catch (err) {
      console.error('CSV upload failed', err);
      setUploadMessage('Upload failed. Please check the CSV format.');
    } finally {
      setIsCsvUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this broadcast notification?')) return;
    try {
      await apiClient(`/notifications/${id}`, { method: 'DELETE' });
      loadSentNotifications();
    } catch (err) {
      console.error('Failed to delete broadcast', err);
    }
  };

  const applyTemplate = (tpl: typeof NOTIFICATION_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setCategory(tpl.category);
    setPriority(tpl.priority);
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" /> Admin Notification Control Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Publish college-wide announcements, schedule future alerts, and upload bulk lists of targeted communications.
          </p>
        </div>

        {/* Global Broadcast Stats Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-4 border-b font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Category Statistics
            </div>
            <CardContent className="p-4 h-60">
              {categoryData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Send broadcasts to view charts
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="p-4 border-b font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Engagement Activations
            </div>
            <CardContent className="p-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="conversions" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorConversions)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Broadcaster Composer */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Templates picker */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Quick Broadcast Templates
                </h3>
                <div className="flex flex-wrap gap-2">
                  {NOTIFICATION_TEMPLATES.map((tpl, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(tpl)}
                      className="text-xs border-primary/20 bg-background hover:bg-muted font-medium"
                    >
                      {tpl.title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="font-bold text-base text-foreground">Compose & Dispatch Broadcast</h2>
              </div>
              <CardContent className="p-6 space-y-6">
                
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title Header</label>
                  <Input
                    placeholder="e.g. Hostels closing for summer vacation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notification Message</label>
                  <textarea
                    placeholder="Provide details about the announcement..."
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
                      <option value="ANNOUNCEMENT">Announcement</option>
                      <option value="EXAMINATION">Examination</option>
                      <option value="RESULTS">Results</option>
                      <option value="ACADEMIC">Academic</option>
                      <option value="PLACEMENT">Placement</option>
                      <option value="EVENTS">Events</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full text-sm bg-background border rounded-md p-2"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Date scheduling */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Schedule Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full text-sm bg-background border rounded-md p-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Expiration Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full text-sm bg-background border rounded-md p-2"
                    />
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
                        <option value="ALL">Entire Campus (All Users)</option>
                        <option value="ROLE">All Users in Role</option>
                        <option value="INSTITUTION">By Institution</option>
                        <option value="DEPARTMENT">By Department</option>
                        <option value="PROGRAMME">By Academic Programme</option>
                        <option value="SEMESTER">By Semester Class</option>
                        <option value="SUBJECT">By Enrolled Subject</option>
                        <option value="INDIVIDUAL">Specific Single User ID</option>
                      </select>
                    </div>

                    {recipientType === 'INDIVIDUAL' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">User UUID</label>
                        <Input
                          placeholder="Paste User UUID"
                          value={recipientId}
                          onChange={(e) => setRecipientId(e.target.value)}
                        />
                      </div>
                    )}

                    {recipientType === 'INSTITUTION' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Institution UUID</label>
                        <Input
                          placeholder="Paste Institution UUID"
                          value={institutionId}
                          onChange={(e) => setInstitutionId(e.target.value)}
                        />
                      </div>
                    )}

                    {recipientType === 'DEPARTMENT' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Department UUID</label>
                        <Input
                          placeholder="Paste Department UUID"
                          value={departmentId}
                          onChange={(e) => setDepartmentId(e.target.value)}
                        />
                      </div>
                    )}

                    {recipientType === 'PROGRAMME' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Programme UUID</label>
                        <Input
                          placeholder="Paste Programme UUID"
                          value={programmeId}
                          onChange={(e) => setProgrammeId(e.target.value)}
                        />
                      </div>
                    )}

                    {recipientType === 'SEMESTER' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Semester UUID</label>
                        <Input
                          placeholder="Paste Semester UUID"
                          value={semesterId}
                          onChange={(e) => setSemesterId(e.target.value)}
                        />
                      </div>
                    )}

                    {recipientType === 'SUBJECT' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Subject UUID</label>
                        <Input
                          placeholder="Paste Subject UUID"
                          value={subjectId}
                          onChange={(e) => setSubjectId(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end border-t pt-6">
                  <Button
                    type="button"
                    onClick={handleSend}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold"
                  >
                    <Send className="w-4 h-4" /> Dispatch Global Broadcast
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Right sidebar: CSV Bulk Upload, Sent list */}
          <div className="space-y-6">
            
            {/* CSV Bulk Upload Card */}
            <Card>
              <div className="p-4 border-b flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">CSV Bulk Upload</h3>
              </div>
              <CardContent className="p-4">
                <form onSubmit={handleCsvUpload} className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="csv-file-input"
                    />
                    <label htmlFor="csv-file-input" className="cursor-pointer space-y-1 block">
                      <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-xs font-semibold text-foreground">
                        {csvFile ? csvFile.name : 'Select targeted CSV file'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Must contain: title, message, category</p>
                    </label>
                  </div>
                  
                  {uploadMessage && (
                    <p className="text-[11px] text-primary bg-primary/10 p-2 rounded text-center font-medium">
                      {uploadMessage}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={!csvFile || isCsvUploading}
                    className="w-full flex justify-center items-center gap-2"
                  >
                    {isCsvUploading ? 'Uploading...' : 'Schedule Bulk Upload'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Broadcast Outbox */}
            <Card>
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Sent Broadcast Logs</h3>
              </div>
              <CardContent className="p-4">
                {isLoading ? (
                  <p className="text-xs text-muted-foreground">Loading sent items...</p>
                ) : sentNotifications.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground text-xs">
                    No logs found.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {sentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 bg-muted/20 border rounded-lg hover:bg-muted/40 transition-colors flex justify-between items-start gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate">{notif.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{notif.message}</p>
                          <span className="text-[9px] text-muted-foreground block mt-1.5">
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

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
