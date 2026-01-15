import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ className, error, success, icon, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              {icon}
            </div>
          )}
          <Input
            ref={ref}
            className={cn(
              'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20',
              icon && 'pl-10',
              error && 'border-destructive focus:border-destructive',
              success && 'border-green-500/50 focus:border-green-500',
              className
            )}
            {...props}
          />
          {(error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {error && <X className="h-4 w-4 text-destructive" />}
              {success && !error && <Check className="h-4 w-4 text-green-500" />}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <X className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';
