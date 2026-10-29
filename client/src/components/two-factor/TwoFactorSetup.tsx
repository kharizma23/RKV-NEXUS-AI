'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Key, CheckCircle, Copy, Download, RefreshCw } from 'lucide-react';

export function TwoFactorSetup() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'TOTP' })
      });
      if (res.ok) {
        const json = await res.json();
        setSecret(json.secret);
        setBackupCodes(json.backup_codes || []);
        setIsEnabled(true);
        setMessage('2FA has been successfully provisioned. Verify your 6-digit authenticator code below.');
      }
    } catch (e) {
      console.error('2FA enable error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otpCode })
      });
      if (res.ok) {
        setMessage('✅ Two-Factor Authentication code verified! Your account is protected.');
      } else {
        setMessage('❌ Verification failed. Please verify the code on your authenticator app.');
      }
    } catch (e) {
      console.error('OTP error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/2fa/disable', { method: 'POST' });
      if (res.ok) {
        setIsEnabled(false);
        setSecret('');
        setBackupCodes([]);
        setMessage('Two-Factor Authentication has been disabled.');
      }
    } catch (e) {
      console.error('Disable 2FA error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Two-Factor Authentication (2FA) Security
          </CardTitle>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isEnabled ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground'
          }`}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 text-xs">
        {message && (
          <div className="p-3 rounded-lg border bg-muted/20 text-foreground font-semibold">
            {message}
          </div>
        )}

        {!isEnabled ? (
          <div className="space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              Enhance examination security by requiring a 6-digit Time-based One-Time Password (TOTP) from Google Authenticator or Microsoft Authenticator during sign-in.
            </p>
            <Button
              onClick={handleEnable2FA}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs"
            >
              <Key className="w-3.5 h-3.5 mr-1.5" /> Enable TOTP Authenticator
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border bg-muted/10 space-y-2">
              <span className="font-bold text-foreground">Authenticator Setup Key:</span>
              <div className="font-mono bg-background p-2 rounded border text-center font-bold tracking-widest text-primary text-sm">
                {secret}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Enter this key into your Google Authenticator app or scan the institutional QR configuration.
              </p>
            </div>

            {backupCodes.length > 0 && (
              <div className="p-3.5 rounded-xl border bg-muted/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Emergency Backup Codes</span>
                  <span className="text-[10px] text-muted-foreground">Single-use emergency codes</span>
                </div>
                <div className="grid grid-cols-4 gap-2 font-mono text-center text-[11px] font-bold">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="bg-background p-1.5 rounded border">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="bg-background border rounded px-3 py-1.5 text-center font-mono font-bold tracking-widest text-sm w-44 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otpCode.length < 6}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Verify Code
              </Button>
              <Button
                variant="outline"
                onClick={handleDisable2FA}
                className="text-xs font-bold text-rose-500 border-rose-500/30 hover:bg-rose-500/10 ml-auto"
              >
                Disable 2FA
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
