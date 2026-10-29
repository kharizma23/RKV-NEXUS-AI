'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { CreditCard, CheckCircle2, Clock, AlertCircle, Download, ShieldCheck, DollarSign } from 'lucide-react';
import { PaymentGateway } from './PaymentGateway';

export function FeeDashboard() {
  const [feeData, setFeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayItem, setSelectedPayItem] = useState<any>(null);

  const loadFees = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>('/fees/student');
      setFeeData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">Tuition & Examination Fee Portal</h1>
          <p className="text-xs text-muted-foreground">Semester fee schedules, scholarship waivers, and tax receipts</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Automated Clearances Active</span>
        </div>
      </div>

      {selectedPayItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <PaymentGateway
            feeStructureId={selectedPayItem.fee_structure_id}
            amount={selectedPayItem.amount}
            feeHead={selectedPayItem.fee_head}
            onClose={() => setSelectedPayItem(null)}
            onSuccess={() => {
              loadFees();
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">Loading fee ledger...</div>
      ) : !feeData ? (
        <div className="p-12 text-center text-xs text-muted-foreground">No active fee record.</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Fees Outstanding</span>
              <div className="text-2xl font-black text-rose-500">₹{feeData.total_due.toLocaleString()}</div>
              <p className="text-[11px] text-muted-foreground">Due by specified semester deadline</p>
            </div>

            <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Fees Cleared</span>
              <div className="text-2xl font-black text-emerald-600">₹{feeData.total_paid.toLocaleString()}</div>
              <p className="text-[11px] text-emerald-600 font-semibold">Payment verification on-record</p>
            </div>

            <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Scholarship Endorsement</span>
              <div className="text-sm font-black text-indigo-600 truncate">{feeData.scholarship_applied}</div>
              <p className="text-[11px] text-muted-foreground">Subsidized tuition credit</p>
            </div>
          </div>

          {/* Fee Invoices */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Semester Billing Roster</h3>
            <div className="divide-y text-xs">
              {feeData.fee_items?.map((item: any) => (
                <div key={item.fee_structure_id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-foreground text-sm">{item.fee_head}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        item.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Due Date: {new Date(item.due_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-black text-foreground text-base">₹{item.amount.toLocaleString()}</span>
                    {item.status === 'DUE' ? (
                      <button
                        onClick={() => setSelectedPayItem(item)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        Pay Online Now
                      </button>
                    ) : (
                      <span className="flex items-center space-x-1 text-xs text-emerald-600 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Receipt #{item.payment_details?.receipt_number}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Receipts History */}
          {feeData.payments_history?.length > 0 && (
            <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Payment History & Tax Receipts</h3>
              <div className="divide-y text-xs">
                {feeData.payments_history.map((p: any) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground font-mono">{p.receipt_number}</span>
                      <div className="flex items-center space-x-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>Mode: {p.payment_mode}</span>
                        <span>•</span>
                        <span>Date: {new Date(p.payment_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-black text-emerald-600">₹{p.amount_paid.toLocaleString()}</span>
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground border"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FeeDashboard;
