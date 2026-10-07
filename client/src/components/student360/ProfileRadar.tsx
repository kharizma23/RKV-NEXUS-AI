'use client';

import React from 'react';

interface RadarDimension {
  dimension: string;
  value: number;
  fullMark: number;
}

interface ProfileRadarProps {
  dimensions: RadarDimension[];
}

export function ProfileRadar({ dimensions }: ProfileRadarProps) {
  const size = 320;
  const center = size / 2;
  const radius = size * 0.36;
  const total = dimensions.length;

  const points = dimensions.map((dim, i) => {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const r = (dim.value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Concentric Webs */}
        {[0.25, 0.5, 0.75, 1.0].map((step, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={radius * step}
            fill="none"
            stroke="#cbd5e1"
            strokeDasharray={step === 1.0 ? 'none' : '3 3'}
            strokeWidth="1"
          />
        ))}

        {/* Radial Axes */}
        {dimensions.map((dim, i) => {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon with vibrant fill */}
        <polygon
          points={polygonPath}
          fill="rgba(99, 102, 241, 0.25)"
          stroke="#6366f1"
          strokeWidth="2.5"
        />

        {/* Value Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4.5"
            fill="#6366f1"
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}

        {/* Labels with sharp contrast */}
        {dimensions.map((dim, i) => {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const labelDist = radius + 22;
          const x = center + labelDist * Math.cos(angle);
          const y = center + labelDist * Math.sin(angle) + 4;
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              className="text-[11px] font-bold fill-slate-700 dark:fill-slate-200"
            >
              {dim.dimension} ({dim.value}%)
            </text>
          );
        })}
      </svg>
    </div>
  );
}
