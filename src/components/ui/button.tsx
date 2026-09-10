import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const variantClasses: Record<string, string> = {
  default:
    'theme-primary-btn',
  outline:
    'theme-secondary-btn',
  ghost:
    'bg-transparent hover:bg-slate-200/60 dark:hover:bg-slate-800/80 text-[var(--text-main)]',
  link:
    'bg-transparent text-[var(--primary-accent)] hover:underline underline-offset-4',
  destructive:
    'bg-rose-700 dark:bg-rose-800 text-white hover:bg-rose-800 border border-rose-900',
};

const sizeClasses: Record<string, string> = {
  default: 'h-9 px-4 py-2 text-xs font-semibold',
  sm: 'h-7 px-3 py-1 text-xs font-medium',
  lg: 'h-11 px-6 py-2.5 text-sm font-semibold',
  icon: 'h-8 w-8 text-xs',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#285C7A] dark:focus-visible:ring-[#6FA7C5] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
