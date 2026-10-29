'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { GraduationCap, Briefcase, ExternalLink, Search, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface AlumniDirectoryProps {
  onSelectAlumni?: (id: string) => void;
}

export function AlumniDirectory({ onSelectAlumni }: AlumniDirectoryProps) {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient<any>('/alumni');
        setAlumni(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = alumni.filter((a) =>
    a.name.toLowerCase().includes(filter.toLowerCase()) ||
    a.current_company.toLowerCase().includes(filter.toLowerCase()) ||
    a.job_role.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Global Alumni Career Network</h3>
          <p className="text-xs text-muted-foreground">Distinguished graduates at Tier-1 technology companies worldwide</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, company..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-background border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground animate-pulse p-8 text-center">Loading alumni records...</div>
      ) : filtered.length === 0 ? (
        <div className="text-xs text-muted-foreground p-8 text-center">No alumni found matching criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filtered.map((a) => (
            <div
              key={a.id}
              onClick={() => onSelectAlumni && onSelectAlumni(a.id)}
              className="p-4 bg-muted/40 rounded-xl space-y-3 border hover:border-indigo-500/50 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">{a.name}</h4>
                    <span className="text-[10px] text-muted-foreground font-mono">Class of {a.graduation_year}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {a.package} LPA
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-semibold text-foreground flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">{a.job_role}</span>
                </p>
                <p className="text-[11px] text-muted-foreground font-medium pl-5">{a.current_company}</p>
              </div>

              {a.linkedin_url && (
                <div className="pt-2 border-t flex justify-end">
                  <a
                    href={a.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 font-semibold"
                  >
                    <span>LinkedIn Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlumniDirectory;
