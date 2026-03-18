import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStrengthIndicator?: boolean;
  value?: string;
  error?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 10 characters', test: (p) => p.length >= 10 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  const passed = requirements.filter(req => req.test(password)).length;
  
  if (passed === 0) return { score: 0, label: '', color: '' };
  if (passed === 1) return { score: 25, label: 'Weak', color: 'bg-destructive' };
  if (passed === 2) return { score: 50, label: 'Fair', color: 'bg-orange-500' };
  if (passed === 3) return { score: 75, label: 'Good', color: 'bg-yellow-500' };
  return { score: 100, label: 'Strong', color: 'bg-green-500' };
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors = requirements.filter(req => !req.test(password)).map(req => req.label);
  return { isValid: errors.length === 0, errors };
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrengthIndicator = false, value = '', error, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const strength = getPasswordStrength(value);

    return (
      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 pointer-events-none z-10" />
          <Input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            value={value}
            className={cn(
              'bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 pl-10 pr-12 focus:border-primary/50 focus:ring-primary/20',
              error && 'border-destructive focus:border-destructive',
              className
            )}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <X className="h-3.5 w-3.5" />
            {error}
          </p>
        )}

        {showStrengthIndicator && value.length > 0 && (
          <div className="space-y-2">
            {/* Strength Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn('h-full transition-all duration-300', strength.color)}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
              {strength.label && (
                <span className={cn(
                  'text-xs font-medium',
                  strength.score <= 25 && 'text-destructive',
                  strength.score === 50 && 'text-orange-400',
                  strength.score === 75 && 'text-yellow-400',
                  strength.score === 100 && 'text-green-400'
                )}>
                  {strength.label}
                </span>
              )}
            </div>

            {/* Requirements Checklist */}
            <div className="grid grid-cols-2 gap-1">
              {requirements.map((req) => {
                const passed = req.test(value);
                return (
                  <div
                    key={req.label}
                    className={cn(
                      'flex items-center gap-1.5 text-xs transition-colors',
                      passed ? 'text-green-400' : 'text-white/40'
                    )}
                  >
                    {passed ? (
                      <Check className="h-3 w-3 shrink-0" />
                    ) : (
                      <X className="h-3 w-3 shrink-0" />
                    )}
                    <span>{req.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
