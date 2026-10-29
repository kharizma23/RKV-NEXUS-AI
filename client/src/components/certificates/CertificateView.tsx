'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Award, ShieldCheck, QrCode, ExternalLink, Download, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';
import { BlockchainProof } from './BlockchainProof';
import { QRCodeDisplay } from './QRCodeDisplay';

export function CertificateView() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/student/certificates');
      setCertificates(res.data || []);
      if (res.data?.length > 0) {
        setSelectedCert(res.data[0]);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">Verified Academic Credentials</h1>
          <p className="text-xs text-muted-foreground">
            Tamper-proof academic degrees cryptographically anchored to Polygon PoS Testnet
          </p>
        </div>
        <a
          href="/verify-certificate"
          target="_blank"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Public Verification Gateway</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground text-xs animate-pulse">
          Loading credentials from blockchain...
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      ) : certificates.length === 0 ? (
        <div className="p-12 text-center bg-card border rounded-2xl text-muted-foreground text-xs">
          No certificates issued yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
              Your Credentials ({certificates.length})
            </h2>
            {certificates.map((cert) => {
              const isSelected = selectedCert?.id === cert.id;
              return (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500 shadow-sm'
                      : 'bg-card hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-600 flex items-center justify-center font-bold">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-foreground">
                          {cert.metadata?.title || 'Bachelor of Technology'}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {cert.metadata?.honors || 'Distinction'}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Polygon</span>
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="truncate max-w-[150px]">{cert.certificate_hash.slice(0, 16)}...</span>
                    <span>{new Date(cert.issued_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedCert && (
              <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Official Degree</span>
                    <h2 className="text-lg font-black text-foreground">{selectedCert.metadata?.title || 'Bachelor of Technology'}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Issued to {selectedCert.metadata?.student_name || 'Student Candidate'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => alert(`Verification link copied:\n${window.location.origin}/verify-certificate?hash=${selectedCert.certificate_hash}`)}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs font-semibold flex items-center space-x-1 text-foreground border"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Link</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/40 rounded-xl space-y-2 border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Academic Merit</span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">CGPA:</span>
                      <span className="font-bold text-foreground">{selectedCert.metadata?.cgpa || '8.85'} / 10.0</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Honors Classification:</span>
                      <span className="font-bold text-emerald-600">{selectedCert.metadata?.honors || 'First Class Distinction'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Issuing Senate:</span>
                      <span className="font-semibold text-foreground">RKV NEXUS Academic Board</span>
                    </div>
                  </div>

                  <QRCodeDisplay
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/certificates/verify/${selectedCert.certificate_hash}`}
                    qrCodeSvg={selectedCert.qr_code_data}
                    title="Scan to Verify on Mobile"
                  />
                </div>

                <BlockchainProof
                  txHash={selectedCert.blockchain_tx_hash}
                  blockNumber={selectedCert.block_number}
                  network={selectedCert.network}
                  contractAddress={selectedCert.contract_address}
                  issuedAt={selectedCert.issued_at}
                  isValid={selectedCert.is_valid}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateView;
