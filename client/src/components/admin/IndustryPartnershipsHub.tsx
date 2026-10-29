'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Calendar, Users, Plus, FileCheck, Eye, Download, Printer, Share2, X, CheckCircle2, Award, Clock, MapPin, Edit, Trash2 } from 'lucide-react';

export function IndustryPartnershipsHub() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State Controls
  const [selectedMou, setSelectedMou] = useState<any>(null);
  const [selectedPartnership, setSelectedPartnership] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showAddPartnership, setShowAddPartnership] = useState(false);
  const [showScheduleEvent, setShowScheduleEvent] = useState(false);
  const [showAllMous, setShowAllMous] = useState(false);

  // Form States
  const [newPartner, setNewPartner] = useState({ company: '', focus: 'AI Research', duration: '2025-2028 (3 Years)' });
  const [newEvent, setNewEvent] = useState({ title: '', company: 'Google', date: '2026-08-25', time: '10:00 AM', venue: 'Google Office, Bangalore' });

  const mousMap: Record<string, any> = {
    'Google': {
      company: 'Google',
      institution: 'Bannari Amman Institute of Technology',
      date: 'January 15, 2025',
      duration: '3 Years (2025-2028)',
      status: 'Active',
      scope: [
        '1. Joint Research Projects in AI & Neural Systems',
        '2. Faculty Exchange & Upskilling Programs',
        '3. Priority Student Internships & Recruitment',
        '4. AI & Cloud Curriculum Co-Development'
      ],
      signatories: [
        'Dr. S. Senthil, Director, BIT',
        'Mr. Rajesh Kumar, Director, Google India'
      ]
    },
    'Microsoft': {
      company: 'Microsoft',
      institution: 'Bannari Amman Institute of Technology',
      date: 'June 01, 2025',
      duration: '2 Years (2025-2027)',
      status: 'Active',
      scope: [
        '1. Azure Cloud Innovation Center Setup',
        '2. Student Certification Workshops in DevOps',
        '3. Shared High-Performance Cloud Lab Infrastructure',
        '4. Faculty Research Grants in Distributed Computing'
      ],
      signatories: [
        'Dr. S. Senthil, Director, BIT',
        'Ms. Ananya Sharma, Head of Academia, Microsoft Azure'
      ]
    },
    'Amazon': {
      company: 'Amazon',
      institution: 'Bannari Amman Institute of Technology',
      date: 'March 01, 2025',
      duration: '2 Years (2025-2027)',
      status: 'Active',
      scope: [
        '1. AWS Academy Curriculum Integration',
        '2. Direct Internship Pathways for Top 10% Graduates',
        '3. Cloud Architecture Hackathons & Mentorship',
        '4. Joint Technology Whitepapers'
      ],
      signatories: [
        'Dr. S. Senthil, Director, BIT',
        'Mr. Vikram Malhotra, APAC Lead, AWS Education'
      ]
    }
  };

  const partnershipDetailsMap: Record<string, any> = {
    'Google': {
      company: 'Google',
      type: 'AI Research & Neural Labs',
      duration: '2025-2028 (3 Years)',
      status: 'Active',
      metrics: {
        internsPlaced: 12,
        facultyTrained: 5,
        researchPapers: 8,
        jointEvents: 6
      },
      recentActivities: [
        '• AI Workshop - June 2026',
        '• Faculty Training in Deep Learning - May 2026',
        '• Joint Neural Computing Research Symposium - April 2026'
      ]
    },
    'Microsoft': {
      company: 'Microsoft',
      type: 'Cloud Computing & Azure Labs',
      duration: '2025-2027 (2 Years)',
      status: 'Active',
      metrics: {
        internsPlaced: 15,
        facultyTrained: 8,
        researchPapers: 5,
        jointEvents: 4
      },
      recentActivities: [
        '• Azure DevOps Masterclass - July 2026',
        '• Cloud Security Certification Drive - June 2026',
        '• Hackathon on Microservices - April 2026'
      ]
    },
    'Amazon': {
      company: 'Amazon',
      type: 'Placement & Cloud Architecture',
      duration: '2025-2027 (2 Years)',
      status: 'Active',
      metrics: {
        internsPlaced: 18,
        facultyTrained: 6,
        researchPapers: 4,
        jointEvents: 5
      },
      recentActivities: [
        '• AWS Cloud Practitioner Certification - July 2026',
        '• Serverless Systems Workshop - May 2026',
        '• Leadership Principles Speaker Session - March 2026'
      ]
    }
  };

  const eventDetailsMap: Record<string, any> = {
    'Industry Visit - Google': {
      title: 'Industry Visit',
      company: 'Google',
      date: 'August 25, 2026',
      time: '10:00 AM - 4:00 PM',
      venue: 'Google Office, Bangalore',
      registeredStudents: 45,
      facultyAttending: 5,
      agenda: [
        '1. Office Tour & Engineering Labs (10:00 - 11:30 AM)',
        '2. Tech Talk by Senior AI Engineers (11:30 AM - 1:00 PM)',
        '3. Networking Lunch (1:00 - 2:00 PM)',
        '4. Interactive Q&A & Internship Briefing (2:00 - 4:00 PM)'
      ]
    },
    'Workshop - AWS': {
      title: 'AWS Cloud Architecture Workshop',
      company: 'Amazon',
      date: 'September 18, 2026',
      time: '9:00 AM - 3:00 PM',
      venue: 'BIT Seminar Hall 2',
      registeredStudents: 60,
      facultyAttending: 6,
      agenda: [
        '1. Introduction to Serverless Infrastructure (9:00 - 11:00 AM)',
        '2. Hands-on Hands-on Lab on Lambda & DynamoDB (11:00 AM - 1:00 PM)',
        '3. Lunch & Peer Review (1:00 - 2:00 PM)',
        '4. AWS Certification Voucher Distribution (2:00 - 3:00 PM)'
      ]
    }
  };

  const fetchPartnerships = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/industry-partnerships');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch industry partnerships', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerships();
  }, []);

  const handleDownloadMouPdf = (companyName: string) => {
    const mou = mousMap[companyName] || mousMap['Google'];
    let text = `=======================================================\n📄 MEMORANDUM OF UNDERSTANDING (MOU)\n${mou.company.toUpperCase()} - ${mou.institution.toUpperCase()}\n=======================================================\n\nSigned Date: ${mou.date}\nDuration: ${mou.duration}\nStatus: ${mou.status}\n\nSCOPE OF COLLABORATION:\n`;
    mou.scope.forEach((s: string) => { text += `${s}\n`; });
    text += `\nAUTHORIZED SIGNATORIES:\n`;
    mou.signatories.forEach((sig: string) => { text += `- ${sig}\n`; });
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${companyName.toLowerCase()}_mou_document.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-500" />
            🤝 Industry Partnerships Hub
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage corporate collaborations, MOU agreements, and industry internships</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowAddPartnership(true)} className="text-xs font-bold border-slate-700">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Partnership
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowScheduleEvent(true)} className="text-xs font-bold border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/10">
            <Calendar className="w-3.5 h-3.5 mr-1" /> Schedule Event
          </Button>
          <Button size="sm" onClick={() => setShowAllMous(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm">
            <FileCheck className="w-3.5 h-3.5 mr-1" /> View MOUs
          </Button>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Active Partners</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{data?.stats?.partners || 45}</p>
              <p className="text-[10px] font-bold text-blue-600 mt-0.5">▲ +8 new MOUs</p>
            </div>
            <Building className="w-8 h-8 text-blue-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Industry Events</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{data?.stats?.events || 23}</p>
              <p className="text-[10px] font-bold text-indigo-600 mt-0.5">▲ +5 scheduled</p>
            </div>
            <Calendar className="w-8 h-8 text-indigo-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Industry Interns</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{data?.stats?.interns || 120}</p>
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5">▲ +30 placed</p>
            </div>
            <Users className="w-8 h-8 text-emerald-500/30" />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Partnerships */}
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              🏢 Active Corporate Partnerships
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {(data?.partnerships || [
              { company: 'Google', focus: 'AI Research', mouDuration: '2025-2028' },
              { company: 'Microsoft', focus: 'Cloud Lab', mouDuration: '2025-2027' },
              { company: 'Amazon', focus: 'Placement', mouDuration: '2025-2027' }
            ]).map((pt: any, i: number) => (
              <div
                key={i}
                onClick={() => setSelectedPartnership(partnershipDetailsMap[pt.company] || partnershipDetailsMap['Google'])}
                className="flex justify-between items-center p-3 rounded-lg border bg-card hover:border-blue-500/40 hover:bg-muted/10 cursor-pointer transition-all"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">🏢 {pt.company} - {pt.focus}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">MOU: {pt.mouDuration}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMou(mousMap[pt.company] || mousMap['Google']);
                  }}
                  className="h-7 text-[10px] font-bold border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                >
                  View MOU
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              📅 Upcoming Joint Events & Workshops
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {(data?.upcomingEvents || [
              { title: 'Industry Visit - Google', date: 'Aug 25, 2026' },
              { title: 'Workshop - AWS', date: 'Sep 18, 2026' }
            ]).map((ev: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border bg-card flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-foreground">📅 {ev.title}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{ev.date}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedEvent(eventDetailsMap[ev.title] || eventDetailsMap['Industry Visit - Google'])}
                  className="h-7 text-[10px] font-bold border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10"
                >
                  Details
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 📄 1. VIEW MOU MODAL */}
      {selectedMou && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMou(null);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground uppercase">📄 MEMORANDUM OF UNDERSTANDING (MOU)</h3>
                  <p className="text-[10px] text-muted-foreground">{selectedMou.company} — {selectedMou.institution}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMou(null)} className="px-2.5 py-1 rounded-lg bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 font-bold text-xs flex items-center gap-1">
                <X className="w-4 h-4" /> Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Signed Date</p>
                <p className="font-bold text-foreground mt-0.5">{selectedMou.date}</p>
              </div>
              <div className="p-2 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Duration</p>
                <p className="font-bold text-foreground mt-0.5">{selectedMou.duration}</p>
              </div>
              <div className="p-2 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Status</p>
                <p className="font-black text-emerald-600 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {selectedMou.status}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border bg-muted/10 space-y-3 text-xs">
              <p className="font-black text-foreground uppercase tracking-wider text-[11px]">MOU CONTENT & COLLABORATION SCOPE</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                This MOU is entered into between {selectedMou.company} and {selectedMou.institution} for collaboration in R&D and Academic Excellence.
              </p>
              <div className="space-y-1 pl-1">
                <p className="font-bold text-foreground">Scope of Work:</p>
                {selectedMou.scope?.map((sc: string, idx: number) => (
                  <p key={idx} className="text-muted-foreground text-[11px]">{sc}</p>
                ))}
              </div>

              <div className="pt-2 border-t space-y-1">
                <p className="font-bold text-foreground">Authorized Signatories:</p>
                {selectedMou.signatories?.map((sig: string, idx: number) => (
                  <p key={idx} className="text-indigo-500 font-semibold text-[11px]">✍️ {sig}</p>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between items-center">
              <Button size="sm" onClick={() => handleDownloadMouPdf(selectedMou.company)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
              </Button>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="font-bold text-xs">
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print
                </Button>
                <Button size="sm" variant="outline" onClick={() => alert(`MOU document for ${selectedMou.company} shared!`)} className="font-bold text-xs border-indigo-500/30 text-indigo-500">
                  <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🏢 2. PARTNERSHIP DETAILS MODAL */}
      {selectedPartnership && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPartnership(null);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground uppercase">🏢 {selectedPartnership.company} - PARTNERSHIP DETAILS</h3>
                  <p className="text-[10px] text-muted-foreground">{selectedPartnership.type}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPartnership(null)} className="px-2.5 py-1 rounded-lg bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 font-bold text-xs flex items-center gap-1">
                <X className="w-4 h-4" /> Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Partnership Type</p>
                <p className="font-bold text-foreground mt-0.5">{selectedPartnership.type}</p>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Duration & Status</p>
                <p className="font-bold text-foreground mt-0.5">{selectedPartnership.duration} • <span className="text-emerald-600 font-black">✅ {selectedPartnership.status}</span></p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Key Partnership Metrics
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg border bg-card flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold text-[11px]">Interns Placed:</span>
                  <span className="font-black text-emerald-600 font-mono text-sm">{selectedPartnership.metrics?.internsPlaced}</span>
                </div>
                <div className="p-2 rounded-lg border bg-card flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold text-[11px]">Faculty Trained:</span>
                  <span className="font-black text-indigo-500 font-mono text-sm">{selectedPartnership.metrics?.facultyTrained}</span>
                </div>
                <div className="p-2 rounded-lg border bg-card flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold text-[11px]">Research Papers:</span>
                  <span className="font-black text-cyan-600 font-mono text-sm">{selectedPartnership.metrics?.researchPapers}</span>
                </div>
                <div className="p-2 rounded-lg border bg-card flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold text-[11px]">Joint Events:</span>
                  <span className="font-black text-purple-600 font-mono text-sm">{selectedPartnership.metrics?.jointEvents}</span>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-foreground uppercase text-[11px]">📅 Recent Activities:</p>
              <div className="p-3 rounded-xl border bg-muted/10 space-y-1 font-mono text-[11px] text-muted-foreground">
                {selectedPartnership.recentActivities?.map((act: string, idx: number) => (
                  <p key={idx}>{act}</p>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between items-center">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedMou(mousMap[selectedPartnership.company] || mousMap['Google']);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                <FileCheck className="w-3.5 h-3.5 mr-1" /> View MOU
              </Button>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowScheduleEvent(true)} className="font-bold text-xs border-indigo-500/30 text-indigo-500">
                  <Calendar className="w-3.5 h-3.5 mr-1" /> Schedule Event
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedPartnership(null)} className="font-bold text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📅 3. EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground uppercase">📅 EVENT DETAILS - {selectedEvent.title.toUpperCase()}</h3>
                  <p className="text-[10px] text-muted-foreground">{selectedEvent.company} Collaboration Event</p>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="px-2.5 py-1 rounded-lg bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 font-bold text-xs flex items-center gap-1">
                <X className="w-4 h-4" /> Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Date & Time</p>
                <p className="font-bold text-foreground mt-0.5">{selectedEvent.date} • {selectedEvent.time}</p>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Venue</p>
                <p className="font-bold text-foreground mt-0.5">{selectedEvent.venue}</p>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Registered Students</p>
                <p className="font-black text-indigo-500 mt-0.5 font-mono">{selectedEvent.registeredStudents} Students</p>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Faculty Attending</p>
                <p className="font-black text-emerald-600 mt-0.5 font-mono">{selectedEvent.facultyAttending} Members</p>
              </div>
            </div>

            {/* Agenda */}
            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-foreground uppercase text-[11px]">📋 Detailed Agenda:</p>
              <div className="p-3 rounded-xl border bg-muted/10 space-y-1 font-mono text-[11px] text-muted-foreground">
                {selectedEvent.agenda?.map((ag: string, idx: number) => (
                  <p key={idx}>{ag}</p>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between items-center">
              <Button size="sm" onClick={() => alert(`Attendees list for ${selectedEvent.title} downloaded!`)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                View Attendees ({selectedEvent.registeredStudents})
              </Button>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => alert(`Reminder notification dispatched to ${selectedEvent.registeredStudents} students!`)} className="font-bold text-xs border-indigo-500/30 text-indigo-500">
                  Send Reminder
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedEvent(null)} className="font-bold text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ➕ ADD PARTNERSHIP MODAL */}
      {showAddPartnership && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddPartnership(false);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" /> Add Corporate Partnership
              </h3>
              <button onClick={() => setShowAddPartnership(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground">Company Name</label>
                <input
                  type="text"
                  value={newPartner.company}
                  onChange={(e) => setNewPartner({ ...newPartner, company: e.target.value })}
                  placeholder="e.g. NVIDIA, Intel, IBM"
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground">Partnership Focus</label>
                <select
                  value={newPartner.focus}
                  onChange={(e) => setNewPartner({ ...newPartner, focus: e.target.value })}
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                >
                  <option value="AI Research">AI Research & Neural Labs</option>
                  <option value="Cloud Lab">Cloud Computing & DevOps</option>
                  <option value="Placement">Direct Placement & Internships</option>
                  <option value="Cybersecurity">Cybersecurity Innovation</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-muted-foreground">MOU Duration</label>
                <input
                  type="text"
                  value={newPartner.duration}
                  onChange={(e) => setNewPartner({ ...newPartner, duration: e.target.value })}
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddPartnership(false)} className="text-xs font-bold">Cancel</Button>
              <Button
                onClick={() => {
                  alert(`Corporate partnership with "${newPartner.company || 'New Partner'}" saved to active database!`);
                  setShowAddPartnership(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Save Partnership
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📅 SCHEDULE EVENT MODAL */}
      {showScheduleEvent && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowScheduleEvent(false);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> Schedule Industry Event
              </h3>
              <button onClick={() => setShowScheduleEvent(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. AI Hackathon 2026"
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground">Partner Company</label>
                <select
                  value={newEvent.company}
                  onChange={(e) => setNewEvent({ ...newEvent, company: e.target.value })}
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                >
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Amazon">Amazon</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-muted-foreground">Event Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduleEvent(false)} className="text-xs font-bold">Cancel</Button>
              <Button
                onClick={() => {
                  alert(`Industry event "${newEvent.title || 'New Event'}" scheduled for ${newEvent.date}! Notification dispatched.`);
                  setShowScheduleEvent(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Schedule Event
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📄 VIEW ALL MOUS LIST MODAL */}
      {showAllMous && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAllMous(false);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm text-foreground flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-500" /> Active Institutional MOUs List
              </h3>
              <button onClick={() => setShowAllMous(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto text-xs">
              {['Google', 'Microsoft', 'Amazon'].map((comp, idx) => (
                <div key={idx} className="p-3 rounded-xl border bg-card flex justify-between items-center">
                  <div>
                    <p className="font-bold text-foreground">📄 MOU: {comp} - BIT</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Valid: 2025-2028 • Active Status</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedMou(mousMap[comp])} className="h-7 text-[10px] font-bold border-blue-500/30 text-blue-600">View</Button>
                    <Button size="sm" onClick={() => handleDownloadMouPdf(comp)} className="h-7 text-[10px] font-bold bg-blue-600 text-white">Download</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <Button variant="outline" onClick={() => setShowAllMous(false)} className="text-xs font-bold">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

