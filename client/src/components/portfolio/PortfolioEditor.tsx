'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface PortfolioEditorProps {
  onClose: () => void;
  onAdded: () => void;
}

export function PortfolioEditor({ onClose, onAdded }: PortfolioEditorProps) {
  const [itemType, setItemType] = useState('PROJECT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient('/student/portfolio/item', {
        method: 'POST',
        body: JSON.stringify({
          item_type: itemType,
          title: title.trim(),
          description: description.trim(),
          evidence_url: evidenceUrl.trim() || undefined,
        }),
      });
      onAdded();
    } catch (err: any) {
      setError(err?.message || 'Failed to attach artifact to portfolio.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Add Verified Portfolio Item
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Artifact Category</label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="PROJECT">Software / Research Project</option>
              <option value="EXAM">Distinction Exam Assessment</option>
              <option value="CERTIFICATION">Industry Certification</option>
              <option value="PUBLICATION">Academic Publication</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Artifact Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus Engine in Rust"
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Description & Technical Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Engineered multi-threaded Raft leader election with formal Paxos invariants..."
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Evidence Link / GitHub Repository (Optional)</label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://github.com/scholar/project"
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {submitting ? 'Attaching...' : 'Add to Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
