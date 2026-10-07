'use client';

import React from 'react';
import { Award, CheckCircle2, Heart, Zap, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Student360Profile } from './types';

interface ProfileCardsProps {
  profile: Student360Profile;
}

export function ProfileCards({ profile }: ProfileCardsProps) {
  const academicVal = profile.academic_score ?? 88.5;
  const attendanceVal = profile.attendance_rate ?? 95;
  const wellnessVal = profile.wellness_index ?? profile.wellness_score ?? 91;
  const skillVal = profile.skill_score ?? 87;
  const placementVal = profile.placement_readiness ?? 89.5;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* CARD 1: Academic Score */}
      <Card id="card-academic-score" className="hover:border-indigo-500/50 hover:shadow-md transition-all border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Academic Score
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {academicVal}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">
            Semester Average
          </p>
        </CardContent>
      </Card>

      {/* CARD 2: Attendance */}
      <Card id="card-attendance" className="hover:border-emerald-500/50 hover:shadow-md transition-all border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Attendance
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {attendanceVal}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">
            Biometric Verified
          </p>
        </CardContent>
      </Card>

      {/* CARD 3: Wellness Index */}
      <Card id="card-wellness-index" className="hover:border-rose-500/50 hover:shadow-md transition-all border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Wellness Index
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {wellnessVal}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">
            Resilience Score
          </p>
        </CardContent>
      </Card>

      {/* CARD 4: Skill Score */}
      <Card id="card-skill-score" className="hover:border-amber-500/50 hover:shadow-md transition-all border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Skill Score
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {skillVal}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">
            Industry Verified
          </p>
        </CardContent>
      </Card>

      {/* CARD 5: Placement Ready */}
      <Card id="card-placement-ready" className="hover:border-cyan-500/50 hover:shadow-md transition-all border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Placement Ready
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {placementVal}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">
            Tier-1 Qualified
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
