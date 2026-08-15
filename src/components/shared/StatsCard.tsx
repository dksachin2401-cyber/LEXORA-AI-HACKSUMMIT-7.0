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
  variant = 'default',
  className,
}: StatsCardProps) {
  const iconBgClass = {
    gold: 'bg-amber-500/10 text-amber-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
    default: 'bg-slate-500/10 text-slate-400 dark:bg-white/10 dark:text-slate-300',
  }[variant];

  const glowClass = {
    gold: 'glow-gold',
    cyan: 'glow-cyan',
    default: '',
  }[variant];

  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      className={cn('glass-card p-6', glowClass, className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-emerald-500' : 'text-red-400'
                )}
              >
                {trend.value}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconBgClass)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

export default StatsCard;
