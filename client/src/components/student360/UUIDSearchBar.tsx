'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, UserCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { StudentSearchResult } from './types';

interface UUIDSearchBarProps {
  onInspect: (uuid: string) => Promise<void>;
  loading: boolean;
  value?: string;
  onChange?: (val: string) => void;
}

export function UUIDSearchBar({ onInspect, loading, value, onChange }: UUIDSearchBarProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<StudentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (onChange) onChange(val);
  };

  // Autocomplete debounced search
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await apiClient.get<StudentSearchResult[]>(
          `/admin/students/search?q=${encodeURIComponent(trimmed)}`
        );
        if (Array.isArray(results) && results.length > 0) {
          setSuggestions(results);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch (err) {
        // Silently handle autocomplete error
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: StudentSearchResult) => {
    handleInputChange(item.student_id);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    onInspect(inputValue.trim());
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute left-3.5 top-3 text-muted-foreground pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            ) : (
              <Search className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <input
            id="student-uuid-input"
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder="Enter Student UUID or leave empty for active scholar..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            autoComplete="off"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                handleInputChange('');
                setSuggestions([]);
                setShowDropdown(false);
              }}
              className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          id="inspect-profile-button"
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 min-w-[150px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Inspecting...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Inspect Profile</span>
            </>
          )}
        </Button>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          <div className="p-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/40 border-b flex items-center justify-between">
            <span>Matching Scholars ({suggestions.length})</span>
            <span className="text-[10px] lowercase font-normal">Click to select UUID</span>
          </div>
          <ul className="divide-y divide-border/50">
            {suggestions.map((student) => (
              <li key={student.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(student)}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-500/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {student.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {student.label || `${student.full_name} (${student.roll_number}) — ${student.student_id}`}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {student.email}
                      </div>
                    </div>
                  </div>
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
