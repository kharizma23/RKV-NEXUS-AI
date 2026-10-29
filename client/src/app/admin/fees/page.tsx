'use client';

import React, { useState } from 'react';
import FeeAnalytics from '@/components/fees/FeeAnalytics';
import DefaulterList from '@/components/fees/DefaulterList';
import { CreditCard, AlertTriangle, BarChart3 } from 'lucide-react';

export default function AdminFeesPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'defaulters'>('analytics');

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            AI Fee Management & Predictive Defaulter Radar
          </h1>
          <p className="text-slate-400 text-sm">
            Institutional fee collections, revenue realization, and ML-powered defaulter risk classification.
          </p>
        </div>

        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Financial Analytics
          </button>
          <button
            onClick={() => setActiveTab('defaulters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'defaulters' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Predicted Defaulters
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? <FeeAnalytics /> : <DefaulterList />}
    </div>
  );
}
