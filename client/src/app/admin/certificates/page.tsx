'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import CertificateView from '@/components/certificates/CertificateView';
import { Award, ShieldCheck, Check, AlertCircle } from 'lucide-react';

export default function AdminCertificatesPage() {
  const [studentId, setStudentId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !programmeId) return;

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await apiClient.post<any>('/certificates/issue', {
        student_id: studentId,
        programme_id: programmeId,
      });
      setSuccessMsg(`Certificate successfully minted on Polygon PoS! Tx: ${res.blockchain_tx_hash.slice(0, 16)}...`);
      setStudentId('');
      setProgrammeId('');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to issue blockchain certificate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Award className="w-7 h-7 text-indigo-400" />
          Blockchain Academic Credential Issuance
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Mint cryptographically verifiable, tamper-proof academic degrees and diplomas directly to Polygon PoS blockchain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Issue Form */}
        <div className="lg:col-span-1 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl h-fit">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Issue New Certificate
          </h2>

          {successMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleIssue} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Student ID / UUID
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Academic Programme
              </label>
              <select
                required
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select Programme...</option>
                <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science & Engineering</option>
                <option value="B.Tech Artificial Intelligence & Data Science">B.Tech Artificial Intelligence & Data Science</option>
                <option value="B.Tech Electronics & Communication">B.Tech Electronics & Communication</option>
                <option value="M.Tech Software Engineering">M.Tech Software Engineering</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-xs hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-indigo-500/20"
            >
              {loading ? 'Minting on Chain...' : 'Mint & Issue Degree'}
            </button>
          </form>
        </div>

        {/* Existing Certificates List */}
        <div className="lg:col-span-2">
          <CertificateView key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
