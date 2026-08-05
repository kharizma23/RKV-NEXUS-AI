'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Plus, Building2 } from 'lucide-react';

export interface ComboboxOption {
  id: string;
  name: string;
  code?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string, isCustom?: boolean) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  customPlaceholder?: string;
  label?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Type to search by first letter or name...',
  customPlaceholder = 'Enter custom institution name...',
  disabled = false,
  allowCustom = true,
  className = '',
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === value || opt.name === value);

  const filteredOptions = options.filter((opt) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = opt.name.toLowerCase().includes(term);
    const codeMatch = opt.code ? opt.code.toLowerCase().includes(term) : false;
    return nameMatch || codeMatch;
  });

  const handleSelectOption = (opt: ComboboxOption) => {
    setIsCustomMode(false);
    onChange(opt.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSelectCustom = () => {
    setIsCustomMode(true);
    setIsOpen(false);
    if (customValue) {
      onChange(customValue, true);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    onChange(val, true);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {!isCustomMode ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs text-left shadow-sm hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="truncate flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            {selectedOption
              ? `${selectedOption.name}${selectedOption.code ? ` (${selectedOption.code})` : ''}`
              : value
              ? value
              : placeholder}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-2 flex-shrink-0" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customValue}
            onChange={handleCustomInputChange}
            placeholder={customPlaceholder}
            className="w-full p-2.5 rounded-md border border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(false);
              setCustomValue('');
              onChange('');
            }}
            className="px-2.5 py-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            List
          </button>
        </div>
      )}

      {isOpen && !isCustomMode && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl max-h-64 flex flex-col">
          {/* Search Input Box */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 sticky top-0 bg-white dark:bg-slate-800">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-1 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-50 dark:divide-slate-700/50">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.id || value === opt.name;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-700/60 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-slate-700 font-semibold text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>
                      {opt.name} {opt.code && <span className="text-slate-400 font-normal">({opt.code})</span>}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-2 flex-shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-xs text-slate-400 text-center">No matching institutions found</div>
            )}

            {/* Custom Option Entry */}
            {allowCustom && (
              <button
                type="button"
                onClick={handleSelectCustom}
                className="w-full text-left px-3 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700/80 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Other / Add Custom Institution
              </button>
            )}
          </div>

          <div className="p-1.5 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-right pr-3">
            {filteredOptions.length} institutions available
          </div>
        </div>
      )}
    </div>
  );
}
