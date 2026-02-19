import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { Button } from '@/components/ui/button';

interface PendingMemberBannerProps {
  className?: string;
}

export function PendingMemberBanner({ className }: PendingMemberBannerProps) {
  return (
    <div className={`bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Clock className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-amber-600 dark:text-amber-400">Application Under Review</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your membership application is being reviewed by our team. You'll have full access to member features once approved. 
            We typically respond within 48 hours.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button asChild variant="outline" size="sm" className="gap-1">
              <TransitionLink to="/portal/profile">
                Edit Profile <ArrowRight className="h-3 w-3" />
              </TransitionLink>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <TransitionLink to="/events">Browse Events</TransitionLink>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
