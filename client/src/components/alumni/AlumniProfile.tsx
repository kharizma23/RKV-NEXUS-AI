'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { GraduationCap, Briefcase, Award, ExternalLink, MessageSquare, Lightbulb } from 'lucide-react';

interface AlumniProfileProps {
  alumniId: string;
}

export function AlumniProfile({ alumniId }: AlumniProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!alumniId) return;
      setLoading(true);
      try {
        const res = await apiClient<any>(`/alumni/${alumniId}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [alumniId]);

  if (loading) return <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Loading profile...</div>;
  if (!profile) return null;

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">{profile.name}</h2>
            <p className="text-xs text-muted-foreground">{profile.job_role} at <span className="font-bold text-foreground">{profile.current_company}</span></p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs border border-emerald-500/20">
            {profile.package} LPA Package
          </span>
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground border"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
          <span>Curriculum Feedback & Industry Advice</span>
        </h4>
        {profile.feedback?.map((f: any, idx: number) => (
          <div key={idx} className="p-4 bg-muted/40 rounded-xl space-y-2 border text-xs">
            <p className="font-medium text-foreground">&quot;{f.suggestions}&quot;</p>
            <span className="text-[10px] text-muted-foreground font-mono block">Submitted: {new Date(f.created_at).toLocaleDateString()}</span>
          </div>
        ))}

        {profile.achievements?.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Career Milestones & Patents</span>
            </h4>
            {profile.achievements.map((a: any, idx: number) => (
              <div key={idx} className="p-3 bg-muted/40 rounded-xl border text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground">{a.type}:</span>
                  <span className="ml-2 text-muted-foreground">{a.description}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{new Date(a.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
