'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { apiClient } from '@/lib/api/client';

export function DoubtTrendChart() {
  const [mode, setMode] = useState<'weekly' | 'monthly'>('weekly');
  const [data, setData] = useState<{ weekly: any[]; monthly: any[] }>({ weekly: [], monthly: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient<{ weekly: any[]; monthly: any[] }>('/faculty/doubts/trends')
      .then((res) => {
        if (res) setData(res);
      })
      .catch((err) => console.error('Failed to load doubt trends', err))
      .finally(() => setLoading(false));
  }, []);

  const chartData = mode === 'weekly' ? data.weekly : data.monthly;

  return (
    <div className="p-5 bg-card border rounded-2xl shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Misconception Velocity & Recurrence Trends</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tracking emerging versus persistent knowledge gaps over time
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/30 border self-start sm:self-auto text-xs">
          <button
            onClick={() => setMode('weekly')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              mode === 'weekly'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setMode('monthly')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              mode === 'monthly'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey={mode === 'weekly' ? 'week' : 'month'}
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="new_doubts"
                name="New Misconceptions"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNew)"
              />
              <Area
                type="monotone"
                dataKey="recurring_doubts"
                name="Recurring Bottlenecks"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRec)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
