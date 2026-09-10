import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50',
  Active: 'bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/50',
  Closed: 'bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
  Adjourned: 'bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50',
  Reserved: 'bg-slate-100 text-slate-900 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
  High: 'bg-rose-50 text-rose-900 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-700/50',
  Medium: 'bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50',
  Low: 'bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
  Scheduled: 'bg-blue-50 text-blue-900 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700/50',
  'In Progress': 'bg-blue-50 text-blue-900 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700/50',
  Completed: 'bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/50',
  Postponed: 'bg-rose-50 text-rose-900 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-700/50',
  Online: 'bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/50',
  SUPPORTED: 'bg-emerald-50 text-emerald-900 border border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-600',
  SUGGESTED: 'bg-amber-50 text-amber-900 border border-amber-400 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-600',
  APPROVED: 'bg-emerald-50 text-emerald-900 border border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-600',
  REJECTED: 'bg-rose-50 text-rose-900 border border-rose-400 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-600',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles['Pending'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold leading-none shrink-0 tracking-tight',
        style,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          status === 'Active' || status === 'Online' || status === 'Completed' || status === 'SUPPORTED' || status === 'APPROVED'
            ? 'bg-emerald-500'
            : status === 'High' || status === 'REJECTED' || status === 'Postponed'
            ? 'bg-rose-500'
            : 'bg-amber-500'
        )}
      />
      <span>{status}</span>
    </span>
  );
}

export default StatusBadge;
