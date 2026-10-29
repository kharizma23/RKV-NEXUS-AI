'use client';

import React, { useState } from 'react';
import { Target, Plus, Check, Save } from 'lucide-react';

export function SkillMappingEditor() {
  const [coMappings, setCoMappings] = useState([
    { co: 'CO1: Asymptotic Analysis', skill: 'Problem Solving', level: 'Level 3 (Advanced)' },
    { co: 'CO2: Distributed Consensus Proofs', skill: 'Critical Thinking', level: 'Level 4 (Mastery)' },
    { co: 'CO3: Architecture Documentation', skill: 'Technical Communication', level: 'Level 3 (Advanced)' }
  ]);
  const [newCo, setNewCo] = useState('');
  const [newSkill, setNewSkill] = useState('Critical Thinking');
  const [newLevel, setNewLevel] = useState('Level 3 (Advanced)');
  const [saved, setSaved] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCo.trim()) return;
    setCoMappings((prev) => [...prev, { co: newCo.trim(), skill: newSkill, level: newLevel }]);
    setNewCo('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Course Outcome (CO) to Industry Skill Mapping</h3>
          <p className="text-xs text-muted-foreground">
            Bind examination course outcomes to global industry competency taxonomy.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {coMappings.map((m, i) => (
          <div key={i} className="p-3 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">{m.co}</span>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[11px]">{m.skill}</span>
              <span className="text-muted-foreground text-[11px]">{m.level}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-border/40">
        <input
          type="text"
          placeholder="New Course Outcome (e.g. CO4: Network Flow)"
          value={newCo}
          onChange={(e) => setNewCo(e.target.value)}
          className="sm:col-span-2 px-3 py-1.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
        />
        <select
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="Critical Thinking">Critical Thinking</option>
          <option value="Problem Solving">Problem Solving</option>
          <option value="Technical Communication">Communication</option>
          <option value="Architectural Creativity">Creativity</option>
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Map CO
        </button>
      </form>
    </div>
  );
}
