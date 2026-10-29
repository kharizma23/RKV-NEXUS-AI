'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Briefcase, TrendingUp, Building2, Award } from 'lucide-react';

export function AlumniAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient<any>('/admin/alumni/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Loading analytics...</div>;
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Alumni Tracked</span>
          <div className="text-2xl font-black text-foreground">{analytics.total_alumni_tracked}</div>
          <p className="text-[11px] text-indigo-600 font-semibold">100% Verified Placements</p>
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Average Annual Package</span>
          <div className="text-2xl font-black text-emerald-600">{analytics.average_package_lpa} <span className="text-xs text-muted-foreground">LPA</span></div>
          <p className="text-[11px] text-muted-foreground">Across domestic & global roles</p>
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Highest Package Secured</span>
          <div className="text-2xl font-black text-amber-500">{analytics.highest_package_lpa} <span className="text-xs text-muted-foreground">LPA</span></div>
          <p className="text-[11px] text-muted-foreground">Tier-1 FAANG/AI Research</p>
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tier-1 Placement Rate</span>
          <div className="text-2xl font-black text-indigo-600">{analytics.tier_1_placement_percentage}%</div>
          <p className="text-[11px] text-emerald-600 font-semibold">Above international benchmark</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <span>Top Recruiting Companies</span>
          </h3>
          <div className="space-y-2">
            {analytics.top_recruiting_companies?.map((c: any, idx: number) => (
              <div key={idx} className="p-3 bg-muted/40 rounded-xl flex items-center justify-between text-xs border">
                <span className="font-bold text-foreground">{c.company}</span>
                <span className="font-mono text-indigo-600 font-semibold">{c.alumni_count} alumni</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <span>Industry Domain Spread</span>
          </h3>
          <div className="space-y-2">
            {analytics.domain_breakdown?.map((d: any, idx: number) => (
              <div key={idx} className="p-3 bg-muted/40 rounded-xl flex items-center justify-between text-xs border">
                <span className="font-bold text-foreground">{d.domain?.replace(/_/g, ' ')}</span>
                <span className="font-mono text-emerald-600 font-semibold">{d.count} engineers</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlumniAnalytics;
