import { ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface VerificationBadgeProps {
  isVerified: boolean;
  verifiedAt?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function VerificationBadge({ 
  isVerified, 
  verifiedAt, 
  size = 'md',
  showTooltip = true 
}: VerificationBadgeProps) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const badge = (
    <div className="inline-flex items-center gap-1 text-emerald-500">
      <ShieldCheck className={sizeClasses[size]} />
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover text-popover-foreground">
          <div className="text-center">
            <p className="font-medium">Verified Member</p>
            {verifiedAt && (
              <p className="text-xs text-muted-foreground">
                Since {format(new Date(verifiedAt), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
