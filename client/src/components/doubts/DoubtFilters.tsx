'use client';

import React from 'react';
import { Filter, ArrowUpDown, Calendar, BookOpen, Building2, Layers } from 'lucide-react';

export interface DoubtFilterState {
  subject: string;
  department: string;
  semester: string;
  dateRange: string;
  sortBy: 'frequency' | 'recent' | 'severity';
}

interface DoubtFiltersProps {
  filters: DoubtFilterState;
  onChange: (filters: DoubtFilterState) => void;
  onReset: () => void;
}

export function DoubtFilters({ filters, onChange, onReset }: DoubtFiltersProps) {
  const updateField = (field: keyof DoubtFilterState, value: string) => {
    onChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="p-4 bg-card/80 backdrop-blur-md border rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Filter className="w-4 h-4 text-indigo-500" />
          <span>Diagnostic Filters & Sorters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        {/* Subject Filter */}
        <div className="space-y-1">
          <label className="font-semibold text-muted-foreground flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Subject
          </label>
          <select
            value={filters.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="">All Subjects</option>
            <option value="DBMS">Database Management Systems (CS301)</option>
            <option value="AI">Artificial Intelligence & Ethics (CS302)</option>
            <option value="ML">Machine Learning Foundations (CS303)</option>
            <option value="CLOUD">Cloud Computing Architecture (CS304)</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="space-y-1">
          <label className="font-semibold text-muted-foreground flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => updateField('department', e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="">All Departments</option>
            <option value="CSE">Computer Science & Engineering</option>
            <option value="IT">Information Technology</option>
            <option value="AIDS">Artificial Intelligence & Data Science</option>
          </select>
        </div>

        {/* Semester Filter */}
        <div className="space-y-1">
          <label className="font-semibold text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Semester
          </label>
          <select
            value={filters.semester}
            onChange={(e) => updateField('semester', e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="">All Semesters</option>
            <option value="5">Semester 5 (Odd)</option>
            <option value="6">Semester 6 (Even)</option>
            <option value="7">Semester 7 (Odd)</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-1">
          <label className="font-semibold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date Window
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => updateField('dateRange', e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="all">All-Time Telemetry</option>
            <option value="7d">Last 7 Days (Recent Quizzes)</option>
            <option value="30d">Last 30 Days (Midterm Term)</option>
            <option value="90d">Current Semester</option>
          </select>
        </div>

        {/* Sort Sorter */}
        <div className="space-y-1">
          <label className="font-semibold text-muted-foreground flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" /> Sort Order
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateField('sortBy', e.target.value as any)}
            className="w-full px-3 py-2 bg-background border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="frequency">Highest Frequency (Most Affected)</option>
            <option value="severity">Severity (High to Low)</option>
            <option value="recent">Most Recently Detected</option>
          </select>
        </div>
      </div>
    </div>
  );
}
