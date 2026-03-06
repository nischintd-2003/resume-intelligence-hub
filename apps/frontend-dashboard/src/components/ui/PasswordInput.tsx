import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';
import { AUTH_COPY } from '../../constants/auth.constants';
import type { PasswordInputProps } from '../../types/ui.props.types';

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ hasError, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          hasError={hasError}
          className="pr-10"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? AUTH_COPY.FIELDS.HIDE_PASSWORD : AUTH_COPY.FIELDS.SHOW_PASSWORD}
          className={
            'absolute right-3 top-1/2 -translate-y-1/2 ' +
            'text-slate-400 hover:text-slate-600 ' +
            'focus:outline-none focus-visible:text-slate-800 ' +
            'transition-colors'
          }
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
