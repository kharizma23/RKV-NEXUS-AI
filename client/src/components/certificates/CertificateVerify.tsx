'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { BlockchainProof } from './BlockchainProof';
import { QRCodeDisplay } from './QRCodeDisplay';
import { ShieldCheck, Search, AlertCircle, Award, CheckCircle2, User, Building, Calendar } from 'lucide-react';

interface CertificateVerifyProps {
  initialHash?: string;
}

export function CertificateVerify({ initialHash = '' }: CertificateVerifyProps) {
  const [hash, setHash] = useState(initialHash);
  const [verifierName, setVerifierName] = useState('Public Employer / Recruiter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certData, setCertData] = useState<any>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hash.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>(`/certificates/verify/${hash.trim()}?verified_by=${encodeURIComponent(verifierName)}`);
      setCertData(res.data);
    } catch (err: any) {
      setError(err?.message || 'Certificate verification failed or hash is invalid on-chain');
      setCertData(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialHash) {
      handleVerify();
    }
  }, [initialHash]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Decentralized Verification Gateway</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
          Academic Certificate Blockchain Verification
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Verify digital degrees and credentials anchored immutably to Polygon blockchain. Cryptographically verified against fraud.
        </p>
      </div>

      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Certificate SHA-256 Hash
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter 64-character certificate hash or scan QR"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-background border rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none text-foreground"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Verifying Entity / Recruiter
              </label>
              <input
                type="text"
                placeholder="Company / University Name"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-foreground"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !hash.trim()}
            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{loading ? 'Verifying on Polygon PoS...' : 'Verify Authenticity'}</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-600 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {certData && (
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-black text-foreground">
                      {certData.metadata?.title || 'Bachelor of Technology'}
                    </h2>
                    {certData.is_valid ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 text-[11px] font-bold border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VERIFIED AUTHENTIC</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 text-[11px] font-bold border border-rose-500/30">
                        REVOKED CREDENTIAL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    {certData.programme || 'Computer Science & Engineering'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border">
                <span>Cert ID:</span>
                <span className="font-bold text-foreground">{certData.certificate_id?.slice(0, 8)}...</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Candidate Name</span>
                  <p className="text-sm font-bold text-foreground">{certData.issued_to}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">ID: {certData.student_id?.slice(0, 8)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Building className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Awarding Authority</span>
                  <p className="text-sm font-bold text-foreground">RKV NEXUS Senate</p>
                  <p className="text-[11px] text-muted-foreground">{certData.metadata?.honors || 'First Class Distinction'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Conferral Date</span>
                  <p className="text-sm font-bold text-foreground">
                    {certData.issued_at ? new Date(certData.issued_at).toLocaleDateString() : 'Active'}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold">CGPA: {certData.metadata?.cgpa || '8.85'}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <BlockchainProof
                  txHash={certData.blockchain_proof?.blockchain_tx_hash}
                  blockNumber={certData.blockchain_proof?.block_number || 48921820}
                  network={certData.blockchain_proof?.network}
                  contractAddress={certData.blockchain_proof?.contract_address}
                  issuedAt={certData.issued_at}
                  isValid={certData.is_valid}
                />
              </div>
              <div>
                <QRCodeDisplay
                  value={`https://platform.rkvnexus.edu/verify/${certData.certificate_hash}`}
                  qrCodeSvg={certData.qr_code_data}
                  title="Tamper-Proof QR"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateVerify;
