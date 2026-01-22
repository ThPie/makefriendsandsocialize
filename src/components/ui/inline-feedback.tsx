import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface InlineFeedbackProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    containerClass: 'bg-green-500/10 border-green-500/20 text-green-400',
    iconClass: 'text-green-400',
  },
  error: {
    icon: XCircle,
    containerClass: 'bg-red-500/10 border-red-500/20 text-red-400',
    iconClass: 'text-red-400',
  },
  warning: {
    icon: AlertCircle,
    containerClass: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    iconClass: 'text-yellow-400',
  },
  info: {
    icon: Info,
    containerClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    iconClass: 'text-blue-400',
  },
};

export function InlineFeedback({
  type,
  message,
  onDismiss,
  action,
  className,
}: InlineFeedbackProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-3 rounded-lg border text-sm',
        config.containerClass,
        className
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', config.iconClass)} />
        <span className="flex-1">{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="w-full border-current/20 hover:bg-current/10"
        >
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
}
