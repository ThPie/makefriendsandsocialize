import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription, SubscriptionStatus } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Clock, X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrialCountdownBannerProps {
  className?: string;
  subscription?: SubscriptionStatus | null;
  isLoading?: boolean;
}

// Memoized component to prevent unnecessary re-renders
export const TrialCountdownBanner = memo(function TrialCountdownBanner({ 
  className,
  subscription: propSubscription,
  isLoading: propIsLoading,
}: TrialCountdownBannerProps) {
  // Use props if provided, otherwise fall back to hook (for standalone usage)
  const hookData = useSubscription();
  const subscription = propSubscription ?? hookData.subscription;
  const isLoading = propIsLoading ?? hookData.isLoading;
  
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    if (!subscription?.is_trialing || !subscription?.trial_ends_at) return;

    const calculateTimeLeft = () => {
      const endDate = new Date(subscription.trial_ends_at!);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return { days, hours, minutes };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [subscription?.is_trialing, subscription?.trial_ends_at]);

  // Check localStorage for daily dismissal
  useEffect(() => {
    const dismissedDate = localStorage.getItem('trial_banner_dismissed');
    if (dismissedDate) {
      const today = new Date().toDateString();
      if (dismissedDate === today) {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('trial_banner_dismissed', new Date().toDateString());
  };

  if (isLoading || !subscription?.is_trialing || !timeLeft || isDismissed) {
    return null;
  }

  const urgencyLevel = timeLeft.days <= 1 ? 'critical' : timeLeft.days <= 3 ? 'warning' : 'normal';

  const urgencyStyles = {
    critical: 'bg-destructive/10 border-destructive/30 text-destructive',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
    normal: 'bg-primary/10 border-primary/30 text-primary',
  };

  const bgGradient = {
    critical: 'from-destructive/5 to-destructive/10',
    warning: 'from-amber-500/5 to-amber-500/10',
    normal: 'from-primary/5 to-primary/10',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-4 mb-6',
        urgencyStyles[urgencyLevel],
        `bg-gradient-to-r ${bgGradient[urgencyLevel]}`,
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
            urgencyLevel === 'critical' ? 'bg-destructive/20' : urgencyLevel === 'warning' ? 'bg-amber-500/20' : 'bg-primary/20'
          )}>
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Free Trial Ending Soon
            </h3>
            <p className="text-sm opacity-90">
              {timeLeft.days > 0 ? (
                <>
                  <span className="font-semibold">{timeLeft.days}</span> day{timeLeft.days !== 1 ? 's' : ''},{' '}
                  <span className="font-semibold">{timeLeft.hours}</span> hour{timeLeft.hours !== 1 ? 's' : ''} remaining
                </>
              ) : timeLeft.hours > 0 ? (
                <>
                  <span className="font-semibold">{timeLeft.hours}</span> hour{timeLeft.hours !== 1 ? 's' : ''},{' '}
                  <span className="font-semibold">{timeLeft.minutes}</span> minute{timeLeft.minutes !== 1 ? 's' : ''} remaining
                </>
              ) : (
                <>
                  <span className="font-semibold">{timeLeft.minutes}</span> minute{timeLeft.minutes !== 1 ? 's' : ''} remaining
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant={urgencyLevel === 'critical' ? 'destructive' : 'default'}>
            <Link to="/membership">
              Upgrade Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-foreground/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 opacity-50 hover:opacity-100" />
          </button>
        </div>
      </div>
    </div>
  );
});
