'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { CreditCard, QrCode, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

interface PaymentGatewayProps {
  feeStructureId: string;
  amount: number;
  feeHead: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function PaymentGateway({ feeStructureId, amount, feeHead, onSuccess, onClose }: PaymentGatewayProps) {
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/fees/payment', {
        method: 'POST',
        body: JSON.stringify({
          fee_structure_id: feeStructureId,
          amount_paid: amount,
          payment_mode: paymentMode
        })
      });
      setReceipt(res.data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-xl max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Secure Fee Gateway</h3>
            <p className="text-[10px] text-muted-foreground">PCI-DSS 256-Bit Encrypted</p>
          </div>
        </div>
        {onClose && !receipt && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs font-bold">
            ✕
          </button>
        )}
      </div>

      {receipt ? (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Payment Successful!</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Receipt #{receipt.receipt_number}</p>
          </div>

          <div className="p-3 bg-background rounded-lg border text-xs space-y-1.5 text-left font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-bold text-foreground">₹{receipt.amount_paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Txn ID:</span>
              <span className="text-indigo-600 truncate max-w-[180px]">{receipt.transaction_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-emerald-600 font-bold">{receipt.status}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Close & View Receipt
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-muted/40 rounded-xl space-y-1 border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Payable Fee</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-foreground">{feeHead}</span>
              <span className="text-lg font-black text-indigo-600">₹{amount.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Select Payment Mode:</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['UPI', 'CARD', 'NET_BANKING'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`p-2.5 rounded-lg border text-center font-bold transition-all ${
                    paymentMode === mode
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-muted/40 text-foreground hover:bg-muted'
                  }`}
                >
                  {mode.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {paymentMode === 'UPI' && (
            <div className="p-3 bg-muted/20 border border-dashed rounded-xl text-center space-y-1">
              <QrCode className="w-8 h-8 text-indigo-600 mx-auto" />
              <span className="text-xs font-bold text-foreground block">Instant VPA / QR Flow</span>
              <span className="text-[10px] text-muted-foreground font-mono">rkvnexus.fees@icici</span>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>{loading ? 'Processing Transaction...' : `Pay ₹${amount.toLocaleString()}`}</span>
          </button>
        </div>
      )}
    </div>
  );
}
