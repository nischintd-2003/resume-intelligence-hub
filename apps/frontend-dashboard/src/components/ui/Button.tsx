import type { ButtonProps, ButtonSize, ButtonVariant } from '../../types/ui.props.types';
import { cn } from '../../utils/cn';

// Variant - Size

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-slate-800 text-white hover:bg-slate-700 focus-visible:ring-slate-600 ' +
    'disabled:bg-slate-400',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 ' +
    'focus-visible:ring-slate-400',
  ghost: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 ' + 'focus-visible:ring-slate-400',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
};

// Component

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
