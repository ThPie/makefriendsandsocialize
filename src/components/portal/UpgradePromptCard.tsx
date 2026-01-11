import { Link } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Heart, Users, Calendar, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

type PromptVariant = 'minimal' | 'compact' | 'full';
type FeatureContext = 'dating' | 'network' | 'business' | 'events' | 'general';

interface UpgradePromptCardProps {
  variant?: PromptVariant;
  context?: FeatureContext;
  className?: string;
  lockedFeature?: string;
}

const contextConfig: Record<FeatureContext, { 
  title: string; 
  description: string; 
  icon: typeof Crown;
  benefits: string[];
  tier: 'member' | 'fellow';
}> = {
  dating: {
    title: 'Unlock Unlimited Match Reveals',
    description: 'Get unlimited access to reveal your matches and find your perfect connection.',
    icon: Heart,
    benefits: ['Unlimited match reveals', 'Priority matchmaking', 'Slow dating event access'],
    tier: 'member',
  },
  network: {
    title: 'Access The Network',
    description: 'Connect with like-minded professionals and request curated introductions.',
    icon: Users,
    benefits: ['Browse all member profiles', 'Request introductions', 'Attend networking events'],
    tier: 'fellow',
  },
  business: {
    title: 'List Your Business',
    description: 'Showcase your business to our exclusive community of professionals.',
    icon: Crown,
    benefits: ['Business listing in directory', 'AI-powered verification', 'Member introductions'],
    tier: 'fellow',
  },
  events: {
    title: 'Get Event Discounts',
    description: 'Enjoy member pricing on all exclusive events and experiences.',
    icon: Calendar,
    benefits: ['Up to 30% off events', 'Priority reservations', 'Bring guests for free'],
    tier: 'member',
  },
  general: {
    title: 'Upgrade Your Membership',
    description: 'Unlock exclusive features and get more from your membership.',
    icon: Sparkles,
    benefits: ['Unlimited match reveals', 'Network access', 'Event discounts'],
    tier: 'member',
  },
};

export function UpgradePromptCard({ 
  variant = 'compact', 
  context = 'general',
  className,
  lockedFeature,
}: UpgradePromptCardProps) {
  const { subscription, isLoading } = useSubscription();

  // Don't show for paying members
  if (isLoading || (subscription?.subscribed && !subscription?.is_trialing)) {
    return null;
  }

  // Don't show for Fellow tier if context doesn't require it
  if (subscription?.tier === 'fellow' && context !== 'general') {
    return null;
  }

  const config = contextConfig[context];
  const Icon = config.icon;

  if (variant === 'minimal') {
    return (
      <div className={cn(
        'flex items-center justify-between gap-4 p-3 rounded-lg bg-primary/5 border border-primary/20',
        className
      )}>
        <div className="flex items-center gap-2 text-sm">
          <Lock className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            {lockedFeature || 'This feature'} requires {config.tier === 'fellow' ? 'Fellow' : 'Member'} membership
          </span>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/membership">Upgrade</Link>
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('border-primary/20 bg-gradient-to-br from-primary/5 to-transparent', className)}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-foreground mb-1">{config.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
              <Button asChild size="sm">
                <Link to="/membership">
                  {subscription?.is_trialing ? 'Upgrade Now' : 'Start Free Trial'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={cn(
      'border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden',
      className
    )}>
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        
        <h2 className="font-display text-2xl text-foreground mb-3">{config.title}</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{config.description}</p>

        <div className="flex flex-col gap-2 mb-6 max-w-xs mx-auto">
          {config.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-foreground">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <Button asChild size="lg">
          <Link to="/membership">
            {subscription?.is_trialing ? 'Upgrade Now' : 'Start 7-Day Free Trial'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>

        {!subscription?.is_trialing && (
          <p className="text-xs text-muted-foreground mt-4">
            No credit card required • Cancel anytime
          </p>
        )}
      </CardContent>
    </Card>
  );
}
