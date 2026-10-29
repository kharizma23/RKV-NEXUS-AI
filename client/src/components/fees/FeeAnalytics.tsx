'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { DollarSign, TrendingUp, AlertCircle, PieChart } from 'lucide-react';

export function FeeAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient<any>('/admin/fees/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Loading fee financial analytics...</div>;
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Revenue Collected</span>
          <div className="text-2xl font-black text-emerald-600">₹{(analytics.total_revenue_collected_inr / 100000).toFixed(1)}L</div>
          <p className="text-[11px] text-muted-foreground">{analytics.total_students_paid} paid invoices</p>
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Collection Efficiency</span>
          <div className="text-2xl font-black text-indigo-600">{analytics.collection_efficiency_pct}%</div>
          <p className="text-[11px] text-emerald-600 font-semibold">Exceeds annual budget target</p>
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Predicted Defaulters</span>
          <div className="text-2xl font-black text-rose-500">{analytics.projected_defaulters_count}</div>
          <p className="text-[11px] text-muted-foreground">Flagged for automated follow-up</p>
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Payment Turnaround</span>
          <div className="text-2xl font-black text-foreground">{analytics.average_collection_turnaround_days} Days</div>
          <p className="text-[11px] text-muted-foreground">From billing to settlement</p>
        </div>
      </div>

      <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Payment Channel Settlement Share</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3 bg-muted/40 rounded-xl space-y-2 border">
            <div className="flex justify-between text-xs font-bold">
              <span>UPI (PhonePe / GPay)</span>
              <span className="text-indigo-600">{analytics.payment_methods_breakdown?.UPI}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analytics.payment_methods_breakdown?.UPI}%` }} />
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded-xl space-y-2 border">
            <div className="flex justify-between text-xs font-bold">
              <span>Net Banking (NEFT/RTGS)</span>
              <span className="text-emerald-600">{analytics.payment_methods_breakdown?.NET_BANKING}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analytics.payment_methods_breakdown?.NET_BANKING}%` }} />
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded-xl space-y-2 border">
            <div className="flex justify-between text-xs font-bold">
              <span>Credit & Debit Cards</span>
              <span className="text-amber-500">{analytics.payment_methods_breakdown?.CREDIT_DEBIT_CARD}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${analytics.payment_methods_breakdown?.CREDIT_DEBIT_CARD}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeeAnalytics;
