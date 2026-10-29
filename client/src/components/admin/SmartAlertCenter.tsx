'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertOctagon, AlertTriangle, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import useRouter from 'next/navigation';

export interface SmartAlert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'SUGGESTION' | 'SUCCESS';
  title: string;
  message: string;
  action_label: string;
  action_type: string;
}

interface Props {
  alerts?: SmartAlert[];
  onAction?: (actionType: string) => void;
}

export function SmartAlertCenter({ alerts, onAction }: Props) {
  const defaultAlerts: SmartAlert[] = [
    {
      id: 'alert-1',
      type: 'CRITICAL',
      title: '3 Programmes have no active faculty assigned',
      message: 'B.Tech AI & Data Science and M.Tech Cyber Security require designated course leads.',
      action_label: 'ASSIGN FACULTY',
      action_type: 'NAVIGATE_FACULTY',
    },
    {
      id: 'alert-2',
      type: 'WARNING',
      title: '5 Students at-risk in AI course (Attendance < 75%)',
      message: 'Automatic academic advisories sent to student dashboards & class coordinators.',
      action_label: 'VIEW DETAILS',
      action_type: 'VIEW_AT_RISK',
    },
    {
      id: 'alert-3',
      type: 'SUGGESTION',
      title: 'Add Cloud Computing to CSE 5th Semester',
      message: 'Industry placement benchmarks show 45% increase in Cloud Architecture skills demand.',
      action_label: 'ADD NOW',
      action_type: 'OPEN_PROGRAMME_GEN',
    },
    {
      id: 'alert-4',
      type: 'SUCCESS',
      title: 'CO Attainment increased by 12% this semester',
      message: 'Apex Institute CSE department achieved 88.5% outcome attainment score.',
      action_label: 'SHARE REPORT',
      action_type: 'GENERATE_REPORT',
    },
  ];

  const list = alerts && alerts.length > 0 ? alerts : defaultAlerts;

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return {
          icon: <AlertOctagon className="w-5 h-5 text-rose-500" />,
          cardBg: 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40',
          btnStyle: 'bg-rose-600 hover:bg-rose-700 text-white',
          tag: 'bg-rose-500/10 text-rose-600 font-black',
        };
      case 'WARNING':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          cardBg: 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40',
          btnStyle: 'bg-amber-600 hover:bg-amber-700 text-white',
          tag: 'bg-amber-500/10 text-amber-600 font-black',
        };
      case 'SUGGESTION':
        return {
          icon: <Lightbulb className="w-5 h-5 text-cyan-500" />,
          cardBg: 'bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40',
          btnStyle: 'bg-cyan-600 hover:bg-cyan-700 text-white',
          tag: 'bg-cyan-500/10 text-cyan-600 font-black',
        };
      default:
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          cardBg: 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40',
          btnStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          tag: 'bg-emerald-500/10 text-emerald-600 font-black',
        };
    }
  };

  return (
    <Card className="shadow-sm border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Bell className="w-5 h-5 text-amber-500 animate-bounce" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">🔔 Smart Alert & Monitoring Center</CardTitle>
            <CardDescription className="text-xs">
              Real-time actionable governance notifications with instant resolution controls
            </CardDescription>
          </div>
        </div>
        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground border">
          {list.length} Active Notifications
        </span>
      </CardHeader>

      <CardContent className="space-y-3">
        {list.map((item) => {
          const style = getBadgeStyle(item.type);
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${style.cardBg}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5">{style.icon}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider rounded ${style.tag}`}>
                      {item.type}
                    </span>
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.message}</p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => onAction && onAction(item.action_type)}
                className={`text-xs font-bold px-4 py-2 shrink-0 rounded-lg shadow-sm ${style.btnStyle}`}
              >
                {item.action_label} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
