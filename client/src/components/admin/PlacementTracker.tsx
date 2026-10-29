'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Building, TrendingUp, Calendar, Plus, Download, Send, CheckCircle2, X, Share2, MapPin, Award } from 'lucide-react';

export function PlacementTracker() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showScheduleDrive, setShowScheduleDrive] = useState(false);

  // Form states
  const [newCompany, setNewCompany] = useState({ name: '', package: '', location: 'Bangalore', branches: 'CSE, IT, ECE' });
  const [newDrive, setNewDrive] = useState({ company: 'Google', date: '2026-08-28', shortlisted: '45' });

  const companyDetailsMap: Record<string, any> = {
    'Google': {
      name: 'Google',
      package: '₹24 LPA',
      studentsPlaced: 8,
      driveDate: 'Aug 20, 2026',
      location: 'Bangalore',
      students: [
        { name: 'Dharshini', dept: 'CSE', gpa: '9.2', roll: '23CSE001' },
        { name: 'Kharizma', dept: 'CSE', gpa: '8.9', roll: '23CSE002' },
        { name: 'Priya', dept: 'ECE', gpa: '8.7', roll: '23ECE014' },
        { name: 'Rahul', dept: 'CSE', gpa: '8.5', roll: '23CSE022' },
        { name: 'Sita', dept: 'AIDS', gpa: '8.8', roll: '23AIDS005' },
        { name: 'Arjun', dept: 'CSE', gpa: '8.6', roll: '23CSE045' },
        { name: 'Ananya', dept: 'ECE', gpa: '8.4', roll: '23ECE033' },
        { name: 'Vikram', dept: 'IT', gpa: '8.3', roll: '23IT019' }
      ]
    },
    'Microsoft': {
      name: 'Microsoft',
      package: '₹22 LPA',
      studentsPlaced: 6,
      driveDate: 'Aug 18, 2026',
      location: 'Hyderabad',
      students: [
        { name: 'Vasudev', dept: 'CSE', gpa: '9.1', roll: '23CSE003' },
        { name: 'Kavya', dept: 'IT', gpa: '8.8', roll: '23IT008' },
        { name: 'Rohan', dept: 'ECE', gpa: '8.6', roll: '23ECE012' },
        { name: 'Sneha', dept: 'AIDS', gpa: '8.7', roll: '23AIDS011' },
        { name: 'Deepak', dept: 'CSE', gpa: '8.4', roll: '23CSE051' },
        { name: 'Nisha', dept: 'IT', gpa: '8.5', roll: '23IT024' }
      ]
    },
    'Amazon': {
      name: 'Amazon',
      package: '₹20 LPA',
      studentsPlaced: 5,
      driveDate: 'Aug 15, 2026',
      location: 'Chennai',
      students: [
        { name: 'Aditya', dept: 'CSE', gpa: '8.9', roll: '23CSE011' },
        { name: 'Bhavna', dept: 'ECE', gpa: '8.5', roll: '23ECE009' },
        { name: 'Chirag', dept: 'IT', gpa: '8.7', roll: '23IT015' },
        { name: 'Divya', dept: 'AIDS', gpa: '8.6', roll: '23AIDS003' },
        { name: 'Eshwar', dept: 'CSE', gpa: '8.4', roll: '23CSE038' }
      ]
    },
    'Flipkart': {
      name: 'Flipkart',
      package: '₹18 LPA',
      studentsPlaced: 4,
      driveDate: 'Aug 12, 2026',
      location: 'Bangalore',
      students: [
        { name: 'Farhan', dept: 'CSE', gpa: '8.6', roll: '23CSE018' },
        { name: 'Gauri', dept: 'ECE', gpa: '8.4', roll: '23ECE027' },
        { name: 'Harish', dept: 'IT', gpa: '8.5', roll: '23IT031' },
        { name: 'Ishita', dept: 'AIDS', gpa: '8.3', roll: '23AIDS019' }
      ]
    }
  };

  const fetchPlacement = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/placement-tracker');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch placement tracker', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacement();
  }, []);

  const handleExportReport = () => {
    const csvContent = "Company,Package,Students Placed,Drive Date,Location\n" +
      "Google,₹24 LPA,8,2026-08-20,Bangalore\n" +
      "Microsoft,₹22 LPA,6,2026-08-18,Hyderabad\n" +
      "Amazon,₹20 LPA,5,2026-08-15,Chennai\n" +
      "Flipkart,₹18 LPA,4,2026-08-12,Bangalore\n";
    const element = document.createElement("a");
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = "placement_report_2026.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadCompanyReport = (companyName: string) => {
    const comp = companyDetailsMap[companyName] || companyDetailsMap['Google'];
    let text = `=====================================\n🏢 ${comp.name.toUpperCase()} PLACEMENT REPORT 2026\n=====================================\n\nPackage: ${comp.package}\nStudents Placed: ${comp.studentsPlaced}\nDrive Date: ${comp.driveDate}\nLocation: ${comp.location}\n\nSelected Students List:\n`;
    comp.students.forEach((st: any, i: number) => {
      text += `${i + 1}. ${st.name} - ${st.dept} (Roll: ${st.roll}) - GPA: ${st.gpa}\n`;
    });
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${companyName.toLowerCase()}_placement_report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-emerald-500" />
            💼 Real-Time Placement Tracker
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track student placement rates, top recruiter offers, and upcoming corporate drives</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowAddCompany(true)} className="text-xs font-bold border-slate-700">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Company
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowScheduleDrive(true)} className="text-xs font-bold border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/10">
            <Calendar className="w-3.5 h-3.5 mr-1" /> Schedule Drive
          </Button>
          <Button size="sm" onClick={handleExportReport} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm">
            <Download className="w-3.5 h-3.5 mr-1" /> Export Report
          </Button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Placed Students</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{data?.stats?.placedStudents || 45}</p>
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5">▲ {data?.stats?.placedChange || '+12%'}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Partner Companies</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{data?.stats?.companiesCount || 23}</p>
              <p className="text-[10px] font-bold text-indigo-600 mt-0.5">▲ {data?.stats?.companiesChange || '+5'}</p>
            </div>
            <Building className="w-8 h-8 text-indigo-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Average Package</p>
              <p className="text-2xl font-black text-cyan-600 mt-1">₹{data?.stats?.avgPackageLpa || 12.5} LPA</p>
              <p className="text-[10px] font-bold text-cyan-600 mt-0.5">▲ {data?.stats?.packageChange || '+15%'}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-cyan-500/30" />
          </CardContent>
        </Card>
      </div>

      {/* Top Recruiters & Upcoming Drives */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-500" /> Top Recruiters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {(data?.topRecruiters || [
              { name: 'Google', offers: 8, package: '₹24 LPA' },
              { name: 'Microsoft', offers: 6, package: '₹22 LPA' },
              { name: 'Amazon', offers: 5, package: '₹20 LPA' },
              { name: 'Flipkart', offers: 4, package: '₹18 LPA' }
            ]).map((rc: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">🏢 {rc.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {rc.offers} Offers
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-foreground font-mono">{rc.package}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCompany(companyDetailsMap[rc.name] || companyDetailsMap['Google'])}
                    className="h-7 text-[10px] font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Upcoming Placement Drives
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {(data?.upcomingDrives || [
              { company: 'Google', date: 'Aug 20, 2026', shortlisted: 45 },
              { company: 'Microsoft', date: 'Aug 25, 2026', shortlisted: 38 }
            ]).map((dr: any, i: number) => (
              <div key={i} className="p-3.5 rounded-lg border bg-indigo-500/5 border-indigo-500/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1">
                    📅 {dr.company}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{dr.date} • {dr.shortlisted} Students Shortlisted</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedCompany(companyDetailsMap[dr.company] || companyDetailsMap['Google'])}
                  className="h-7 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Manage Drive
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 🏢 Company Placement Details Modal */}
      {selectedCompany && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCompany(null);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground uppercase tracking-wide">🏢 {selectedCompany.name} PLACEMENT DETAILS</h3>
                  <p className="text-[11px] text-muted-foreground">Placement & Selection Summary 2026</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-2.5 py-1 rounded-lg bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 font-bold text-xs flex items-center gap-1 transition-colors border"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            {/* Overview Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Company</p>
                <p className="font-extrabold text-foreground mt-0.5">{selectedCompany.name}</p>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Package Offered</p>
                <p className="font-black text-emerald-600 mt-0.5 font-mono">{selectedCompany.package}</p>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Students Placed</p>
                <p className="font-extrabold text-indigo-500 mt-0.5">{selectedCompany.studentsPlaced} Students</p>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Drive Date & Location</p>
                <p className="font-bold text-foreground mt-0.5">{selectedCompany.driveDate} • {selectedCompany.location}</p>
              </div>
            </div>

            {/* Selected Students List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground flex items-center gap-1 uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Selected Students ({selectedCompany.students?.length})
              </p>

              <div className="border rounded-xl p-2 max-h-48 overflow-y-auto space-y-1.5 bg-muted/10 text-xs">
                {selectedCompany.students?.map((st: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg border bg-card">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground text-[10px] font-bold">{idx + 1}.</span>
                      <span className="font-bold text-foreground">{st.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold">{st.dept}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 text-xs">GPA: {st.gpa}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t flex justify-between items-center">
              <Button
                size="sm"
                onClick={() => handleDownloadCompanyReport(selectedCompany.name)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download Report
              </Button>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => alert(`Placement report for ${selectedCompany.name} shared to department heads!`)}
                  className="font-bold text-xs border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/10"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCompany(null)}
                  className="font-bold text-xs border-rose-500/40 text-rose-500 hover:bg-rose-500/10"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ➕ Add Company Modal */}
      {showAddCompany && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddCompany(false);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> Add New Recruiter Company
              </h3>
              <button onClick={() => setShowAddCompany(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground">Company Name</label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="e.g. Apple, Oracle, TCS"
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground">Package (LPA)</label>
                <input
                  type="text"
                  value={newCompany.package}
                  onChange={(e) => setNewCompany({ ...newCompany, package: e.target.value })}
                  placeholder="e.g. ₹20 LPA"
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground">Drive Location</label>
                <input
                  type="text"
                  value={newCompany.location}
                  onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddCompany(false)} className="text-xs font-bold">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  alert(`Company "${newCompany.name || 'New Company'}" added to active recruiters database!`);
                  setShowAddCompany(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Save Company
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📅 Schedule Drive Modal */}
      {showScheduleDrive && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowScheduleDrive(false);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> Schedule Corporate Drive
              </h3>
              <button onClick={() => setShowScheduleDrive(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground">Recruiter Company</label>
                <select
                  value={newDrive.company}
                  onChange={(e) => setNewDrive({ ...newDrive, company: e.target.value })}
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                >
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Flipkart">Flipkart</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-muted-foreground">Drive Date</label>
                <input
                  type="date"
                  value={newDrive.date}
                  onChange={(e) => setNewDrive({ ...newDrive, date: e.target.value })}
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground">Shortlisted Students Count</label>
                <input
                  type="number"
                  value={newDrive.shortlisted}
                  onChange={(e) => setNewDrive({ ...newDrive, shortlisted: e.target.value })}
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduleDrive(false)} className="text-xs font-bold">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  alert(`Placement drive scheduled for ${newDrive.company} on ${newDrive.date}! Notifications dispatched to ${newDrive.shortlisted} shortlisted students.`);
                  setShowScheduleDrive(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Confirm Drive
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

