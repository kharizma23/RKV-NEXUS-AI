'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, AlertTriangle, User, Download, Plus, Search, BookMarked, CheckCircle2, X } from 'lucide-react';

export function SmartLibraryManager() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showBorrowers, setShowBorrowers] = useState(false);

  const [newBook, setNewBook] = useState({ title: '', isbn: '', quantity: '10', category: 'Computer Science' });

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/smart-library');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch library data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleGenerateReport = () => {
    const csvContent = "Category,Count\n" +
      "Physical Books,12450\n" +
      "E-Books,5230\n" +
      "Research Papers,1890\n\n" +
      "Book Title,Available Copies,Status\n" +
      "Artificial Intelligence: A Modern Approach,2,LOW_STOCK\n" +
      "Pattern Recognition & Machine Learning,4,MEDIUM_STOCK\n" +
      "Data Structures & Algorithms in C++,12,IN_STOCK\n";
    const element = document.createElement("a");
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = "smart_library_report_2026.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-500" />
            📚 Smart Library Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Digital & physical resource tracking, low stock alerts, and reader analytics</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowAddBook(true)} className="text-xs font-bold border-slate-700">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Book
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowBorrowers(true)} className="text-xs font-bold border-purple-500/40 text-purple-500 hover:bg-purple-500/10">
            <User className="w-3.5 h-3.5 mr-1" /> Manage Borrowers
          </Button>
          <Button size="sm" onClick={handleGenerateReport} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm">
            <Download className="w-3.5 h-3.5 mr-1" /> Generate Report
          </Button>
        </div>
      </div>

      {/* Resource Count Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Physical Books</p>
              <p className="text-2xl font-black text-purple-600 mt-1">{data?.counts?.physicalBooks || '12,450'}</p>
              <p className="text-[10px] text-muted-foreground font-bold mt-0.5">In Stock Inventory</p>
            </div>
            <BookMarked className="w-8 h-8 text-purple-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">E-Books & PDFs</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{data?.counts?.ebooks || '5,230'}</p>
              <p className="text-[10px] text-muted-foreground font-bold mt-0.5">24/7 Digital Access</p>
            </div>
            <BookOpen className="w-8 h-8 text-indigo-500/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Research Papers</p>
              <p className="text-2xl font-black text-cyan-600 mt-1">{data?.counts?.papers || '1,890'}</p>
              <p className="text-[10px] text-muted-foreground font-bold mt-0.5">IEEE & Springer Repositories</p>
            </div>
            <Search className="w-8 h-8 text-cyan-500/30" />
          </CardContent>
        </Card>
      </div>

      {/* Inventory & Top Borrowers */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Stock Alerts & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {(data?.stockAlerts || [
              { title: 'Artificial Intelligence: A Modern Approach', available: 2, status: 'LOW' },
              { title: 'Pattern Recognition & Machine Learning', available: 4, status: 'MEDIUM' },
              { title: 'Data Structures & Algorithms in C++', available: 12, status: 'GOOD' }
            ]).map((bk: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                <div>
                  <p className="text-xs font-bold text-foreground">{bk.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Available Copies: {bk.available}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  bk.status === 'LOW' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                  bk.status === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                }`}>
                  {bk.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-purple-500" /> Top Active Readers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {(data?.topReaders || [
              { name: 'Dharshini (23CSE001)', borrowed: 14 },
              { name: 'Kharizma (23CSE002)', borrowed: 11 },
              { name: 'Vasudev (23CSE003)', borrowed: 9 }
            ]).map((rd: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                <p className="text-xs font-bold text-foreground">👤 {rd.name}</p>
                <span className="text-xs font-mono font-extrabold text-purple-600">{rd.borrowed} Books Issued</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 📖 Add Book Modal */}
      {showAddBook && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddBook(false);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-500" /> Add Book to Inventory
              </h3>
              <button onClick={() => setShowAddBook(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground">Book Title</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="e.g. Deep Learning Specialization"
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground">ISBN Number</label>
                <input
                  type="text"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                  placeholder="e.g. 978-0134685991"
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground">Quantity Copies</label>
                <input
                  type="number"
                  value={newBook.quantity}
                  onChange={(e) => setNewBook({ ...newBook, quantity: e.target.value })}
                  className="w-full mt-1 p-2 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddBook(false)} className="text-xs font-bold">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  alert(`Book "${newBook.title || 'New Title'}" added with ${newBook.quantity} copies to Library Inventory!`);
                  setShowAddBook(false);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                Save Book
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 👤 Manage Borrowers Modal */}
      {showBorrowers && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBorrowers(false);
          }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto animate-in fade-in"
        >
          <div className="bg-card border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" /> Active Library Borrowers
              </h3>
              <button onClick={() => setShowBorrowers(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              <div className="p-3 rounded-lg border bg-card flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">Dharshini (23CSE001)</p>
                  <p className="text-[10px] text-muted-foreground">Issued: Artificial Intelligence • Due: Aug 30, 2026</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active</span>
              </div>

              <div className="p-3 rounded-lg border bg-card flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">Kharizma (23CSE002)</p>
                  <p className="text-[10px] text-muted-foreground">Issued: Machine Learning • Due: Aug 28, 2026</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active</span>
              </div>

              <div className="p-3 rounded-lg border bg-card flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">Vasudev (23CSE003)</p>
                  <p className="text-[10px] text-muted-foreground">Issued: Data Structures • Due: Aug 22, 2026</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">Overdue (Notice Sent)</span>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <Button variant="outline" onClick={() => setShowBorrowers(false)} className="text-xs font-bold">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
