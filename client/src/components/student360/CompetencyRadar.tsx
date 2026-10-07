'use client';

import React from 'react';

interface RadarDimension {
  dimension: string;
  value: number;
  fullMark?: number;
}

interface CompetencyRadarProps {
  dimensions?: RadarDimension[];
  academicScore?: number;
  attendanceRate?: number;
  wellnessIndex?: number;
  skillScore?: number;
  placementReadiness?: number;
}

export function CompetencyRadar({
  dimensions,
  academicScore = 88.5,
  attendanceRate = 95,
  wellnessIndex = 91,
  skillScore = 87,
  placementReadiness = 89.5,
}: CompetencyRadarProps) {
  // 5 dimensions: Academics, Attendance, Wellness, Skill, Placement
  const resolvedDimensions: RadarDimension[] = dimensions && dimensions.length === 5
    ? dimensions
    : [
        { dimension: 'Academics', value: academicScore, fullMark: 100 },
        { dimension: 'Attendance', value: attendanceRate, fullMark: 100 },
        { dimension: 'Wellness', value: wellnessIndex, fullMark: 100 },
        { dimension: 'Skill', value: skillScore, fullMark: 100 },
        { dimension: 'Placement', value: placementReadiness, fullMark: 100 },
      ];

  const size = 360;
  const center = size / 2;
  const radius = size * 0.36;
  const total = resolvedDimensions.length;

  // Generate pentagon grid polygon points for a given scale (0 to 1)
  const getPolygonPoints = (scale: number) => {
    return Array.from({ length: total }).map((_, i) => {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const x = center + radius * scale * Math.cos(angle);
      const y = center + radius * scale * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Generate data polygon points
  const dataPoints = resolvedDimensions.map((dim, i) => {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const clampedVal = Math.min(Math.max(dim.value, 0), 100);
    const r = (clampedVal / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, value: dim.value, name: dim.dimension, angle };
  });

  const dataPolygonPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-border w-full">
      <svg
        id="pentagonal-competency-radar"
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[340px] h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
          </linearGradient>
          <filter id="radarShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Pentagonal Concentric Web Rings (20%, 40%, 60%, 80%, 100%) */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((step, idx) => (
          <polygon
            key={idx}
            points={getPolygonPoints(step)}
            fill={step === 1.0 ? 'rgba(99, 102, 241, 0.03)' : 'none'}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeDasharray={step === 1.0 ? 'none' : '3 3'}
            strokeWidth={step === 1.0 ? '1.5' : '1'}
          />
        ))}

        {/* 5 Radial Spoke Lines */}
        {resolvedDimensions.map((_, i) => {
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
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-700"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={dataPolygonPath}
          fill="url(#radarFillGradient)"
          stroke="#4f46e5"
          strokeWidth="2.5"
          filter="url(#radarShadow)"
          className="transition-all duration-500 ease-out"
        />

        {/* Vertex Points & Score Tooltip Badges */}
        {dataPoints.map((p, i) => (
          <g key={i} className="cursor-pointer group">
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#4f46e5"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="transition-transform group-hover:scale-125"
            />
          </g>
        ))}

        {/* Dimension Labels and Score Percentages */}
        {resolvedDimensions.map((dim, i) => {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const labelDist = radius + 26;
          const x = center + labelDist * Math.cos(angle);
          const y = center + labelDist * Math.sin(angle) + 4;
          return (
            <g key={i}>
              <text
                x={x}
                y={y}
                textAnchor="middle"
                className="text-[11px] font-black fill-slate-800 dark:fill-slate-100 select-none tracking-tight"
              >
                {dim.dimension}
              </text>
              <text
                x={x}
                y={y + 12}
                textAnchor="middle"
                className="text-[10px] font-bold fill-indigo-600 dark:fill-indigo-400 select-none"
              >
                {dim.value}%
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground font-semibold">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
          Pentagonal Competency Spectrum (5 Dimensions)
        </span>
      </div>
    </div>
  );
}
