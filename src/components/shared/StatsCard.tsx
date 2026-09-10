import React from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cardHoverVariants } from '@/hooks/useAnimations';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  variant?: 'gold' | 'cyan' | 'default';
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      className={cn('theme-card p-5', className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs theme-subtext font-mono font-medium uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-serif font-bold theme-heading tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              )}
              <span
                className={cn(
                  'text-xs font-semibold font-mono',
                  trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {trend.value}%
              </span>
              <span className="text-[11px] theme-subtext">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-sm theme-elevated text-[var(--primary-accent)] border border-subtle">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

export default StatsCard;
