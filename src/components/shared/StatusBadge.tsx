import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-900 border border-amber-300',
  Active: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
  Closed: 'bg-slate-100 text-slate-800 border border-slate-300',
  Adjourned: 'bg-orange-100 text-orange-900 border border-orange-300',
  Reserved: 'bg-purple-100 text-purple-900 border border-purple-300',
  High: 'bg-rose-100 text-rose-900 border border-rose-300',
  Medium: 'bg-amber-100 text-amber-900 border border-amber-300',
  Low: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
  Scheduled: 'bg-blue-100 text-blue-900 border border-blue-300',
  'In Progress': 'bg-cyan-100 text-cyan-900 border border-cyan-300',
  Completed: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
  Postponed: 'bg-rose-100 text-rose-900 border border-rose-300',
  Online: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles['Pending'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold leading-none shrink-0',
        style,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          status === 'Active' || status === 'Online' || status === 'Completed'
            ? 'bg-emerald-600'
            : status === 'In Progress'
            ? 'bg-cyan-600'
            : status === 'High'
            ? 'bg-rose-600'
            : 'bg-amber-600'
        )}
      />
      <span>{status}</span>
    </span>
  );
}

export default StatusBadge;
