'use client';

import React from 'react';
import { ShieldCheck, ExternalLink, Hash, CheckCircle2, Lock } from 'lucide-react';

interface BlockchainProofProps {
  txHash: string;
  blockNumber: number;
  network?: string;
  contractAddress?: string;
  issuedAt?: string;
  isValid?: boolean;
}

export function BlockchainProof({
  txHash,
  blockNumber,
  network = 'Polygon Amoy Testnet',
  contractAddress = '0x71C95911E9a5D330f4D621842EC243EE1343292e',
  issuedAt,
  isValid = true
}: BlockchainProofProps) {
  const explorerUrl = `https://amoy.polygonscan.com/tx/${txHash}`;

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-5 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-sm tracking-wide">Polygon PoS Cryptographic Ledger Proof</h4>
              {isValid ? (
                <span className="flex items-center space-x-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>On-Chain Verified</span>
                </span>
              ) : (
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/30">
                  Revoked
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-300/70">ERC-721 Academic Credential Standard</p>
          </div>
        </div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
        >
          <span>PolygonScan</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-black/40 p-3 border border-white/5">
          <span className="text-muted-foreground block text-[10px] uppercase font-mono text-indigo-300/60">Transaction Hash</span>
          <span className="font-mono text-emerald-300 break-all text-[11px] select-all font-semibold">
            {txHash}
          </span>
        </div>

        <div className="rounded-lg bg-black/40 p-3 border border-white/5">
          <span className="text-muted-foreground block text-[10px] uppercase font-mono text-indigo-300/60">Smart Contract Address</span>
          <span className="font-mono text-indigo-200 break-all text-[11px] select-all">
            {contractAddress}
          </span>
        </div>

        <div className="rounded-lg bg-black/40 p-3 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-mono text-indigo-300/60">Network / Consensus</span>
            <span className="font-semibold text-slate-200">{network}</span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground block text-[10px] uppercase font-mono text-indigo-300/60">Block Number</span>
            <span className="font-mono font-bold text-amber-300">#{blockNumber}</span>
          </div>
        </div>

        <div className="rounded-lg bg-black/40 p-3 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-mono text-indigo-300/60">Issued Timestamp</span>
            <span className="font-semibold text-slate-200">
              {issuedAt ? new Date(issuedAt).toLocaleString() : 'Live Blockchain Timestamp'}
            </span>
          </div>
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
        </div>
      </div>
    </div>
  );
}
