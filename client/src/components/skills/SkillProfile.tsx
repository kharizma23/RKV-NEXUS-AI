'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Award, CheckCircle2, TrendingUp, Sparkles, ExternalLink } from 'lucide-react';

interface SkillItem {
  skill_id: string;
  skill_name: string;
  category: string;
  proficiency_percentage: number;
  level: string;
  mapped_co: string;
}

interface SkillGapItem {
  skill_name: string;
  current_proficiency: number;
  industry_benchmark: number;
  gap: number;
  recommended_certification: string;
  recommended_resource: string;
}

export function SkillProfile() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [gaps, setGaps] = useState<SkillGapItem[]>([]);
  const [readiness, setReadiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillsData = async () => {
      setLoading(true);
      try {
        const sRes = await fetch('/api/v1/student/skills/profile');
        if (sRes.ok) {
          const sJson = await sRes.json();
          setSkills(sJson.data || []);
        }

        const gRes = await fetch('/api/v1/student/skills/gaps');
        if (gRes.ok) {
          const gJson = await gRes.json();
          setGaps(gJson.data || []);
        }

        const rRes = await fetch('/api/v1/student/placement-readiness');
        if (rRes.ok) {
          const rJson = await rRes.json();
          setReadiness(rJson.data);
        }
      } catch (e) {
        console.error('Error fetching skills', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillsData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Industry Skill Mapping & Placement Readiness Index
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Course Outcome translation into market competencies, technical certifications, and placement CTC tiers.
          </p>
        </div>
      </div>

      {/* Placement Readiness Banner */}
      {readiness && (
        <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-background to-teal-500/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Technical Placement Readiness Evaluation
              </CardTitle>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 font-mono">
                {readiness.readiness_tier}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-black text-foreground">{readiness.readiness_score}%</div>
              <span className="text-xs font-semibold text-emerald-600">{readiness.tier_description}</span>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="font-bold text-muted-foreground">Key Technical Strengths:</span>
              {readiness.key_strengths?.map((str: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded bg-background border font-semibold text-foreground">
                  {str}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills Matrix */}
      <Card className="border">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" /> Academic to Industry Competency Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-xs">
            {skills.map((s) => (
              <div key={s.skill_id} className="p-4 space-y-2 hover:bg-muted/15 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{s.skill_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                      {s.category}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                      {s.mapped_co}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-primary">{s.proficiency_percentage}% ({s.level})</span>
                </div>

                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${s.proficiency_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Certifications & Gaps */}
      <Card className="border">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-600">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Skill Gaps & Recommended Industry Certifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-xs">
            {gaps.map((gap, i) => (
              <div key={i} className="p-4 space-y-1.5 hover:bg-muted/15">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">{gap.skill_name}</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded">
                    -{gap.gap}% Benchmark Gap
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Recommended Certification: </span>
                  {gap.recommended_certification}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Remedial Resource: </span>
                  {gap.recommended_resource}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
