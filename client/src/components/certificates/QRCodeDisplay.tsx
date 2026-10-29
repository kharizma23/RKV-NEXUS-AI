'use client';

import React, { useState } from 'react';
import { QrCode, Copy, Check, Download } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  qrCodeSvg?: string;
  title?: string;
}

export function QRCodeDisplay({
  value,
  size = 140,
  qrCodeSvg,
  title = "Instant Verification QR Code"
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/95 dark:bg-slate-900 rounded-xl border border-border shadow-sm text-center">
      <div className="p-2 bg-white rounded-lg border shadow-inner">
        {qrCodeSvg ? (
          <div
            className="w-32 h-32 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: qrCodeSvg.startsWith('data:image/svg+xml;utf8,') ? qrCodeSvg.replace('data:image/svg+xml;utf8,', '') : qrCodeSvg }}
          />
        ) : (
          <div className="w-32 h-32 bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-2">
            <QrCode className="w-16 h-16 text-indigo-600 mb-1" />
            <span className="text-[10px] text-slate-500 font-mono">Scan on Polygon</span>
          </div>
        )}
      </div>

      <span className="mt-2 text-xs font-bold text-foreground">{title}</span>
      <p className="text-[11px] text-muted-foreground mt-0.5">Scan to verify tamper-proof signature</p>

      <button
        onClick={handleCopy}
        className="mt-3 flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-muted hover:bg-muted/80 rounded border transition-colors text-foreground"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-500" />
            <span>Copied URL</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 text-muted-foreground" />
            <span>Copy Hash / URL</span>
          </>
        )}
      </button>
    </div>
  );
}
