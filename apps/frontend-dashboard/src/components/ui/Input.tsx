import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import type { InputProps } from '../../types/ui.props.types';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'block w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 bg-white',
        'placeholder-slate-400',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70',
        hasError
          ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
          : 'border-slate-300 focus:border-slate-500 focus:ring-slate-200',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
